"use client";

import { useState } from "react";
import NotifyMeForm from "./NotifyMeForm";

/**
 * Low-emphasis wrapper for NotifyMeForm: shows a small text link that expands
 * the email capture only when tapped. Keeps the not-found screen focused on the
 * primary search-and-attach action instead of a co-equal email block.
 */
export default function NotifyMeExpandable({
  barcode,
  productName,
}: {
  barcode: string;
  productName?: string | null;
}) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-muted/70 underline-offset-4 transition-colors hover:text-gold hover:underline"
      >
        or get notified when we add it →
      </button>
    );
  }

  return <NotifyMeForm barcode={barcode} productName={productName} />;
}
