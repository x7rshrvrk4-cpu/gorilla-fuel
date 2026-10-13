"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PANTRY, PANTRY_BY_ID, type PantryCategory } from "../lib/pantryLibrary";
import { scoreSelection } from "../lib/recipes";
import { submitCommunityRecipe } from "../lib/communityRecipes";
import AmazonBuyButton from "../../components/AmazonBuyButton";

type Picked = { pantryId: string; core: boolean };
type Extra = { name: string };
type Saved = { id: string; name: string; picked: Picked[]; extras: Extra[]; cals: string; prot: string; score: number; savedAt: number };

const LS_KEY = "gf_recipe_scorer_v1";
const CAT_ORDER: PantryCategory[] = ["protein", "carb", "produce", "fat", "supplement"];
const CAT_LABEL: Record<PantryCategory, string> = { protein: "Protein", carb: "Carbs", produce: "Produce", fat: "Fats", supplement: "Supplements" };

function scoreColor(s: number): string {
  if (s >= 85) return "#64cf86";
  if (s >= 65) return "#e8b23a";
  if (s >= 40) return "#e0a23a";
  return "#e0644f";
}
function gradeLabel(s: number): string {
  if (s >= 85) return "Excellent";
  if (s >= 65) return "Good";
  if (s >= 40) return "Moderate";
  return "Poor";
}

