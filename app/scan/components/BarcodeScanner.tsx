"use client";

import { useEffect, useRef, useState } from "react";
import type { BrowserMultiFormatReader as BrowserMultiFormatReaderType } from "@zxing/library";

type Props = {
  active: boolean;
  onDetected: (barcode: string) => void;
};

type CameraStatus = "idle" | "starting" | "live" | "denied" | "unsupported" | "error";

export default function BarcodeScanner({ active, onDetected }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const readerRef = useRef<BrowserMultiFormatReaderType | null>(null);
  const lastCodeRef = useRef<{ code: string; at: number } | null>(null);
  const [status, setStatus] = useState<CameraStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
          onDetected(code);
        });

        if (!cancelled) setStatus("live");
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
  }, [active, onDetected]);

  const displayStatus: CameraStatus = active ? status : "idle";

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm border border-line bg-black sm:aspect-video">
      <video
        ref={videoRef}
        muted
        playsInline
        className={`h-full w-full object-cover ${displayStatus === "live" ? "opacity-100" : "opacity-0"}`}
      />

      {displayStatus === "live" && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-1/3 w-4/5 max-w-md rounded-sm border-2 border-gold/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]">
            <div className="absolute left-1/2 top-1/2 h-px w-4/5 max-w-md -translate-x-1/2 -translate-y-1/2 bg-gold/70" />
          </div>
        </div>
      )}

      {displayStatus !== "live" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
          {displayStatus === "idle" && (
            <p className="text-sm text-muted">Camera is off. Tap start to scan.</p>
          )}
          {displayStatus === "starting" && (
            <>
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
              <p className="text-sm text-muted">Activating camera…</p>
            </>
          )}
          {displayStatus === "denied" && (
            <p className="max-w-sm text-sm text-foreground">
              Camera access denied. Allow camera permissions in your browser
              settings, then restart the scanner — or use the manual barcode
              entry below.
            </p>
          )}
          {displayStatus === "unsupported" && (
            <p className="max-w-sm text-sm text-foreground">
              This browser doesn&apos;t support live camera scanning. Use the
              manual barcode entry below instead.
            </p>
          )}
          {displayStatus === "error" && (
            <p className="max-w-sm text-sm text-foreground">
              {errorMessage ?? "Something went wrong starting the camera."}
            </p>
          )}
        </div>
      )}

      {displayStatus === "live" && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-background/80 px-4 py-1.5 font-display text-sm tracking-[0.2em] text-gold backdrop-blur">
          SCANNING — HOLD STEADY
        </div>
      )}
    </div>
  );
}
