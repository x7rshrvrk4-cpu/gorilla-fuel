"use client";

/*
 * Email capture for missed scans. Requires this Supabase table (run once —
 * also included in supabase/score-protection.sql):
 *
 * create table if not exists public.scan_notifications (
 *   id                    uuid        primary key default gen_random_uuid(),
 *   email                 text        not null,
 *   barcode               text        not null,
 *   product_name_if_known text,
 *   scanned_at            timestamptz not null default now(),
 *   notified              boolean     not null default false
 * );
 * alter table public.scan_notifications enable row level security;
 * create policy "Anon insert scan notifications"
 *   on public.scan_notifications for insert to anon with check (true);
 */

import { useState } from "react";

export default function NotifyMeForm({ barcode, productName }: { barcode: string; productName?: string | null }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) || status === "sending") return;
    setStatus("sending");
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
      const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
      if (url && key) {
        await fetch(`${url}/rest/v1/scan_notifications`, {
          method: "POST",
          headers: {
            apikey: key,
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify({
            email: trimmed,
            barcode,
            product_name_if_known: productName ?? null,
          }),
        });
      }
    } catch {
      // fire-and-forget — never surface backend errors for an email capture
    }
    setStatus("done");
  };

  if (status === "done") {
    return (
      <p className="mt-4 rounded-sm border border-emerald-700/40 bg-emerald-900/15 px-4 py-3 text-sm text-emerald-300">
        ✓ Got it. We will notify you at that email when this product is scored.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="mt-4 flex flex-col gap-2 sm:flex-row">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email to be notified when this product is added"
        className="w-full rounded-sm border border-line bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted/60 focus:border-gold/60 focus:outline-none"
      />
      <button
        type="submit"
        disabled={status === "sending"}
        className="shrink-0 rounded-sm bg-gold px-5 py-2.5 font-display text-sm tracking-widest text-background transition-colors hover:bg-gold/90 disabled:opacity-50"
      >
        Notify Me
      </button>
    </form>
  );
}
