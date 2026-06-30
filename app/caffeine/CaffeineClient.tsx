"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ENERGY_PRODUCTS,
  caffeineBand,
  CAFFEINE_DISCLAIMER,
  type CaffeineBand,
} from "../energy/lib/products";

// ── Constants ────────────────────────────────────────────────────────────────
const STORAGE_KEY = "gorilla-caffeine";
const FITNESS_KEY = "gorilla-fitness"; // read-only — to prefill body weight for mg/kg context
const KG_PER_LB = 0.45359237;

// Sleep threshold options (mg of caffeine still circulating). 50 mg is the
// commonly cited "low enough not to disrupt most people's sleep" level; 100 mg
// is the looser ceiling. Default 50.
const THRESHOLDS = [50, 100] as const;
type Threshold = (typeof THRESHOLDS)[number];

// Half-life range. Population mean for a healthy adult is ~5–6 h; we default to
// 5.5 h. Smoking roughly halves it; pregnancy and some medications can double it.
const HL_MIN = 4;
const HL_MAX = 8;
const HL_DEFAULT = 5.5;

// ── Presets ──────────────────────────────────────────────────────────────────
// Everyday coffee/tea references (not energy drinks, so no loop-out link) +
// the curated, verified Canadian energy-drink caffeine figures from
// energy/lib/products.ts. Energy drinks carry their product id so we can loop
// out to /energy?p=<id> for the full profile.
type Preset = { id: string; label: string; mg: number; productId?: string };

const COMMON_PRESETS: Preset[] = [
  { id: "coffee-brewed", label: "Brewed coffee (240 mL)", mg: 95 },
  { id: "coffee-large", label: "Large coffee (475 mL)", mg: 190 },
  { id: "espresso", label: "Espresso (1 shot)", mg: 64 },
  { id: "espresso-double", label: "Double espresso (2 shots)", mg: 128 },
  { id: "black-tea", label: "Black tea (240 mL)", mg: 47 },
  { id: "green-tea", label: "Green tea (240 mL)", mg: 28 },
  { id: "cola", label: "Cola (355 mL)", mg: 34 },
  { id: "decaf", label: "Decaf coffee", mg: 2 },
];

const ENERGY_PRESETS: Preset[] = ENERGY_PRODUCTS.filter(
  (p): p is typeof p & { caffeineMg: number } => typeof p.caffeineMg === "number"
).map((p) => ({
  id: `energy-${p.id}`,
  label: `${p.brand} ${p.name} (${p.servingMl} mL)`,
  mg: p.caffeineMg,
  productId: p.id,
}));

const PRESETS: Preset[] = [...COMMON_PRESETS, ...ENERGY_PRESETS];
const PRESET_BY_ID: Record<string, Preset> = Object.fromEntries(PRESETS.map((p) => [p.id, p]));
const CUSTOM_ID = "custom";

// ── Types ────────────────────────────────────────────────────────────────────
type Dose = {
  key: string; // stable list key
  presetId: string; // preset id or CUSTOM_ID
  label: string;
  mg: number;
  time: string; // "HH:MM"
  productId?: string; // curated energy drink → loop-out target
};

type Persisted = {
  doses: Dose[];
  bedtime: string;
  halfLife: number;
  threshold: Threshold;
};

// ── Time helpers ─────────────────────────────────────────────────────────────
/** "15:00" → minutes since midnight, or null if blank/invalid. */
const parseTime = (hhmm: string): number | null => {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!m) return null;
  const h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  return h * 60 + min;
};

