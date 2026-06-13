"use client";

import { useEffect, useState } from "react";

/**
 * Floating back-to-top button for long listing pages. Hidden at the top of
 * the page; fades in after 300px of scroll; scrolls back to the top.
 *
 * iOS Safari notes (this button kept mis-behaving on iPhone):
 *  - POSITION: the app does not set `viewport-fit=cover`, so
 *    env(safe-area-inset-bottom) is 0 on iOS. The old `max(1.25rem, env())`
 *    placed the button only ~20px off the bottom — inside Safari's bottom
 *    toolbar / home-indicator tap zone, where taps get captured by the
 *    toolbar (revealing it and lurching the page) instead of hitting the
 *    button. We now lift it well clear of that zone (base offset + any inset).
 *  - SCROLL: we use the legacy two-arg `window.scrollTo(0, 0)`, which is
 *    supported on every iOS Safari version (the options-object/`behavior`
 *    form is unreliable on older iOS). The global CSS `scroll-behavior:
 *    smooth` animates it. `top: 0` can only ever go to the top — never the
 *    bottom.
 *  - `touch-manipulation` removes the 300ms tap delay / double-tap-zoom.
 */
export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    // Legacy two-arg form: supported on every iOS Safari version, and animated
    // by the global `html { scroll-behavior: smooth }` rule. (0,0) is the top.
    if (typeof window.scrollTo === "function") {
      window.scrollTo(0, 0);
      return;
    }
    // Fallback only for engines without window.scrollTo (instant, still top).
    // Not run after scrollTo on purpose — a scrollTop assignment would cancel
    // the smooth animation on iOS.
    if (document.scrollingElement) {
      document.scrollingElement.scrollTop = 0;
    } else {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  };

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={scrollToTop}
      className={`fixed right-5 z-40 flex h-12 w-12 touch-manipulation items-center justify-center rounded-full bg-gold text-background shadow-[0_4px_14px_rgba(0,0,0,0.45)] transition-opacity duration-300 hover:scale-105 ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      // Lifted clear of the iOS Safari bottom toolbar / home indicator. Base
      // 2.5rem (40px) keeps it tappable even when env() is 0 (no viewport-fit
      // cover); the inset is added on top when the platform reports one.
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 2.5rem)" }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 14l6-6 6 6" />
      </svg>
    </button>
  );
}
