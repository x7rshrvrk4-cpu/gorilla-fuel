"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * A numbered, collapsible step box with a "what this is" subtitle. Open/closed
 * state is remembered per device. Used to turn the fitness page into the
 * scannable "staying healthy is as easy as 1 → 6" flow.
 */
export default function StepBox({
  n,
  title,
  subtitle,
  defaultOpen = false,
  accent = false,
  children,
}: {
  n: number;
  title: string;
  subtitle: string;
  defaultOpen?: boolean;
  accent?: boolean;
  children: ReactNode;
}) {
  const storageKey = `gf-step-${n}`;
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    try {
      const v = localStorage.getItem(storageKey);
      if (v !== null) setOpen(v === "1");
    } catch {
      /* ignore */
    }
  }, [storageKey]);

  const toggle = () =>
    setOpen((o) => {
      const next = !o;
      try {
        localStorage.setItem(storageKey, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });

  return (
    <section className={`gorilla-card overflow-hidden rounded-sm ${accent ? "border-gold/40 bg-gold/[0.04]" : ""}`}>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className="flex w-full items-center gap-4 p-5 text-left transition-colors hover:bg-gold/[0.03]"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-gold/50 font-display text-lg text-gold tabular-nums">
          {n}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-lg leading-tight tracking-wide text-foreground">{title}</span>
          <span className="mt-0.5 block text-xs leading-relaxed text-muted">{subtitle}</span>
        </span>
        <span className={`shrink-0 font-display text-xl text-gold transition-transform ${open ? "rotate-90" : ""}`} aria-hidden>
          ›
        </span>
      </button>
      {open && <div className="border-t border-line px-5 pb-5 pt-4">{children}</div>}
    </section>
  );
}