/** Minutes-since-midnight (may exceed 1440 for the next day) → "3:00 PM". */
const fmtTime = (min: number): string => {
  const day = Math.floor(min / 1440);
  const m = ((min % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  const ampm = h < 12 ? "AM" : "PM";
  let h12 = h % 12;
  if (h12 === 0) h12 = 12;
  return `${h12}:${String(mm).padStart(2, "0")} ${ampm}${day >= 1 ? " (next day)" : ""}`;
};

const newKey = () => Math.random().toString(36).slice(2, 9);

// ── SVG geometry ─────────────────────────────────────────────────────────────
const VB_W = 720;
const VB_H = 320;
const PAD_L = 48;
const PAD_R = 16;
const PAD_T = 16;
const PAD_B = 36;
const PLOT_W = VB_W - PAD_L - PAD_R;
const PLOT_H = VB_H - PAD_T - PAD_B;

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

const BAND_TEXT: Record<CaffeineBand, string> = {
  green: "text-emerald-400",
  yellow: "text-amber-400",
  red: "text-red-400",
};

export default function CaffeineClient() {
  const [doses, setDoses] = useState<Dose[]>([
    { key: "seed", presetId: "coffee-large", label: "Large coffee (475 mL)", mg: 190, time: "15:00" },
  ]);
  const [bedtime, setBedtime] = useState("23:00");
  const [halfLife, setHalfLife] = useState(HL_DEFAULT);
  const [threshold, setThreshold] = useState<Threshold>(50);
  const [loaded, setLoaded] = useState(false);

  // draft dose (the "add" row)
  const [draftPreset, setDraftPreset] = useState<string>("coffee-brewed");
  const [draftCustomMg, setDraftCustomMg] = useState("");
  const [draftTime, setDraftTime] = useState("08:00");

  // body weight (kg) — read-only from gorilla-fitness, for mg/kg context only
  const [weightKg, setWeightKg] = useState<number | null>(null);

  // ── Restore from localStorage (FitnessClient try/catch + loaded-guard pattern) ─
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const p = JSON.parse(raw) as Partial<Persisted>;
        if (Array.isArray(p.doses) && p.doses.length) setDoses(p.doses);
        if (p.bedtime) setBedtime(p.bedtime);
        if (typeof p.halfLife === "number") setHalfLife(clamp(p.halfLife, HL_MIN, HL_MAX));
        if (p.threshold === 50 || p.threshold === 100) setThreshold(p.threshold);
      }
    } catch {
      // ignore corrupt state
    }
    // Read body weight from the fitness tool WITHOUT writing to that key.
    try {
      const fraw = window.localStorage.getItem(FITNESS_KEY);
      if (fraw) {
        const f = JSON.parse(fraw) as { weight?: string; units?: string };
        const w = parseFloat(f.weight ?? "");
        if (Number.isFinite(w) && w > 0) {
          setWeightKg(f.units === "imperial" ? w * KG_PER_LB : w);
        }
      }
    } catch {
      // ignore
    }
    setLoaded(true);
  }, []);

  // ── Persist (only after initial load, so we don't clobber stored values) ────
  useEffect(() => {
    if (!loaded) return;
    try {
      const payload: Persisted = { doses, bedtime, halfLife, threshold };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore quota/serialization errors
    }
  }, [loaded, doses, bedtime, halfLife, threshold]);

  // ── The decay model ───────────────────────────────────────────────────────
  const calc = useMemo(() => {
    const parsed = doses
      .map((d) => ({ ...d, absMin: parseTime(d.time) }))
      .filter((d): d is Dose & { absMin: number } => d.absMin !== null && d.mg > 0);
    if (!parsed.length) return null;

    const hlMin = halfLife * 60;
    const t0 = Math.min(...parsed.map((d) => d.absMin));
    const lastDose = Math.max(...parsed.map((d) => d.absMin));

    // Caffeine remaining (mg) at an absolute minute, summed over all doses taken
    // by then: remaining = Σ dose · 0.5^(elapsed / half-life).
    const remainingAt = (absMin: number) =>
      parsed.reduce(
        (sum, d) => (absMin < d.absMin ? sum : sum + d.mg * Math.pow(0.5, (absMin - d.absMin) / hlMin)),
        0
      );

    const totalMg = parsed.reduce((s, d) => s + d.mg, 0);

    // Peak = highest point on the curve (a dose lands instantaneously, so the
    // peak is at one of the intake times).
    const peak = Math.max(...parsed.map((d) => remainingAt(d.absMin)));

    // Bedtime: if earlier than the first dose, it's the next day.
    const bedMin = parseTime(bedtime);
    const bedtimeAbs = bedMin === null ? null : bedMin < t0 ? bedMin + 1440 : bedMin;
    const atBedtime = bedtimeAbs === null ? null : remainingAt(bedtimeAbs);

    // Clear time: first minute AFTER the last dose where the curve drops below
    // the threshold (monotonic-decreasing after the last intake).
    let crossingAbs: number | null = null;
    if (peak >= threshold) {
      for (let m = lastDose; m <= t0 + 1440; m++) {
        if (remainingAt(m) < threshold) {
          crossingAbs = m;
          break;
        }
      }
    } else {
      crossingAbs = lastDose; // already below the threshold at the last dose
    }

    // ── Geometry ────────────────────────────────────────────────────────────
    const endAbs = Math.max(bedtimeAbs ?? t0, crossingAbs ?? t0) + 60;
    let spanMin = clamp(endAbs - t0, 480, 1440);
    spanMin = Math.min(1440, Math.ceil(spanMin / 60) * 60);
    const yMax = Math.max(50, Math.ceil(peak / 50) * 50);

    const x = (absMin: number) => PAD_L + ((absMin - t0) / spanMin) * PLOT_W;
    const y = (mg: number) => PAD_T + PLOT_H - (Math.min(mg, yMax) / yMax) * PLOT_H;

    // Curve polyline (sample every 5 min).
    const pts: string[] = [];
    for (let m = t0; m <= t0 + spanMin; m += 5) pts.push(`${x(m).toFixed(1)},${y(remainingAt(m)).toFixed(1)}`);

    // Gridlines / ticks.
    const yTicks = [0, 1, 2, 3, 4].map((i) => {
      const mg = (yMax / 4) * i;
      return { mg, yPos: y(mg) };
    });
    const spanH = spanMin / 60;
    const hourStep = spanH <= 12 ? 2 : 3;
    const xTicks: { xPos: number; label: string }[] = [];
    for (let h = 0; h <= spanH; h += hourStep) {
      const abs = t0 + h * 60;
      xTicks.push({ xPos: x(abs), label: fmtTime(abs) });
    }

    return {
      t0,
      lastDose,
      totalMg,
      peak,
      peakBand: caffeineBand(peak),
      atBedtime,
      atBedtimeBand: atBedtime === null ? null : caffeineBand(atBedtime),
      bedtimeAbs,
      crossingAbs,
      crossesAfterBed: bedtimeAbs !== null && crossingAbs !== null && crossingAbs > bedtimeAbs,
      yMax,
      thresholdY: y(threshold),
      points: pts.join(" "),
      crossingX: crossingAbs === null ? null : x(crossingAbs),
      crossingY: y(threshold),
      bedtimeX: bedtimeAbs === null ? null : x(bedtimeAbs),
      bedtimeInRange: bedtimeAbs !== null && bedtimeAbs <= t0 + spanMin,
      yTicks,
      xTicks,
      curveNeverClears: peak >= threshold && crossingAbs === null,
    };
  }, [doses, halfLife, bedtime, threshold]);

  // mg/kg context (read-only weight from the fitness tool)
  const mgPerKg = useMemo(() => {
    if (!calc || weightKg === null) return null;
    return Math.round((calc.totalMg / weightKg) * 100) / 100;
  }, [calc, weightKg]);

  // Curated energy drinks among the logged doses → loop-out to /energy?p=<id>.
  const loopOuts = useMemo(() => {
    const seen = new Set<string>();
    const out: { productId: string; label: string }[] = [];
    for (const d of doses) {
      if (d.productId && !seen.has(d.productId)) {
        seen.add(d.productId);
        out.push({ productId: d.productId, label: d.label });
      }
    }
    return out;
  }, [doses]);

  // ── Actions ─────────────────────────────────────────────────────────────────
  function addDose() {
    const isCustom = draftPreset === CUSTOM_ID;
    const preset = PRESET_BY_ID[draftPreset];
    const mg = isCustom ? Math.round(parseFloat(draftCustomMg) || 0) : preset?.mg ?? 0;
    if (mg <= 0 || parseTime(draftTime) === null) return;
    const label = isCustom ? `Custom (${mg} mg)` : preset.label;
    setDoses((prev) => [
      ...prev,
      { key: newKey(), presetId: draftPreset, label, mg, time: draftTime, productId: isCustom ? undefined : preset?.productId },
    ]);
    if (isCustom) setDraftCustomMg("");
  }

  function removeDose(key: string) {
    setDoses((prev) => prev.filter((d) => d.key !== key));
  }

  // ── Shared class helpers (copied verbatim from FitnessClient for consistency) ─
  const pill = (active: boolean) =>
    `rounded-sm border px-4 py-2 font-display text-xs tracking-widest transition-colors ${
      active ? "border-gold bg-gold text-background" : "border-line text-muted hover:border-gold/60 hover:text-gold"
    }`;
  const inputCls =
    "w-full rounded-sm border border-line bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted/50 focus:border-gold focus:outline-none";
  const labelCls = "block text-[10px] uppercase tracking-[0.2em] text-muted mb-1";

  const draftIsCustom = draftPreset === CUSTOM_ID;

  return (
    <div className="mt-8 flex flex-col gap-6">
      {/* ── STEP 1 — Your caffeine ─────────────────────────────────────────── */}
      <section className="gorilla-card rounded-sm p-5">
        <p className="font-display text-sm tracking-[0.2em] text-gold">1 · YOUR CAFFEINE</p>
        <p className="mt-1 text-xs text-muted">
          Add each drink and the time you had it. Energy-drink figures come from our verified
          Canadian-market data; coffee/tea are standard references.
        </p>

        {/* draft row */}
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
          <div>
            <label className={labelCls}>Drink</label>
            <select value={draftPreset} onChange={(e) => setDraftPreset(e.target.value)} className={inputCls}>
              <optgroup label="Coffee & tea">
                {COMMON_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>{p.label} — {p.mg} mg</option>
                ))}
              </optgroup>
              <optgroup label="Energy drinks (verified)">
                {ENERGY_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>{p.label} — {p.mg} mg</option>
                ))}
              </optgroup>
              <option value={CUSTOM_ID}>Custom amount…</option>
            </select>
          </div>
          {draftIsCustom && (
            <div>
              <label className={labelCls}>Caffeine (mg)</label>
              <input
                type="number" inputMode="numeric" min="1" value={draftCustomMg}
                onChange={(e) => setDraftCustomMg(e.target.value)} placeholder="mg"
                className={`${inputCls} sm:w-28`}
              />
            </div>
          )}
          <div>
            <label className={labelCls}>Time</label>
            <input type="time" value={draftTime} onChange={(e) => setDraftTime(e.target.value)} className={`${inputCls} sm:w-36`} />
          </div>
        </div>
        <button
          type="button" onClick={addDose}
          className="mt-3 rounded-sm border border-gold bg-gold/10 px-5 py-2 font-display text-xs tracking-widest text-gold transition-colors hover:bg-gold hover:text-background"
        >
          + Add dose
        </button>

        {/* dose list */}
        {doses.length > 0 ? (
          <ul className="mt-5 flex flex-col gap-2">
            {doses.map((d) => {
              const valid = parseTime(d.time) !== null;
              return (
                <li key={d.key} className="flex items-center justify-between gap-3 rounded-sm border border-line bg-background px-3 py-2.5 text-sm">
                  <span className="text-foreground">
                    <span className="font-display text-gold">{d.mg} mg</span> · {d.label}
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="text-xs text-muted">{valid ? fmtTime(parseTime(d.time)!) : "—"}</span>
                    <button type="button" onClick={() => removeDose(d.key)} className="text-muted/60 transition-colors hover:text-red-400" aria-label="Remove dose">✕</button>
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-4 text-xs text-muted/70">Add at least one dose to see your decay curve.</p>
        )}
      </section>

      {/* ── STEP 2 — Your metabolism ───────────────────────────────────────── */}
      <section className="gorilla-card rounded-sm p-5">
        <p className="font-display text-sm tracking-[0.2em] text-gold">2 · YOUR METABOLISM</p>
        <p className="mt-1 text-xs text-muted">
          Caffeine half-life varies a lot. A healthy adult averages ~5–6 h, but smoking can roughly
          halve it, while pregnancy, oral contraceptives and some medications can double it — which is
          why this is adjustable.
        </p>
        <div className="mt-4 flex items-center gap-4">
          <input
            type="range" min={HL_MIN} max={HL_MAX} step={0.5} value={halfLife}
            onChange={(e) => setHalfLife(parseFloat(e.target.value))}
            className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-line accent-[var(--color-gold,#d4a017)]"
          />
          <span className="font-display text-2xl text-gold">{halfLife.toFixed(1)}<span className="ml-1 text-sm text-muted">h</span></span>
        </div>
      </section>

      {calc && (
        <>
          {/* ── STEP 3 — Result ──────────────────────────────────────────────── */}
          <section className="gorilla-card rounded-sm p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-display text-sm tracking-[0.2em] text-gold">3 · RESULT</p>
              <div className="flex items-center gap-2">
                <span className={labelCls + " mb-0 self-center"}>Sleep threshold</span>
                {THRESHOLDS.map((t) => (
                  <button key={t} type="button" className={pill(threshold === t)} onClick={() => setThreshold(t)}>{t} mg</button>
                ))}
              </div>
            </div>

            {/* big readouts */}
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-sm border border-line p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Peak in your system</p>
                <p className={`mt-1 font-display text-4xl ${BAND_TEXT[calc.peakBand]}`}>{Math.round(calc.peak)}<span className="ml-1 text-base text-muted">mg</span></p>
              </div>
              <div className="rounded-sm border border-line p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Still in you at {bedtime ? fmtTime(parseTime(bedtime) ?? 0) : "bedtime"}</p>
                <p className={`mt-1 font-display text-4xl ${calc.atBedtimeBand ? BAND_TEXT[calc.atBedtimeBand] : "text-foreground"}`}>
                  {calc.atBedtime === null ? "—" : Math.round(calc.atBedtime)}<span className="ml-1 text-base text-muted">mg</span>
                </p>
              </div>
            </div>

            {/* bedtime input */}
            <div className="mt-4 max-w-xs">
              <label className={labelCls}>Your bedtime</label>
              <input type="time" value={bedtime} onChange={(e) => setBedtime(e.target.value)} className={`${inputCls} sm:w-40`} />
            </div>

            {/* ── Hand-rolled inline SVG decay curve ───────────────────────── */}
            <div className="mt-5 overflow-hidden rounded-sm border border-line bg-background p-2">
              <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="w-full" role="img" aria-label="Caffeine decay curve">
                {/* horizontal gridlines + Y labels (mg) */}
                {calc.yTicks.map((t, i) => (
                  <g key={`y${i}`}>
                    <line x1={PAD_L} y1={t.yPos} x2={VB_W - PAD_R} y2={t.yPos} className="text-line" stroke="currentColor" strokeWidth={1} opacity={i === 0 ? 0.8 : 0.3} />
                    <text x={PAD_L - 6} y={t.yPos + 3} textAnchor="end" className="fill-current text-muted" fontSize={11}>{Math.round(t.mg)}</text>
                  </g>
                ))}
                {/* X ticks + time labels */}
                {calc.xTicks.map((t, i) => (
                  <g key={`x${i}`}>
                    <line x1={t.xPos} y1={PAD_T} x2={t.xPos} y2={PAD_T + PLOT_H} className="text-line" stroke="currentColor" strokeWidth={1} opacity={0.15} />
                    <text x={t.xPos} y={VB_H - PAD_B + 18} textAnchor="middle" className="fill-current text-muted" fontSize={10}>{t.label.replace(" (next day)", "+1d")}</text>
                  </g>
                ))}
                {/* sleep threshold line */}
                <line x1={PAD_L} y1={calc.thresholdY} x2={VB_W - PAD_R} y2={calc.thresholdY} className="text-amber-400" stroke="currentColor" strokeWidth={1.5} strokeDasharray="5 4" opacity={0.9} />
                <text x={VB_W - PAD_R} y={calc.thresholdY - 5} textAnchor="end" className="fill-current text-amber-400" fontSize={10}>Sleep threshold {threshold} mg</text>
                {/* bedtime marker */}
                {calc.bedtimeInRange && calc.bedtimeX !== null && (
                  <g>
                    <line x1={calc.bedtimeX} y1={PAD_T} x2={calc.bedtimeX} y2={PAD_T + PLOT_H} className="text-muted" stroke="currentColor" strokeWidth={1} strokeDasharray="2 3" opacity={0.5} />
                    <text x={calc.bedtimeX} y={PAD_T + 10} textAnchor="middle" className="fill-current text-muted" fontSize={10}>bed</text>
                  </g>
                )}
                {/* the decay curve */}
                <polyline points={calc.points} fill="none" className="text-gold" stroke="currentColor" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
                {/* threshold-crossing marker */}
                {calc.crossingAbs !== null && calc.crossingX !== null && calc.peak >= threshold && calc.crossingX <= VB_W - PAD_R && (
                  <circle cx={calc.crossingX} cy={calc.crossingY} r={4} className="text-amber-400 fill-current" stroke="var(--color-background, #0a0a0a)" strokeWidth={1.5} />
                )}
                {/* axes */}
                <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + PLOT_H} className="text-line" stroke="currentColor" strokeWidth={1.5} />
              </svg>
            </div>

            {/* plain-language readout */}
            <div className="mt-5 rounded-sm border border-gold/30 bg-gold/[0.05] p-4 text-sm leading-relaxed text-foreground">
              {calc.peak < threshold ? (
                <p>
                  Your caffeine never rises above the {threshold} mg sleep threshold — it peaks at{" "}
                  <span className="font-display text-gold">{Math.round(calc.peak)} mg</span>.
                </p>
              ) : calc.crossingAbs !== null ? (
                <p>
                  Your caffeine drops below the {threshold} mg sleep threshold at{" "}
                  <span className="font-display text-gold">{fmtTime(calc.crossingAbs)}</span>.{" "}
                  {calc.atBedtime !== null && (
                    <>
                      At your {fmtTime(parseTime(bedtime) ?? 0)} bedtime you&apos;ll still have{" "}
                      <span className={`font-display ${calc.atBedtimeBand ? BAND_TEXT[calc.atBedtimeBand] : ""}`}>~{Math.round(calc.atBedtime)} mg</span> on board
                      {calc.crossesAfterBed ? " — above the threshold, so it may delay or fragment your sleep." : " — below the threshold."}
                    </>
                  )}
                </p>
              ) : (
                <p>Your caffeine is still above {threshold} mg 24 hours after your first dose — consider smaller or earlier doses.</p>
              )}
              {mgPerKg !== null && (
                <p className="mt-2 text-xs text-muted">
                  Total today: <span className="text-foreground">{Math.round(calc.totalMg)} mg</span> ≈{" "}
                  <span className="text-foreground">{mgPerKg} mg/kg</span> for your {Math.round(weightKg!)} kg (from your saved fitness profile).
                  Health Canada&apos;s adult ceiling is 400 mg/day.
                </p>
              )}
            </div>

            {/* Health Canada disclaimer — reused verbatim, not rewritten */}
            <p className="mt-4 rounded-sm border border-line bg-background p-3 text-[11px] leading-relaxed text-muted">
              {CAFFEINE_DISCLAIMER}
            </p>
          </section>

          {/* ── STEP 4 — Loop-out to the beverage rankings ───────────────────── */}
          {loopOuts.length > 0 && (
            <section className="gorilla-card rounded-sm p-5">
              <p className="font-display text-sm tracking-[0.2em] text-gold">4 · GO DEEPER</p>
              <p className="mt-1 text-xs text-muted">See the full Gorilla score, sugar, sodium and additive breakdown for the energy drinks you logged.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {loopOuts.map((l) => (
                  <Link
                    key={l.productId}
                    href={`/energy?p=${l.productId}`}
                    className="rounded-sm border border-line px-4 py-2 font-display text-xs tracking-widest text-muted transition-colors hover:border-gold/60 hover:text-gold"
                  >
                    {l.label} →
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <p className="mt-2 text-center text-[10px] leading-relaxed text-muted/50">
        Estimates only. Caffeine pharmacokinetics vary widely between individuals (genetics, liver
        enzymes, smoking, pregnancy, medications). The model assumes instant absorption and
        first-order (exponential) elimination. Not medical advice.
      </p>
    </div>
  );
}
