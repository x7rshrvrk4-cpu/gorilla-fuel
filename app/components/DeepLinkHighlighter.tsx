"use client";

import { useEffect } from "react";
import { scrollToProduct } from "../lib/scrollHighlight";

/**
 * Reads ?p=<product-id> from the URL, scrolls to the element with
 * id="product-<id>", and flashes a gold outline. Re-scrolls while the page
 * layout settles so long card lists can't push the target out of view.
 */
export default function DeepLinkHighlighter() {
  useEffect(() => {
    const pid = new URLSearchParams(window.location.search).get("p");
    if (!pid) return;
    return scrollToProduct(pid);
  }, []);
  return null;
}