export default function RecipeScorerClient() {
  const [picked, setPicked] = useState<Picked[]>([]);
  const [extras, setExtras] = useState<Extra[]>([]);
  const [extraInput, setExtraInput] = useState("");
  const [cals, setCals] = useState("");
  const [prot, setProt] = useState("");
  const [name, setName] = useState("");
  const [search, setSearch] = useState("");
  const [saved, setSaved] = useState<Saved[]>([]);
  const [notes, setNotes] = useState("");
  const [submitState, setSubmitState] = useState<"idle" | "submitting" | "ok" | "error">("idle");
  const [submitMsg, setSubmitMsg] = useState("");

  // Load saved recipes (per-browser). Wrapped — storage can throw/be empty.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setSaved(JSON.parse(raw));
    } catch {}
  }, []);
  function persist(next: Saved[]) {
    setSaved(next);
    try { localStorage.setItem(LS_KEY, JSON.stringify(next)); } catch {}
  }

  const pickedIds = useMemo(() => new Set(picked.map((p) => p.pantryId)), [picked]);
  const macros = cals && prot ? { calories: Number(cals) || 0, protein: Number(prot) || 0 } : undefined;
  const result = useMemo(() => scoreSelection(picked, macros), [picked, macros]);

  // Weakest core ingredient + same-category swaps that score higher.
  const swap = useMemo(() => {
    const coreScored = picked
      .filter((p) => p.core && PANTRY_BY_ID[p.pantryId]?.scoreHint != null)
      .map((p) => ({ p, item: PANTRY_BY_ID[p.pantryId]! }))
      .sort((a, b) => (a.item.scoreHint ?? 0) - (b.item.scoreHint ?? 0));
    if (coreScored.length === 0) return null;
    const weakest = coreScored[0];
    const alts = PANTRY.filter(
      (x) => x.category === weakest.item.category && (x.scoreHint ?? 0) > (weakest.item.scoreHint ?? 0) && !pickedIds.has(x.id),
    )
      .sort((a, b) => (b.scoreHint ?? 0) - (a.scoreHint ?? 0))
      .slice(0, 2);
    return alts.length ? { weakest: weakest.item, alts } : null;
  }, [picked, pickedIds]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return PANTRY.filter((p) => !q || p.name.toLowerCase().includes(q));
  }, [search]);

  function toggle(id: string) {
    setPicked((prev) => (prev.some((p) => p.pantryId === id) ? prev.filter((p) => p.pantryId !== id) : [...prev, { pantryId: id, core: true }]));
  }
  function toggleCore(id: string) {
    setPicked((prev) => prev.map((p) => (p.pantryId === id ? { ...p, core: !p.core } : p)));
  }
  function addExtra() {
    const v = extraInput.trim();
    if (v) { setExtras((e) => [...e, { name: v }]); setExtraInput(""); }
  }
  function reset() {
    setPicked([]); setExtras([]); setCals(""); setProt(""); setName("");
  }
  function save() {
    const n = name.trim() || "Untitled recipe";
    const rec: Saved = { id: `${Date.now()}`, name: n, picked, extras, cals, prot, score: result.score, savedAt: Date.now() };
    persist([rec, ...saved]);
  }
  function load(r: Saved) {
    setPicked(r.picked); setExtras(r.extras); setCals(r.cals); setProt(r.prot); setName(r.name);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function del(id: string) { persist(saved.filter((r) => r.id !== id)); }

  async function submitToGorilla() {
    if (!picked.length) return;
    setSubmitState("submitting");
    setSubmitMsg("");
    const ingredients = [
      ...picked.map((p) => ({ pantryId: p.pantryId, name: PANTRY_BY_ID[p.pantryId]?.name ?? p.pantryId, core: p.core })),
      ...extras.map((e) => ({ pantryId: null, name: e.name, core: false })),
    ];
    const res = await submitCommunityRecipe({
      title: name.trim() || "Untitled recipe",
      ingredients,
      calories: cals ? Number(cals) : null,
      protein: prot ? Number(prot) : null,
      gorilla_score: result.score,
      notes: notes.trim() || undefined,
    });
    if (res.ok) {
      setSubmitState("ok");
    } else {
      setSubmitState("error");
      setSubmitMsg(typeof res.message === "string" ? res.message : "Submission failed");
    }
  }

  const color = scoreColor(result.score);
  const amazonItems = picked.map((p) => PANTRY_BY_ID[p.pantryId]).filter((i) => i && i.affiliate === "amazon");
  const groceryItems = picked.map((p) => PANTRY_BY_ID[p.pantryId]).filter((i) => i && i.affiliate === "grocery");

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
      <p className="font-display text-sm tracking-[0.3em] text-gold">GORILLA FITNESS · FREE TOOL</p>
      <h1 className="mt-3 font-display text-5xl leading-[0.95] text-foreground sm:text-6xl">Recipe Scorer</h1>
      <p className="mt-4 max-w-2xl text-muted">
        Build any meal from real ingredients and get its <span className="text-foreground">Gorilla Meal Score</span> instantly —
        plus the weak link to swap and a grocery list. Save your own recipes; they live in your browser.
        No account, no AI, nothing leaves your device.
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* LEFT — builder */}
        <div>
          {/* picker */}
          <div className="gorilla-card rounded-sm p-5">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ingredients…"
              className="w-full rounded-sm border border-line bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-gold/60"
            />
            <div className="mt-4 space-y-4">
              {CAT_ORDER.map((cat) => {
                const items = filtered.filter((p) => p.category === cat);
                if (!items.length) return null;
                return (
                  <div key={cat}>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted">{CAT_LABEL[cat]}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {items.map((p) => {
                        const on = pickedIds.has(p.id);
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => toggle(p.id)}
                            className={`inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1.5 text-xs transition-colors ${
                              on ? "border-gold bg-gold/15 text-gold" : "border-line bg-surface text-muted hover:border-gold/40 hover:text-foreground"
                            }`}
                          >
                            {p.name}
                            {p.scoreHint != null && (
                              <span className="font-display tabular-nums" style={{ color: on ? undefined : scoreColor(p.scoreHint) }}>{p.scoreHint}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* selected */}
          {picked.length > 0 && (
            <div className="gorilla-card mt-4 rounded-sm p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg text-foreground">Your ingredients</h3>
                <button type="button" onClick={reset} className="text-xs text-muted hover:text-foreground">Clear all</button>
              </div>
              <ul className="mt-3 space-y-2">
                {picked.map((p) => {
                  const it = PANTRY_BY_ID[p.pantryId];
                  if (!it) return null;
                  return (
                    <li key={p.pantryId} className="flex items-center gap-3 rounded-sm border border-line bg-surface px-3 py-2">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border font-display text-xs tabular-nums" style={{ borderColor: it.scoreHint != null ? scoreColor(it.scoreHint) : "#555", color: it.scoreHint != null ? scoreColor(it.scoreHint) : "#999" }}>
                        {it.scoreHint ?? "—"}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm text-foreground">{it.name}</span>
                      <button
                        type="button"
                        onClick={() => toggleCore(p.pantryId)}
                        title="Core = a defining ingredient (weighted ×2 in the score)"
                        className={`rounded-sm border px-2 py-0.5 text-[10px] uppercase tracking-wider ${p.core ? "border-gold/50 bg-gold/10 text-gold" : "border-line text-muted"}`}
                      >
                        {p.core ? "Core" : "Extra"}
                      </button>
                      <button type="button" onClick={() => toggle(p.pantryId)} className="text-muted hover:text-red-400" aria-label="Remove">✕</button>
                    </li>
                  );
                })}
              </ul>

              {/* free-text extras (seasonings etc. — not scored) */}
              <div className="mt-3 flex gap-2">
                <input
                  value={extraInput}
                  onChange={(e) => setExtraInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addExtra()}
                  placeholder="Add a seasoning / extra (not scored)…"
                  className="flex-1 rounded-sm border border-line bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-gold/60"
                />
                <button type="button" onClick={addExtra} className="rounded-sm border border-line px-3 text-sm text-muted hover:text-foreground">Add</button>
              </div>
              {extras.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {extras.map((e, i) => (
                    <span key={i} className="inline-flex items-center gap-1 rounded-sm border border-line bg-surface px-2 py-1 text-xs text-muted">
                      {e.name}
                      <button type="button" onClick={() => setExtras((x) => x.filter((_, j) => j !== i))} className="hover:text-red-400">✕</button>
                    </span>
                  ))}
                </div>
              )}

              {/* optional macros */}
              <div className="mt-4 flex flex-wrap items-end gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] text-muted">Calories (optional)</label>
                  <input value={cals} onChange={(e) => setCals(e.target.value.replace(/[^0-9]/g, ""))} inputMode="numeric" placeholder="e.g. 520" className="mt-1 w-28 rounded-sm border border-line bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-gold/60" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] text-muted">Protein g (optional)</label>
                  <input value={prot} onChange={(e) => setProt(e.target.value.replace(/[^0-9]/g, ""))} inputMode="numeric" placeholder="e.g. 45" className="mt-1 w-28 rounded-sm border border-line bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-gold/60" />
                </div>
                <p className="flex-1 text-[11px] leading-snug text-muted/70">Add calories + protein to factor in protein density (25% of the score). Leave blank to score on ingredient quality alone.</p>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT — score + grocery + save */}
        <div className="space-y-4">
          {/* score */}
          <div className="gorilla-card rounded-sm p-6 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">Gorilla Meal Score</p>
            <p className="mt-1 font-display text-6xl leading-none" style={{ color }}>{picked.length ? result.score : "—"}</p>
            <p className="mt-1 font-display text-sm tracking-widest" style={{ color }}>{picked.length ? gradeLabel(result.score).toUpperCase() : ""}</p>
            {picked.length > 0 && result.proteinBalance == null && (
              <p className="mt-2 text-[11px] text-muted/70">Ingredient quality only — add macros for the full score.</p>
            )}
          </div>

          {/* swap suggestion */}
          {swap && (
            <div className="rounded-sm border border-gold/30 bg-gold/5 p-4">
              <p className="font-display text-xs tracking-[0.2em] text-gold">🦍 RAISE YOUR SCORE</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Weakest link: <span className="text-foreground">{swap.weakest.name}</span> ({swap.weakest.scoreHint}). Swap for{" "}
                {swap.alts.map((a, i) => (
                  <span key={a.id}>
                    <button type="button" onClick={() => { toggle(swap.weakest.id); toggle(a.id); }} className="text-gold underline hover:text-foreground">{a.name} ({a.scoreHint})</button>
                    {i < swap.alts.length - 1 ? " or " : ""}
                  </span>
                ))}
                .
              </p>
            </div>
          )}

          {/* grocery list */}
          {picked.length > 0 && (
            <div className="gorilla-card rounded-sm p-5">
              <h3 className="font-display text-lg text-foreground">Grocery list</h3>
              {amazonItems.length > 0 && (
                <div className="mt-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Shippable — buy online</p>
                  <div className="mt-2 space-y-2">
                    {amazonItems.map((it) => (
                      <div key={it!.id} className="flex items-center justify-between gap-2">
                        <span className="text-sm text-foreground">{it!.name}</span>
                        <AmazonBuyButton query={it!.name} label="Buy →" className="text-[11px]" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {groceryItems.length > 0 && (
                <div className="mt-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Fresh — at the store</p>
                  <ul className="mt-2 space-y-1 text-sm text-muted">
                    {groceryItems.map((it) => <li key={it!.id}>— {it!.name}</li>)}
                  </ul>
                </div>
              )}
              {extras.length > 0 && (
                <p className="mt-3 text-xs text-muted/70">Plus: {extras.map((e) => e.name).join(", ")}</p>
              )}
            </div>
          )}

          {/* save */}
          {picked.length > 0 && (
            <div className="gorilla-card rounded-sm p-5">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name this recipe…" className="w-full rounded-sm border border-line bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-gold/60" />
              <button type="button" onClick={save} className="mt-3 w-full rounded-sm bg-gold px-4 py-2.5 font-display text-sm tracking-widest text-background transition-opacity hover:opacity-90">Save to My Recipes</button>
            </div>
          )}

          {/* submit to the shared library (staging → review) */}
          {picked.length > 0 && (
            <div className="gorilla-card rounded-sm p-5">
              <p className="font-display text-sm text-foreground">Share it with Gorilla Fuel</p>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                Submit your recipe for review — approved ones join the public library for everyone. Nothing goes live until
                we check it.
              </p>
              {submitState === "ok" ? (
                <p className="mt-3 rounded-sm border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs leading-relaxed text-emerald-300">
                  Thanks — your recipe is in the review queue. 🦍
                </p>
              ) : (
                <>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Optional note — why it's good, any tips…"
                    rows={2}
                    className="mt-3 w-full resize-none rounded-sm border border-line bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-gold/60"
                  />
                  <button
                    type="button"
                    onClick={submitToGorilla}
                    disabled={submitState === "submitting"}
                    className="mt-2 w-full rounded-sm border border-gold px-4 py-2.5 font-display text-sm tracking-widest text-gold transition-colors hover:bg-gold hover:text-background disabled:opacity-50"
                  >
                    {submitState === "submitting" ? "Submitting…" : "Submit to Gorilla Fuel →"}
                  </button>
                  {submitState === "error" && (
                    <p className="mt-2 text-xs leading-relaxed text-red-400">Couldn&apos;t submit: {submitMsg}</p>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MY RECIPES */}
      {saved.length > 0 && (
        <div className="mt-12">
          <h2 className="font-display text-3xl text-foreground">My Recipes <span className="text-base text-muted">({saved.length})</span></h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {saved.map((r) => (
              <div key={r.id} className="gorilla-card rounded-sm p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="min-w-0 font-display text-base leading-tight text-foreground">{r.name}</p>
                  <span className="shrink-0 font-display text-2xl" style={{ color: scoreColor(r.score) }}>{r.score}</span>
                </div>
                <p className="mt-1 text-xs text-muted">{r.picked.length} ingredients</p>
                <div className="mt-3 flex gap-3 text-xs">
                  <button type="button" onClick={() => load(r)} className="text-gold hover:underline">Load</button>
                  <button type="button" onClick={() => del(r.id)} className="text-muted hover:text-red-400">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="mt-10 max-w-2xl text-xs leading-relaxed text-muted/70">
        Scores use the same Gorilla Meal Score as the Meal Finder — a weighted blend of each ingredient's Gorilla score (core
        ingredients count double) and protein density. It's guidance, not medical advice.{" "}
        <Link href="/fitness/recipes" className="text-gold underline hover:text-foreground">Browse the full recipe library →</Link>
      </p>
    </div>
  );
}
