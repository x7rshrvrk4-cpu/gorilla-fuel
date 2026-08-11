-- curated_picks — pulled live from Supabase on 2026-08-11 via pg_catalog
-- (pg_get_constraintdef / pg_get_indexdef). Real DDL, not inferred from app code.
--
-- Hand-approved barcode → tier → rank list backing /approved, /cheat, /avoid;
-- joined to gorilla_product_cache at read time (getCuratedPicks). Populated by
-- scripts/ingest-curated-picks.mjs, whose `on_conflict=barcode,tier` upsert
-- relies on the UNIQUE(barcode, tier) constraint below. No committed DDL existed
-- for this table before this file.

create table if not exists public.curated_picks (
  id       uuid        not null default gen_random_uuid(),
  barcode  text        not null,
  tier     text        not null,
  rank     integer,
  note     text,
  added_at timestamptz not null default now(),
  primary key (id),
  unique (barcode, tier),
  check (tier = any (array['approved'::text, 'cheat'::text, 'avoid'::text]))
);

-- Additional index (beyond the PK index and the UNIQUE(barcode,tier) index):
create index if not exists curated_picks_tier_idx on public.curated_picks (tier);

-- RLS: not part of this pull's pasted results — confirm from Query 4 output
-- before relying on it.
