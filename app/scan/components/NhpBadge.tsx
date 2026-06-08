"use client";

import { useEffect, useState } from "react";
import type { NhpVerification } from "../../api/nhp/route";

const SUPPLEMENT_TAG_HINTS = ["supplement", "dietary-supplement", "vitamin", "protein-powder", "sports-nutrition"];

function looksLikeSupplement(categoryTags: string[] | undefined): boolean {
  if (!categoryTags) return false;
  return categoryTags.some((tag) => SUPPLEMENT_TAG_HINTS.some((hint) => tag.includes(hint)));
}

type Props = {
  productName?: string;
  categoryTags?: string[];
};

export default function NhpBadge({ productName, categoryTags }: Props) {
  const [verification, setVerification] = useState<NhpVerification | null>(null);
  const eligible = looksLikeSupplement(categoryTags);

  useEffect(() => {
    if (!eligible || !productName) return;
    let cancelled = false;
    fetch(`/api/nhp?product=${encodeURIComponent(productName)}`)
      .then((res) => res.json())
      .then((data: NhpVerification) => {
        if (!cancelled) setVerification(data);
      })
      .catch(() => {
        if (!cancelled) setVerification({ verified: false });
      });
    return () => {
      cancelled = true;
    };
  }, [eligible, productName]);

  if (!eligible || !verification?.verified) return null;

  return (
    <span
      title={`Health Canada NPN ${verification.npn}`}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-sm border border-emerald-400/50 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-display uppercase tracking-[0.18em] text-emerald-300"
    >
      <span aria-hidden>✓</span>
      Health Canada Verified · NPN {verification.npn}
    </span>
  );
}
