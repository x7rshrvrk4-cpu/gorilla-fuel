"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { BrowserMultiFormatReader as BrowserMultiFormatReaderType } from "@zxing/library";

type Props = {
  active: boolean;
  onDetected: (barcode: string) => void;
  onClose: () => void;
};

type CameraStatus = "idle" | "starting" | "live" | "denied" | "unsupported" | "error";

type TorchCapabilities = MediaTrackCapabilities & { torch?: boolean };
type TorchConstraintSet = MediaTrackConstraintSet & { torch?: boolean };

// The focusMode constraint isn't in standard TS DOM types but is widely
// supported on iOS Safari and Android Chrome to enable hardware autofocus.
type ExtendedVideoConstraints = MediaTrackConstraints & {
  advanced?: (MediaTrackConstraintSet & { focusMode?: string })[];
};

export default function BarcodeScanner({ active, onDetected, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const readerRef = useRef<BrowserMultiFormatReaderType | null>(null);
  const lastCodeRef = useRef<{ code: string; at: number } | null>(null);
  // Keep onDetected in a ref so the scan loop never lists it as a dep —
  // prevents restarting the entire scanner after every successful scan result.
  const onDetectedRef = useRef(onDetected);
  const [status, setStatus] = useState<CameraStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [torchSupported, setTorchSupported] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [hit, setHit] = useState(false);

  useEffect(() => {
    onDetectedRef.current = onDetected;
  }, [onDetected]);

  useEffect(() => {
    if (!active) {
      setStatus("idle");
      return;
    }

    let cancelled = false;

    function handleCode(code: string) {
      const now = Date.now();
      const last = lastCodeRef.current;
      // 3-second debounce: suppress re-fires of the same code while API loads.
      if (last && last.code === code && now - last.at < 3000) return;
      lastCodeRef.current = { code, at: now };
      // Vibrate immediately — before API call — for instant tactile feedback.
      if (typeof navigator.vibrate === "function") navigator.vibrate([50]);
      setHit(true);
      window.setTimeout(() => setHit(false), 500);
      onDetectedRef.current(code);
    }

    function checkTorch(stream: MediaStream) {
      const track = stream.getVideoTracks()[0];
      const caps = track?.getCapabilities?.() as TorchCapabilities | undefined;
      setTorchSupported(Boolean(caps?.torch));
    }

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus("unsupported");
        return;
      }

      setStatus("starting");
      setErrorMessage(null);
      setTorchSupported(false);
      setTorchOn(false);

      // 720p is the sweet spot for barcode detection: enough resolution to read
      // EAN-13/UPC-A reliably, but low enough that the camera sensor can deliver
      // frames quickly and the decoder processes each one faster. 1080p+ actually
      // slows detection because it increases both camera init time and per-frame
      // pixel count without meaningfully improving read rates for typical barcodes.
      const videoConstraints: ExtendedVideoConstraints = {
        facingMode: "environment",
        width: { ideal: 1280 },
        height: { ideal: 720 },
        advanced: [{ focusMode: "continuous" }],
      };

      // Native BarcodeDetector is available in iOS Safari 17+ and Chrome 83+.
      // It runs in a browser-native (often hardware-accelerated) pipeline and
      // is dramatically faster than any JS/WASM library on mobile.
      const hasNative =
        typeof window !== "undefined" && "BarcodeDetector" in window;

      try {
        if (hasNative) {
          // ─── Native BarcodeDetector path ───
          const stream = await navigator.mediaDevices.getUserMedia({
            video: videoConstraints as MediaTrackConstraints,
          });
          if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }

          streamRef.current = stream;
          const video = videoRef.current;
          if (!video) { stream.getTracks().forEach((t) => t.stop()); return; }

          video.srcObject = stream;
          await video.play();
          if (cancelled) return;

          // Show camera feed immediately after play() resolves — no need to
          // wait for the first decode result.
          setStatus("live");
          checkTorch(stream);

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const DetectorCtor = (window as any).BarcodeDetector as {
            new(opts?: { formats?: string[] }): {
              detect(src: HTMLVideoElement): Promise<{ rawValue: string }[]>;
            };
          };
          const detector = new DetectorCtor({
            formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128"],
          });

          // Tight async loop: run detect() as fast as the hardware allows.
          // Avoids requestAnimationFrame's 0–16 ms scheduling gap — each iteration
          // starts the moment the previous detect() Promise resolves rather than
          // waiting for the next display refresh tick.
          void (async () => {
            while (!cancelled) {
              try {
                const results = await detector.detect(video!);
                if (!cancelled && results.length > 0) handleCode(results[0].rawValue);
              } catch {
                // Single-frame decode error — not fatal, keep looping.
              }
            }
          })();
        } else {
          // ─── ZXing fallback path ───
          // Lazy-import so the WASM bundle doesn't block the initial page load.
          const { BrowserMultiFormatReader } = await import("@zxing/library");
          if (cancelled) return;

          const reader = new BrowserMultiFormatReader();
          readerRef.current = reader;

          const videoEl = videoRef.current!;

          // Listen for the video's playing event so we can show the camera
          // feed as soon as the stream is live — before the first decode result.
          let wentLive = false;
          const onPlayingWithFlag = () => {
            if (!cancelled) {
              wentLive = true;
              setStatus("live");
              const s = videoEl.srcObject;
              if (s instanceof MediaStream) {
                streamRef.current = s;
                checkTorch(s);
              }
            }
          };
          videoEl.addEventListener("playing", onPlayingWithFlag, { once: true });

          await reader.decodeFromConstraints(
            { video: videoConstraints as MediaTrackConstraints },
            videoEl,
            (result) => {
              if (!result || cancelled) return;
              handleCode(result.getText());
            }
          );
          videoEl.removeEventListener("playing", onPlayingWithFlag);

          // Fallback: if playing event never fired, set live now.
          if (!cancelled && !wentLive) {
            setStatus("live");
            const s = videoEl.srcObject;
            if (s instanceof MediaStream) {
              streamRef.current = s;
              checkTorch(s);
            }
          }
        }
      } catch (err) {
        if (cancelled) return;
        if (err instanceof DOMException && err.name === "NotAllowedError") {
          setStatus("denied");
        } else {
          setStatus("error");
          setErrorMessage(err instanceof Error ? err.message : "Camera failed to start.");
        }
      }
    }

    start();

    return () => {
      cancelled = true; // stops the while loop on its next iteration
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      readerRef.current?.reset();
      readerRef.current = null;
    };
  }, [active]); // onDetected accessed via onDetectedRef — not a dep

  const toggleTorch = useCallback(async () => {
    // Support both native path (streamRef) and ZXing path (video.srcObject).
    const stream =
      streamRef.current ??
      (videoRef.current?.srcObject instanceof MediaStream ? videoRef.current.srcObject : null);
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    if (!track) return;
    const next = !torchOn;
    try {
      await track.applyConstraints({ advanced: [{ torch: next } as TorchConstraintSet] });
      setTorchOn(next);
    } catch {
      // device claimed torch support but rejected the constraint
    }
  }, [torchOn]);

  const displayStatus: CameraStatus = active ? status : "idle";

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-[60] overflow-hidden bg-black">
      <video
        ref={videoRef}
        muted
        playsInline
        autoPlay
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
          displayStatus === "live" ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Close */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close scanner"
        className="absolute right-5 top-5 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black/40 text-white backdrop-blur transition-colors hover:border-gold hover:text-gold"
        style={{ top: "max(1.25rem, env(safe-area-inset-top))" }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>

      {/* Torch toggle — top left */}
      {displayStatus === "live" && torchSupported && (
        <button
          type="button"
          onClick={toggleTorch}
          aria-label={torchOn ? "Turn off flashlight" : "Turn on flashlight"}
          className={`absolute left-5 z-20 flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur transition-colors ${
            torchOn
              ? "border-gold bg-gold text-background"
              : "border-white/25 bg-black/40 text-gold hover:border-gold"
          }`}
          style={{ top: "max(1.25rem, env(safe-area-inset-top))" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18h6M10 22h4M12 2a6 6 0 0 0-6 6c0 2.2 1.1 3.7 2 4.8.6.7 1 1.3 1 2.2h6c0-.9.4-1.5 1-2.2.9-1.1 2-2.6 2-4.8a6 6 0 0 0-6-6Z" />
          </svg>
        </button>
      )}

      {/* Targeting overlay */}
      {displayStatus === "live" && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-7 px-6">
          <p className="font-display text-2xl tracking-[0.4em] text-gold drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)] sm:text-3xl">
            POINT AT BARCODE
          </p>

          <div className="relative h-64 w-64 overflow-hidden rounded-2xl sm:h-80 sm:w-80">
            <span
              className={`absolute left-0 top-0 h-16 w-16 rounded-tl-2xl border-l-[6px] border-t-[6px] transition-colors duration-150 ${
                hit ? "border-emerald-400" : "border-gold"
              }`}
            />
            <span
              className={`absolute right-0 top-0 h-16 w-16 rounded-tr-2xl border-r-[6px] border-t-[6px] transition-colors duration-150 ${
                hit ? "border-emerald-400" : "border-gold"
              }`}
            />
            <span
              className={`absolute bottom-0 left-0 h-16 w-16 rounded-bl-2xl border-b-[6px] border-l-[6px] transition-colors duration-150 ${
                hit ? "border-emerald-400" : "border-gold"
              }`}
            />
            <span
              className={`absolute bottom-0 right-0 h-16 w-16 rounded-br-2xl border-b-[6px] border-r-[6px] transition-colors duration-150 ${
                hit ? "border-emerald-400" : "border-gold"
              }`}
            />

            {hit && <span className="absolute inset-3 rounded-xl bg-emerald-400/15 transition-opacity duration-150" />}

            {!hit && (
              <span className="scanner-laser absolute left-4 right-4 h-[3px] rounded-full bg-gold shadow-[0_0_18px_4px_rgba(255,215,0,0.85)]" />
            )}
          </div>

          <p className="text-sm text-white/70">Hold steady — Gorilla Fuel scans automatically</p>
        </div>
      )}

      {/* Loading / error states */}
      {displayStatus !== "live" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-8 text-center">
          {displayStatus === "starting" && (
            <>
              <Image
                src="/gorilla-fuel-icon.png"
                alt="Gorilla Fuel"
                width={64}
                height={64}
                unoptimized
                loading="lazy"
                className="h-16 w-16 animate-pulse rounded-sm object-contain drop-shadow-[0_0_24px_rgba(255,215,0,0.45)]"
              />
              <p className="text-sm text-white/70">Activating camera…</p>
            </>
          )}
          {displayStatus === "denied" && (
            <p className="max-w-sm text-sm text-white">
              Camera access denied. Allow camera permissions in your browser
              settings, then reopen the scanner — or use manual barcode entry.
            </p>
          )}
          {displayStatus === "unsupported" && (
            <p className="max-w-sm text-sm text-white">
              This browser doesn&apos;t support live camera scanning. Use the
              manual barcode entry instead.
            </p>
          )}
          {displayStatus === "error" && (
            <p className="max-w-sm text-sm text-white">
              {errorMessage ?? "Something went wrong starting the camera."}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
