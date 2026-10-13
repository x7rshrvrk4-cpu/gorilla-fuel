"use client";

import { useEffect, useState, useCallback } from "react";

type Ingredient = { pantryId: string | null; name: string; core: boolean };
type Row = {
  id: string;
  title: string;
  ingredients: Ingredient[];
  calories: number | null;
  protein: number | null;
  gorilla_score: number | null;
  notes: string | null;
  image_url: string | null;
  submitted_at: string;
};

const KEY_LS = "gf_admin_key";

function scoreColor(s: number | null): string {
  if (s == null) return "#908d86";
  if (s >= 85) return "#64cf86";
  if (s >= 65) return "#e8b23a";
  if (s >= 40) return "#e0a23a";
  return "#e0644f";
}

export default function CommunityRecipesAdmin() {
  const [key, setKey] = useState("");
  const [keyInput, setKeyInput] = useState("");
  const [tab, setTab] = useState<"pending" | "approved">("pending");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    try {
      const k = localStorage.getItem(KEY_LS);
      if (k) { setKey(k); setKeyInput(k); }
    } catch {}
  }, []);

  const load = useCallback(async (k: string, status: "pending" | "approved") => {
    if (!k) return;
    setLoading(true); setErr("");
    try {
      const res = await fetch(`/api/admin/community-recipes?status=${status}`, { headers: { "x-admin-key": k } });
      if (res.status === 401) { setErr("Unauthorized — check the admin key."); setRows([]); return; }
      if (!res.ok) { setErr(`Error ${res.status}`); setRows([]); return; }
      const data = await res.json();
      setRows(data.recipes ?? []);
    } catch {
      setErr("Network error.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (key) load(key, tab); }, [key, tab, load]);

  function saveKey() {
    const k = keyInput.trim();
    setKey(k);
    try { localStorage.setItem(KEY_LS, k); } catch {}
  }

  async function act(id: string, action: "approve" | "reject") {
    setBusy(id);
    try {
      const res = await fetch(`/api/admin/community-recipes`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-key": key },
        body: JSON.stringify({ id, action }),
      });
      if (res.ok) setRows((r) => r.filter((x) => x.id !== id));
      else setErr(`Action failed (${res.status})`);
    } catch {
      setErr("Network error.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-12 sm:px-8">
      <p className="font-display text-sm tracking-[0.3em] text-gold">GORILLA FUEL · ADMIN</p>
      <h1 className="mt-2 font-display text-4xl text-foreground">Community Recipes</h1>

      {/* key gate */}
      <div className="mt-6 flex flex-wrap items-end gap-2">
        <div>
          <label className="text-[10px] uppercase tracking-[0.2em] text-muted">Admin key</label>
          <input
            type="password"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && saveKey()}
            placeholder="ADMIN_API_KEY"
            className="mt-1 block w-72 rounded-sm border border-line bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-gold/60"
          />
        </div>
        <button type="button" onClick={saveKey} className="rounded-sm bg-gold px-4 py-2 font-display text-sm tracking-widest text-background">Load</button>
      </div>

      {key && (
        <>
          <div className="mt-6 flex gap-2">
            {(["pending", "approved"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`rounded-sm px-4 py-2 font-display text-sm tracking-widest ${tab === t ? "bg-gold text-background" : "border border-line text-muted hover:text-foreground"}`}
              >
                {t === "pending" ? "Pending" : "Approved"}
              </button>
            ))}
            <button type="button" onClick={() => load(key, tab)} className="ml-auto text-xs text-muted underline hover:text-foreground">Refresh</button>
          </div>

          {err && <p className="mt-4 rounded-sm border border-red-500/40 bg-red-950/20 px-3 py-2 text-sm text-red-300">{err}</p>}
          {loading && <p className="mt-4 text-sm text-muted">Loading…</p>}
          {!loading && rows.length === 0 && !err && <p className="mt-6 text-sm text-muted">Nothing {tab} right now.</p>}

          <div className="mt-6 space-y-4">
            {rows.map((r) => (
              <div key={r.id} className="gorilla-card rounded-sm p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-display text-xl leading-tight text-foreground">{r.title}</h3>
                    <p className="mt-0.5 text-xs text-muted">
                      {r.calories != null ? `${r.calories} cal` : "— cal"} · {r.protein != null ? `${r.protein}g protein` : "— protein"} ·{" "}
                      {new Date(r.submitted_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="shrink-0 font-display text-3xl" style={{ color: scoreColor(r.gorilla_score) }}>{r.gorilla_score ?? "—"}</span>
                </div>

                {r.image_url && (
                  <a href={r.image_url} target="_blank" rel="noopener noreferrer" className="mt-3 block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={r.image_url} alt="recipe screenshot" className="max-h-80 rounded-sm border border-line object-contain" />
                  </a>
                )}

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(r.ingredients ?? []).map((ing, i) => (
                    <span key={i} className={`rounded-sm border px-2 py-0.5 text-xs ${ing.core ? "border-gold/50 bg-gold/10 text-gold" : "border-line bg-surface text-muted"}`}>
                      {ing.name}{ing.pantryId ? "" : " *"}
                    </span>
                  ))}
                </div>

                {r.notes && <p className="mt-3 border-t border-line pt-3 text-sm leading-relaxed text-muted">“{r.notes}”</p>}

                {tab === "pending" && (
                  <div className="mt-4 flex gap-2">
                    <button type="button" disabled={busy === r.id} onClick={() => act(r.id, "approve")} className="rounded-sm border border-emerald-500/50 bg-emerald-500/10 px-4 py-2 font-display text-xs tracking-widest text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-50">✓ Approve</button>
                    <button type="button" disabled={busy === r.id} onClick={() => act(r.id, "reject")} className="rounded-sm border border-red-500/50 bg-red-500/10 px-4 py-2 font-display text-xs tracking-widest text-red-300 hover:bg-red-500/20 disabled:opacity-50">✕ Reject</button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <p className="mt-8 text-xs leading-relaxed text-muted/70">
            <span className="text-gold">Approve</span> keeps a submission (marks it verified) so you can promote it into the
            curated library — ingredients tagged <span className="text-gold">gold</span> are core; a <span className="text-muted">*</span> means
            a free-text extra with no pantry score. <span className="text-red-400">Reject</span> deletes it. Approving does not
            make it appear in the Meal Finder on its own — paste the approved ones to Claude to fold into recipes.ts, mapped and scored.
          </p>
        </>
      )}
    </div>
  );
}
