"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { BrowserMultiFormatReader as BrowserMultiFormatReaderType } from "@zxing/library";

type Props = {
  active: boolean;
  onDetected: (barcode: string) => void;
  onClose: () => void;
};

type CameraStatus = "idle" | "starting" | "live" | "denied" | "unsupported" | "error";

// `torch` is a real, widely-supported capability/constraint on mobile Chrome and
// Safari, but it isn't in the standard DOM typings — extend locally.
type TorchCapabilities = MediaTrackCapabilities & { torch?: boolean };
type TorchConstraintSet = MediaTrackConstraintSet & { torch?: boolean };

const TOOLTIP_KEY = "gorilla-torch-tip-dismissed";

export default function BarcodeScanner({ active, onDetected, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const readerRef = useRef<BrowserMultiFormatReaderType | null>(null);
  const lastCodeRef = useRef<{ code: string; at: number } | null>(null);
  // Stable ref so the ZXing effect never tears down and restarts just because
  // the parent re-renders and hands us a new onDetected function reference.
  const onDetectedRef = useRef(onDetected);
  onDetectedRef.current = onDetected;
  const [status, setStatus] = useState<CameraStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [torchSupported, setTorchSupported] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [hit, setHit] = useState(false);
  const [pressing, setPressing] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (!active) {
      readerRef.current?.reset();
      return;
    }

    let cancelled = false;

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus("unsupported");
        return;
      }

      setStatus("starting");
      setErrorMessage(null);
      setTorchSupported(false);
      setTorchOn(false);

      try {
        const { BrowserMultiFormatReader } = await import("@zxing/library");
        if (cancelled) return;

        const reader = new BrowserMultiFormatReader();
        readerRef.current = reader;

        const devices = await reader.listVideoInputDevices();
        const backCamera = devices.find((d) =>
          /back|rear|environment/i.test(d.label)
        );
        const deviceId = backCamera?.deviceId ?? devices[devices.length - 1]?.deviceId;

        if (cancelled || !videoRef.current) return;

        await reader.decodeFromVideoDevice(deviceId, videoRef.current, (result) => {
          if (!result || cancelled) return;

          const code = result.getText();
          const now = Date.now();
          const last = lastCodeRef.current;

          // Debounce: ignore the same code re-fired within 3 seconds
          if (last && last.code === code && now - last.at < 3000) return;

          lastCodeRef.current = { code, at: now };

          if (typeof navigator.vibrate === "function") navigator.vibrate(100);
          setHit(true);
          window.setTimeout(() => setHit(false), 500);

          // Use the stable ref — never the prop directly — so calling the parent
          // callback can't trigger an effect cleanup that kills the scanner.
          onDetectedRef.current(code);
        });

        if (cancelled) return;
        setStatus("live");

        const stream = videoRef.current.srcObject;
        if (stream instanceof MediaStream) {
          const track = stream.getVideoTracks()[0];
          const capabilities = track?.getCapabilities?.() as TorchCapabilities | undefined;
          setTorchSupported(Boolean(capabilities?.torch));
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
      cancelled = true;
      readerRef.current?.reset();
      readerRef.current = null;
    };
  }, [active]);

  // Show first-visit tooltip when torch is detected as supported
  useEffect(() => {
    if (!torchSupported) return;
    try {
      if (!localStorage.getItem(TOOLTIP_KEY)) setShowTooltip(true);
    } catch {}
  }, [torchSupported]);

  // Auto-dismiss tooltip after 3 seconds
  useEffect(() => {
    if (!showTooltip) return;
    const t = window.setTimeout(() => {
      setShowTooltip(false);
      try { localStorage.setItem(TOOLTIP_KEY, "1"); } catch {}
    }, 3000);
    return () => window.clearTimeout(t);
  }, [showTooltip]);

  const toggleTorch = useCallback(async () => {
    // Dismiss first-visit tooltip on first tap
    if (showTooltip) {
      setShowTooltip(false);
      try { localStorage.setItem(TOOLTIP_KEY, "1"); } catch {}
    }

    // Tap pulse animation
    setPressing(true);
    window.setTimeout(() => setPressing(false), 350);

    const stream = videoRef.current?.srcObject;
    if (!(stream instanceof MediaStream)) return;
    const track = stream.getVideoTracks()[0];
    if (!track) return;

    const next = !torchOn;
    try {
      await track.applyConstraints({ advanced: [{ torch: next } as TorchConstraintSet] });
      setTorchOn(next);
    } catch {
      // Torch activation failed (common on iOS Safari) — hide the button silently
      setTorchSupported(false);
    }
  }, [torchOn, showTooltip]);

  const displayStatus: CameraStatus = active ? status : "idle";

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-[60] overflow-hidden bg-black">
      <video
        ref={videoRef}
        muted
        playsInline
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

      {/* Torch toggle — bottom right corner */}
      {displayStatus === "live" && torchSupported && (
        <div
          className="absolute right-5 z-20 flex flex-col items-end gap-2"
          style={{ bottom: "max(2rem, env(safe-area-inset-bottom, 2rem))" }}
        >
          {/* First-visit tooltip */}
          {showTooltip && (
            <div className="animate-fade flex flex-col items-end">
              <div className="whitespace-nowrap rounded border border-gold/30 bg-black/85 px-3 py-1.5 text-xs text-white/90 backdrop-blur">
                Tap for flashlight — helps with shiny cans
              </div>
              {/* Arrow pointing down toward button */}
              <div className="mr-4 h-0 w-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-black/85" />
            </div>
          )}

          {/* Button */}
          <button
            type="button"
            onClick={toggleTorch}
            aria-label={torchOn ? "Turn off flashlight" : "Turn on flashlight"}
            className={`flex h-12 w-12 items-center justify-center rounded-full border backdrop-blur transition-all duration-200 ${
              torchOn
                ? "border-gold bg-gold text-background"
                : "border-white/25 bg-black/50 text-gold hover:border-gold"
            } ${pressing ? "torch-tap" : ""}`}
          >
            {torchOn ? (
              /* ON — outline flashlight with light rays, drop-shadow glow */
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ filter: "drop-shadow(0 0 5px currentColor)" }}
              >
                {/* Light rays above head */}
                <line x1="12" y1="1" x2="12" y2="2.8" />
                <line x1="8.2" y1="2.2" x2="9.4" y2="3.8" />
                <line x1="15.8" y1="2.2" x2="14.6" y2="3.8" />
                {/* Head top bar */}
                <line x1="9" y1="5" x2="15" y2="5" />
                {/* Head trapezoidal shoulder */}
                <path d="M8 5l1.5 4.5h5L16 5" />
                {/* Body */}
                <rect x="9.5" y="9.5" width="5" height="11" rx="1.5" />
                {/* Lens indicator lit */}
                <circle cx="12" cy="16.5" r="1.5" fill="currentColor" />
              </svg>
            ) : (
              /* OFF — filled solid flashlight silhouette */
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                stroke="none"
              >
                {/* Top bar */}
                <rect x="9" y="4" width="6" height="1.5" rx="0.75" />
                {/* Head shoulder (trapezoid as filled path) */}
                <path d="M8 5.5h8l-1.5 5H9.5L8 5.5z" />
                {/* Body cylinder */}
                <rect x="9.5" y="10.5" width="5" height="10" rx="1.5" />
              </svg>
            )}
          </button>
        </div>
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

      {/* Status states */}
      {displayStatus !== "live" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-8 text-center">
          {displayStatus === "starting" && (
            <>
              <span className="h-10 w-10 animate-spin rounded-full border-2 border-gold border-t-transparent" />
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
