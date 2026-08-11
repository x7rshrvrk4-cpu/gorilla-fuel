-- gorilla_score_corrections — pulled live from Supabase on 2026-08-11 via
-- pg_catalog (pg_get_constraintdef / pg_get_indexdef). Real DDL, not inferred.
--
-- Audit trail for every automated score change (recompute / rescore / backfill
-- passes); written by the scripts under scripts/ using the service-role key,
-- grouped per run by batch_id.
--
-- This LIVE schema is the RICH version (adds grade_before/grade_after/
-- algorithm_version/batch_id) and matches supabase/gorilla_score_corrections.sql.
-- It does NOT match supabase/score-protection.sql, which defines an older,
-- incompatible 5-column version of the same table — see docs/schema/README.md.

create table if not exists public.gorilla_score_corrections (
  id                uuid        not null default gen_random_uuid(),
  barcode           text        not null,
  product_name      text,
  old_score         integer,
  new_score         integer,
  correction_reason text,
  grade_before      text,
  grade_after       text,
  algorithm_version text,
  batch_id          uuid,
  corrected_at      timestamptz not null default now(),
  primary key (id)
);

-- Additional indexes (beyond the PK index):
create index if not exists idx_gsc_barcode      on public.gorilla_score_corrections (barcode);
create index if not exists idx_gsc_batch_id     on public.gorilla_score_corrections (batch_id);
create index if not exists idx_gsc_corrected_at on public.gorilla_score_corrections (corrected_at desc);

-- RLS: supabase/gorilla_score_corrections.sql documents RLS enabled, service-role
-- only (no anon/authenticated policies). Confirm against Query 4 output.
