"use client";

import { useCallback, useEffect, useState } from "react";

type AliasRow = {
  alias_barcode: string;
  parent_product_name: string;
  parent_barcode: string | null;
  pack_size: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

type TabStatus = "pending" | "approved" | "rejected";

export default function AdminAliasesPage() {
  const [adminKey, setAdminKey] = useState("");
  const [keyInput, setKeyInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [authing, setAuthing] = useState(false);
  const [aliases, setAliases] = useState<AliasRow[]>([]);
  const [tab, setTab] = useState<TabStatus>("pending");
  const [loading, setLoading] = useState(false);
  const [actionInFlight, setActionInFlight] = useState<string | null>(null);

  // Restore key from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("gorilla-admin-key");
    if (stored) setAdminKey(stored);
  }, []);

  const fetchAliases = useCallback(
    async (key: string, status: TabStatus) => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/aliases?status=${status}`, {
          headers: { "x-admin-key": key },
        });
        if (res.status === 401) {
          setAdminKey("");
          localStorage.removeItem("gorilla-admin-key");
          setAuthError("Admin key rejected.");
          return;
        }
        const data = await res.json();
        setAliases(data.aliases ?? []);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (adminKey) fetchAliases(adminKey, tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminKey, tab]);

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setAuthing(true);
    setAuthError("");
    const res = await fetch("/api/admin/aliases?status=pending", {
      headers: { "x-admin-key": keyInput },
    });
    setAuthing(false);
    if (res.ok) {
      localStorage.setItem("gorilla-admin-key", keyInput);
      setAdminKey(keyInput);
      setKeyInput("");
    } else {
      setAuthError("Invalid admin key.");
    }
  }

  async function handleAction(barcode: string, action: "approve" | "reject" | "delete") {
    setActionInFlight(barcode);
    try {
      if (action === "delete") {
        await fetch(`/api/admin/aliases?alias_barcode=${encodeURIComponent(barcode)}`, {
          method: "DELETE",
          headers: { "x-admin-key": adminKey },
        });
      } else {
        await fetch("/api/admin/aliases", {
          method: "PATCH",
          headers: { "x-admin-key": adminKey, "Content-Type": "application/json" },
          body: JSON.stringify({ alias_barcode: barcode, action }),
        });
      }
      // Refresh
      await fetchAliases(adminKey, tab);
    } finally {
      setActionInFlight(null);
    }
  }

  // ── Auth gate ─────────────────────────────────────────────────────────────

  if (!adminKey) {
    return (
      <div className="mx-auto max-w-md px-5 py-20">
        <p className="font-display text-sm tracking-[0.3em] text-gold">GORILLA INTEL</p>
        <h1 className="mt-3 font-display text-4xl text-foreground">Alias Admin</h1>
        <p className="mt-2 text-sm text-muted">Enter your admin key to continue.</p>
        <form onSubmit={handleAuth} className="mt-8 flex flex-col gap-3">
          <input
            type="password"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            placeholder="Admin key"
            autoFocus
            className="rounded-sm border border-line bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted/50 focus:border-gold focus:outline-none"
          />
          {authError && <p className="text-xs text-red-400">{authError}</p>}
          <button
            type="submit"
            disabled={!keyInput || authing}
            className="rounded-sm bg-gold px-6 py-3 font-display text-sm tracking-widest text-background transition-colors hover:bg-gold/90 disabled:opacity-40"
          >
            {authing ? "Checking…" : "Enter"}
          </button>
        </form>
      </div>
    );
  }

  // ── Admin interface ───────────────────────────────────────────────────────

  const TABS: TabStatus[] = ["pending", "approved", "rejected"];

  return (
    <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-display text-sm tracking-[0.3em] text-gold">GORILLA INTEL ADMIN</p>
          <h1 className="mt-1 font-display text-4xl text-foreground">Barcode Aliases</h1>
        </div>
        <button
          type="button"
          onClick={() => {
            localStorage.removeItem("gorilla-admin-key");
            setAdminKey("");
          }}
          className="text-xs text-muted underline underline-offset-2 hover:text-foreground"
        >
          Sign out
        </button>
      </div>

      <p className="mt-2 max-w-xl text-sm text-muted">
        Community-submitted multi-pack barcode aliases. Approve an alias to make it live in the
        scanner — next time anyone scans that case barcode they will get the product instantly.
      </p>

      {/* Tabs */}
      <div className="mt-8 flex gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-sm px-4 py-2 font-display text-sm tracking-widest transition-colors ${
              tab === t
                ? t === "pending"
                  ? "bg-amber-500 text-background"
                  : t === "approved"
                  ? "bg-emerald-600 text-white"
                  : "bg-red-600 text-white"
                : "border border-line text-muted hover:text-foreground"
            }`}
          >
            {t.toUpperCase()}
          </button>
        ))}
        <button
          type="button"
          onClick={() => fetchAliases(adminKey, tab)}
          className="ml-auto rounded-sm border border-line px-4 py-2 font-display text-sm tracking-widest text-muted transition-colors hover:text-foreground"
        >
          {loading ? "Loading…" : "Refresh"}
        </button>
      </div>

      {/* Table */}
      {!loading && aliases.length === 0 && (
        <div className="mt-8 rounded-sm border border-line bg-surface px-6 py-8 text-center">
          <p className="text-sm text-muted">No {tab} aliases.</p>
        </div>
      )}

      {aliases.length > 0 && (
        <div className="mt-4 overflow-hidden rounded-sm border border-line">
          <table className="w-full text-sm">
            <thead className="border-b border-line bg-surface">
              <tr>
                <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.2em] text-muted">
                  Alias Barcode
                </th>
                <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.2em] text-muted">
                  Product
                </th>
                <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.2em] text-muted">
                  Parent Barcode
                </th>
                <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.2em] text-muted">
                  Pack Size
                </th>
                <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.2em] text-muted">
                  Submitted
                </th>
                <th className="px-4 py-3 text-right text-[10px] uppercase tracking-[0.2em] text-muted">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {aliases.map((row) => {
                const inFlight = actionInFlight === row.alias_barcode;
                return (
                  <tr key={row.alias_barcode} className="bg-background transition-colors hover:bg-surface">
                    <td className="px-4 py-3 font-mono text-xs text-foreground/80">
                      {row.alias_barcode}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{row.parent_product_name}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted">
                      {row.parent_barcode ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-sm border border-gold/40 px-2 py-0.5 font-display text-xs tracking-widest text-gold">
                        {row.pack_size}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">
                      {new Date(row.created_at).toLocaleDateString("en-CA")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {tab === "pending" && (
                          <>
                            <button
                              type="button"
                              disabled={inFlight}
                              onClick={() => handleAction(row.alias_barcode, "approve")}
                              className="rounded-sm border border-emerald-600/50 px-3 py-1.5 font-display text-xs tracking-widest text-emerald-400 transition-colors hover:bg-emerald-900/30 disabled:opacity-40"
                            >
                              {inFlight ? "…" : "Approve"}
                            </button>
                            <button
                              type="button"
                              disabled={inFlight}
                              onClick={() => handleAction(row.alias_barcode, "reject")}
                              className="rounded-sm border border-red-600/40 px-3 py-1.5 font-display text-xs tracking-widest text-red-400 transition-colors hover:bg-red-900/20 disabled:opacity-40"
                            >
                              {inFlight ? "…" : "Reject"}
                            </button>
                          </>
                        )}
                        {tab === "approved" && (
                          <button
                            type="button"
                            disabled={inFlight}
                            onClick={() => handleAction(row.alias_barcode, "reject")}
                            className="rounded-sm border border-red-600/40 px-3 py-1.5 font-display text-xs tracking-widest text-red-400 transition-colors hover:bg-red-900/20 disabled:opacity-40"
                          >
                            {inFlight ? "…" : "Revoke"}
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={inFlight}
                          onClick={() => handleAction(row.alias_barcode, "delete")}
                          className="rounded-sm border border-line px-3 py-1.5 font-display text-xs tracking-widest text-muted transition-colors hover:border-red-600/40 hover:text-red-400 disabled:opacity-40"
                        >
                          {inFlight ? "…" : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-8 rounded-sm border border-line bg-surface px-5 py-4">
        <p className="text-xs text-muted">
          <span className="font-medium text-foreground">How it works:</span> When a scanner hits a
          barcode with no result, it checks this table. Approved aliases return the parent product
          data with a pack size badge. Community submissions are stored as pending — approve them
          here to make them live. Aliases submitted from a device with the admin key stored are
          auto-approved.
        </p>
      </div>
    </div>
  );
}
