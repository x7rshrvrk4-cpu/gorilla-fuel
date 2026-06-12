/**
 * Deep-link scroll + gold highlight for product cards (#product-<id>).
 *
 * Heavy tabs (the 172-wine list) render late and keep reflowing, so any fixed
 * scroll schedule loses the race. This polls: waits for the element to exist,
 * then keeps instant-scrolling until the card is verifiably positioned in the
 * viewport for two consecutive ticks, then holds the gold outline for 2s.
 */
export function scrollToProduct(pid: string): () => void {
  let ticks = 0;
  let stable = 0;

  const interval = window.setInterval(() => {
    ticks++;
    const el = document.getElementById(`product-${pid}`);

    if (!el) {
      if (ticks > 60) window.clearInterval(interval); // ~18s — give up quietly
      return;
    }

    el.style.outline = "2px solid #ffd700";
    el.style.outlineOffset = "2px";

    const r = el.getBoundingClientRect();
    const inView = r.top >= 0 && r.top < window.innerHeight * 0.75;
    if (inView) {
      stable++;
      if (stable >= 2) {
        window.clearInterval(interval);
        window.setTimeout(() => {
          el.style.outline = "";
          el.style.outlineOffset = "";
        }, 2000);
      }
    } else {
      stable = 0;
      el.scrollIntoView({ behavior: "auto", block: "center" });
    }
  }, 300);

  return () => window.clearInterval(interval);
}
