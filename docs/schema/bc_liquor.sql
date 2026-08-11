-- bc_liquor — pulled live from Supabase on 2026-08-11 via pg_catalog
-- (pg_get_constraintdef / pg_get_indexdef). Real DDL, not inferred from app code.
--
-- BC Liquor Store price-list staging table (SEPARATE from gorilla_product_cache;
-- enrichment onto the cache is a downstream join, never a merge). Backs
-- /bc-liquor; loaded by scripts/ingest-bc-liquor.ts.
--
-- Matches the pre-existing hand-authored DDL in supabase/bc_liquor.sql — the live
-- columns/types/defaults/nullability agree, no drift.

create table if not exists public.bc_liquor (
  id                       uuid        not null default gen_random_uuid(),
  barcode                  text,
  sku                      text        not null,
  product_name             text,
  category                 text,
  kind                     text,
  subcategory              text,
  class                    text,
  country_origin           text,
  litres_per_container     numeric,
  containers_per_sell_unit integer,
  abv                      numeric,
  price                    numeric,
  sweetness_code           text,
  source                   text        not null default 'bc_liquor',
  imported_at              timestamptz not null default now(),
  primary key (id)
);

-- Additional indexes (beyond the PK index):
create index if not exists idx_bc_liquor_barcode on public.bc_liquor (barcode);
create index if not exists idx_bc_liquor_sku     on public.bc_liquor (sku);

-- RLS: supabase/bc_liquor.sql documents RLS enabled with no anon/authenticated
-- policies (service-role-only, internal staging). Confirm against Query 4 output.
