"use client";

import { usePathname, useRouter } from "next/navigation";

/**
 * Floating "back to previous page" button — same gold-circle style as
 * BackToTop, mirrored to the bottom-LEFT so the two never overlap. Rendered
 * globally (app/layout.tsx), so every page has it. Hidden on the home page
 * (nothing to go back to); falls back to home if there's no in-app history.
 */
export default function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  if (pathname === "/") return null;

  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) router.back();
    else router.push("/");
  };

  return (
    <button
      type="button"
      aria-label="Back to previous page"
      onClick={goBack}
      className="fixed left-5 z-40 flex h-12 w-12 touch-manipulation items-center justify-center rounded-full bg-gold text-background shadow-[0_4px_14px_rgba(0,0,0,0.45)] transition-transform hover:scale-105"
      // Lifted clear of the iOS Safari bottom toolbar / home indicator, matching BackToTop.
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 2.5rem)" }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>
  );
}
