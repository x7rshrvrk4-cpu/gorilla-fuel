"use client";

import { useState } from "react";
import { submitCommunity, type SubmitResult } from "../lib/communityProducts";

/**
 * Shared community-submission primitives. The shell owns the card chrome, header,
 * read-only barcode, name + brand fields, and the submitting/submitted/error state
 * machine + success panel. Per-type forms (Alcohol/Food/Supplement/Other) supply
 * their extra fields as children and a buildPayload() that reads their own state.
 */

export const inputCls =
  "w-full rounded-sm border border-line bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted/50 focus:border-gold focus:outline-none";
export const labelCls =
  "block text-[10px] uppercase tracking-[0.2em] text-muted mb-1";

/** Common field values handed to buildPayload (already trimmed). */
export type CommonFields = { name: string; brand: string; barcode: string };

/** buildPayload returns the row to POST, or an error string to block submit. */
export type BuildResult =
  | { ok: true; payload: Record<string, unknown> }
  | { ok: false; error: string };

type ShellProps = {
  barcode: string;
  /** Supabase table to POST to (e.g. "community_alcohol_products"). */
  table: string;
  initialName?: string;
  initialBrand?: string;
  /** Which external source pre-filled the form, shown as a badge. */
  dataSource?: string;
  /** Header eyebrow + subtitle. */
  headerTitle?: string;
  headerSubtitle?: string;
  namePlaceholder?: string;
  brandPlaceholder?: string;
  /** Hide the Brand field (e.g. the minimal Other form). */
  showBrand?: boolean;
  submitLabel?: string;
  successTitle?: string;
  successMessage?: string;
  /** Build the per-type payload from common + local (closure) state. */
  buildPayload: (common: CommonFields) => BuildResult;
  /** Extra fields rendered between name/brand and the submit button. */
  children?: React.ReactNode;
};

export function CommunitySubmitShell({
  barcode,
  table,
  initialName = "",
  initialBrand = "",
  dataSource,
  headerTitle = "KNOW THIS PRODUCT?",
  headerSubtitle = "Help the community — your data gets reviewed before it goes live.",
  namePlaceholder = "e.g. Product name",
  brandPlaceholder = "e.g. Brand",
  showBrand = true,
  submitLabel = "Submit This Product",
  successTitle = "Submitted!",
  successMessage = "Thanks — our team will review and verify it shortly. Once approved it'll show up for everyone scanning this barcode.",
  buildPayload,
  children,
}: ShellProps) {
  const [name, setName] = useState(initialName);
  const [brand, setBrand] = useState(initialBrand);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Product name is required.");
      return;
    }

    const built = buildPayload({ name: name.trim(), brand: brand.trim(), barcode });
    if (!built.ok) {
      setError(built.error);
      return;
    }

    setSubmitting(true);
    const res: SubmitResult = await submitCommunity(table, built.payload);
    setSubmitting(false);

    if (res.ok) {
      setSubmitted(true);
    } else {
      // Surface the real status/message so failures are diagnosable, not silent.
      setError(
        `Submission failed (${res.status})${res.message ? `: ${res.message}` : ""} — please try again.`
      );
    }
  }

  if (submitted) {
    return (
      <div className="gorilla-card mt-4 rounded-sm p-6 text-center">
        <p className="font-display text-xl text-gold">{successTitle}</p>
        <p className="mt-2 text-sm text-muted">{successMessage}</p>
      </div>
    );
  }

  return (
    <div className="gorilla-card mt-4 overflow-hidden rounded-sm">
      {/* Header */}
      <div className="border-b border-line bg-surface px-5 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="font-display text-sm tracking-[0.3em] text-gold">{headerTitle}</p>
            <p className="mt-0.5 text-xs text-muted">{headerSubtitle}</p>
          </div>
          {dataSource && (
            <span className="rounded-sm border border-sky-400/50 bg-sky-400/10 px-2 py-1 font-display text-[9px] uppercase tracking-[0.18em] text-sky-300">
              Pre-filled from {dataSource}
            </span>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 p-5">
        {/* Barcode — read-only */}
        <div>
          <label className={labelCls}>Barcode (auto-filled)</label>
          <input
            type="text"
            value={barcode}
            readOnly
            className={`${inputCls} cursor-default opacity-60`}
          />
        </div>

        {/* Name + Brand */}
        <div className={showBrand ? "grid gap-4 sm:grid-cols-2" : ""}>
          <div>
            <label className={labelCls}>Product Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={namePlaceholder}
              required
              autoComplete="off"
              className={inputCls}
            />
          </div>
          {showBrand && (
            <div>
              <label className={labelCls}>Brand</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder={brandPlaceholder}
                autoComplete="off"
                className={inputCls}
              />
            </div>
          )}
        </div>

        {/* Per-type extra fields */}
        {children}

        {error && (
          <p className="rounded-sm border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-sm bg-gold px-4 py-3 font-display text-sm tracking-widest text-background transition-colors hover:bg-gold/90 disabled:opacity-50"
        >
          {submitting ? "Submitting…" : submitLabel}
        </button>
      </form>
    </div>
  );
}
