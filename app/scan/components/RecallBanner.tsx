"use client";

import { useEffect, useState } from "react";
import type { RecallNotice } from "../../api/recalls/route";

type State = { phase: "idle" | "error" } | { phase: "loaded"; recalls: RecallNotice[] };

export default function RecallBanner({ brand, productName }: { brand?: string; productName?: string }) {
  const [state, setState] = useState<State>({ phase: "idle" });

  useEffect(() => {
    if (!brand && !productName) return;
    let cancelled = false;
    const url = new URL("/api/recalls", window.location.origin);
    if (brand) url.searchParams.set("brand", brand);
    if (productName) url.searchParams.set("product", productName);

    fetch(url.toString())
      .then((res) => res.json())
      .then((data: { recalls?: RecallNotice[] }) => {
        if (!cancelled) setState({ phase: "loaded", recalls: data.recalls ?? [] });
      })
      .catch(() => {
        if (!cancelled) setState({ phase: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [brand, productName]);

  if (state.phase !== "loaded" || state.recalls.length === 0) return null;

  return (
    <div className="border-b border-red-500/40 bg-red-500/10 p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-xl text-red-400" aria-hidden>
          ⚠
        </span>
        <div>
          <h3 className="font-display text-lg tracking-wide text-red-400">Active FDA Recall or Enforcement Action</h3>
          <p className="mt-1 text-xs text-red-200/80">
            Open FDA lists at least one ongoing enforcement action matching this product or brand. Review the details below before consuming.
          </p>
          <ul className="mt-3 space-y-2">
            {state.recalls.map((r, i) => (
              <li key={i} className="rounded-sm border border-red-500/30 bg-background/30 p-3 text-xs text-foreground/80">
                <p className="font-medium text-foreground">{r.productDescription || "Unnamed product"}</p>
                {r.reason && <p className="mt-1 text-foreground/70">Reason: {r.reason}</p>}
                <p className="mt-1 text-[11px] text-foreground/50">
                  {[r.classification, r.status, r.recallInitiationDate].filter(Boolean).join(" · ")}
                </p>
              </li>
            ))}
          </ul>
          <a
            href="https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts"
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block text-xs text-red-300 underline decoration-red-500/40 underline-offset-4 hover:text-red-200"
          >
            View Open FDA Enforcement Database →
          </a>
        </div>
      </div>
    </div>
  );
}
