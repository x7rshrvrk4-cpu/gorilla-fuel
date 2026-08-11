# Live Supabase schema snapshot

DDL in this directory was **pulled live from the Supabase Postgres catalog on
2026-08-11** (via `pg_catalog` — `pg_get_constraintdef` / `pg_get_indexdef` /
`pg_policies`), not inferred from application code. Source query:
`scripts/get-table-ddl.sql`.

The repo has **no direct Postgres/`DATABASE_URL` connection** (PostgREST only),
so these files are the authoritative, human-maintained record of schemas that
otherwise live only in the Supabase UI. Re-run `scripts/get-table-ddl.sql` in the
Supabase SQL Editor to refresh.

## Tables documented here (verified to exist live)

| file | table | prior committed DDL? |
|---|---|---|
| `curated_picks.sql` | `curated_picks` | none before this |
| `bc_liquor.sql` | `bc_liquor` | `supabase/bc_liquor.sql` (matches live) |
| `gorilla_score_corrections.sql` | `gorilla_score_corrections` | `supabase/gorilla_score_corrections.sql` (matches live) |
| `fuel_audit_log.sql` | `fuel_audit_log` | none before this |

`gorilla_product_cache`, `gorilla_import_log`, `barcode_aliases`,
`community_alcohol_products`, and `community_ocr_ingredients` document their own
DDL as comments in their respective `app/scan/lib/*.ts` files; they are not
re-documented here.

## ⚠️ Two referenced tables do NOT exist in the live database

`missed_scans` and `scan_notifications` were **confirmed absent** — not visible
through PostgREST **and** not present in `pg_class` in the `public` schema
(checked live on 2026-08-11, not assumed). No files were written for them.

- They are referenced in code and in `HANDOFF.md` as if deployed.
- Any code path that writes to them is **silently failing** — consistent with
  this project's "silent-failure by design" pattern (cache/insert helpers swallow
  errors and return empty rather than throwing).
- `scan_notifications`' only DDL anywhere in the repo is inside the **un-deployed**
  `supabase/score-protection.sql`.
- **Action if these features matter:** decide whether to create the tables (and
  fix the silently-failing writes) or remove the dead write paths. Not addressed
  here — flagged only.

## ⚠️ Stale/incompatible schema file — do NOT apply

`supabase/score-protection.sql` defines an **older, incompatible** version of
`gorilla_score_corrections`:

- only **5 columns** (`id`, `product_name`, `barcode`, `old_score`, `new_score`,
  `correction_reason`, `corrected_at`) — **missing** `grade_before`,
  `grade_after`, `algorithm_version`, and `batch_id`, which the **live** table and
  the writers rely on;
- **different RLS** (anon insert/select policies vs. the live table's
  service-role-only posture);
- it also defines `gorilla_curated_scores`, `scan_notifications`, and a
  curated-score protection trigger — **none of which are deployed** (verified
  earlier via PostgREST: `gorilla_curated_scores` and `scan_notifications` 404).

**That file was never applied and must NOT be treated as authoritative.** Running
it against the live database would create a conflicting/duplicate definition. It
is intentionally left in place (not deleted or modified) — this note exists so it
isn't applied by mistake. The authoritative `gorilla_score_corrections` schema is
`docs/schema/gorilla_score_corrections.sql` (== `supabase/gorilla_score_corrections.sql`).
