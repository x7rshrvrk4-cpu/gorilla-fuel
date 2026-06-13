"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { scrollToProduct } from "../lib/scrollHighlight";

/**
 * Reads ?p=<product-id> from the URL, scrolls to the element with
 * id="product-<id>", and flashes a gold outline. Re-scrolls while the page
 * layout settles so long card lists can't push the target out of view.
 *
 * Reactive to ?p= (via useSearchParams) so it re-fires when the user taps a
 * search result for the page they're already on — a same-page, query-only
 * navigation that does not remount this component. (The old mount-only version
 * silently did nothing in that case — the "dead tap" on Gorilla Intel pages.)
 */
export default function DeepLinkHighlighter() {
  const searchParams = useSearchParams();
  const pid = searchParams.get("p");
  useEffect(() => {
    if (!pid) return;
    return scrollToProduct(pid);
  }, [pid]);
  return null;
}
