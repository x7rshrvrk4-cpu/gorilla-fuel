"use client";

import { useEffect } from "react";

/**
 * Reads ?p=<product-id> from the URL, scrolls to the element with
 * id="product-<id>", and flashes a gold outline. Drop into any page whose
 * cards carry product-<id> ids (Gorilla Intel tiers, etc.).
 */
export default function DeepLinkHighlighter() {
  useEffect(() => {
    const pid = new URLSearchParams(window.location.search).get("p");
    if (!pid) return;
    const t = window.setTimeout(() => {
      const el = document.getElementById(`product-${pid}`);
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.style.outline = "2px solid #ffd700";
      el.style.outlineOffset = "2px";
      window.setTimeout(() => {
        el.style.outline = "";
        el.style.outlineOffset = "";
      }, 2500);
    }, 250);
    return () => window.clearTimeout(t);
  }, []);
  return null;
}
