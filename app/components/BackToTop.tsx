"use client";

import { useEffect, useState } from "react";

/**
 * Floating back-to-top button for long listing pages. Hidden at the top of
 * the page; fades in after 300px of scroll; smooth-scrolls back to the top.
 */
export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-gold text-background shadow-[0_4px_14px_rgba(0,0,0,0.45)] transition-all duration-300 hover:scale-105 ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      style={{ bottom: "max(1.25rem, env(safe-area-inset-bottom, 1.25rem))" }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 14l6-6 6 6" />
      </svg>
    </button>
  );
}
