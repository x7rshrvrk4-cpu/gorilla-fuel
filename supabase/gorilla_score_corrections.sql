-- ════════════════════════════════════════════════════════════════════════════
-- GORILLA FUEL — score-corrections audit table. Run once in the Supabase SQL Editor.
--
-- Persistent audit trail for every automated score change (recompute / rescore
-- passes). Was originally authored inside score-protection.sql but never applied,
-- so the writers' log inserts were silently 404-ing. This file creates ONLY the
-- corrections table + indexes + RLS — NOT the curated-protection trigger or the
-- gorilla_curated_scores registry (those remain a separate decision).
--
-- Core 5 columns (barcode/product_name/old_score/new_score/correction_reason)
-- match the writers' existing insert bodies byte-for-byte, so activation is
-- zero-code. Nullable extensions (grade_before/grade_after/algorithm_version/
-- batch_id) carry richer audit data the writers now also send. batch_id groups
-- one recompute run: `where batch_id = '…'` answers "what did this pass change".
-- ════════════════════════════════════════════════════════════════════════════

create table if not exists public.gorilla_score_corrections (
  id                 uuid        primary key default gen_random_uuid(),
  barcode            text        not null,        -- product corrected
  product_name       text,                        -- snapshot at correction time
  old_score          integer,                     -- cached score before
  new_score          integer,                     -- recomputed score after
  correction_reason  text,                        -- which pass / why
  grade_before       text,                        -- optional (often unavailable in writers)
  grade_after        text,                        -- optional (writers compute grade)
  algorithm_version  text,                        -- optional (ALGO_VERSION at write time)
  batch_id           uuid,                         -- groups one recompute run
  corrected_at       timestamptz not null default now()
);

create index if not exists idx_gsc_barcode      on public.gorilla_score_corrections (barcode);
create index if not exists idx_gsc_corrected_at on public.gorilla_score_corrections (corrected_at desc);
create index if not exists idx_gsc_batch_id      on public.gorilla_score_corrections (batch_id);

-- Service-role-only: enable RLS with NO anon/authenticated policies. The recompute
-- writers use SUPABASE_SERVICE_ROLE_KEY, which bypasses RLS, so they write fine;
-- the public anon key gets nothing (internal audit log, never read by the app).
-- (If an admin dashboard later needs to view this, add a `for select to
-- authenticated` policy at that point.)
alter table public.gorilla_score_corrections enable row level security;
