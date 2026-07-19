-- ════════════════════════════════════════════════════════════════════════════
-- BC LIQUOR staging table — run once in the Supabase SQL Editor.
--
-- Holds the BC Liquor Store Product Price List (BC Open Government Portal, "As
-- Needed" updates). A SEPARATE staging table, NOT an extension of
-- gorilla_product_cache: it's a price-list snapshot (~8,224 rows, mostly products
-- no one has scanned), carries fields the scan cache has no home for (SKU, litres,
-- sweetness, price), and includes ~8% barcode-less rows that can't join to the
-- barcode-keyed cache. Enrichment onto the cache (ABV via nutrition_data.alcohol_
-- 100g, kind-correction) is a downstream join step, not a merge.
-- ════════════════════════════════════════════════════════════════════════════

create table if not exists public.bc_liquor (
  id                       uuid        primary key default gen_random_uuid(),
  barcode                  text,          -- normalized UPC (leading zeros stripped, same as the ABV backfill); NULL for the ~8% blank-UPC rows
  sku                      text        not null,  -- BCLDB internal PRODUCT_SKU_NO
  product_name             text,          -- PRODUCT_LONG_NAME
  category                 text,          -- raw BC ITEM_CATEGORY_NAME (Wine / Spirits / Beer / Refreshment Beverages / General Merchandise)
  kind                     text,          -- normalized: wine / spirits / beer / refreshment / other (maps toward detectAlcoholKind)
  subcategory              text,          -- ITEM_SUBCATEGORY_NAME
  class                    text,          -- ITEM_CLASS_NAME
  country_origin           text,          -- PRODUCT_COUNTRY_ORIGIN_NAME
  litres_per_container     numeric,       -- PRODUCT_LITRES_PER_CONTAINER
  containers_per_sell_unit integer,       -- PRD_CONTAINER_PER_SELL_UNIT
  abv                      numeric,       -- PRODUCT_ALCOHOL_PERCENT, clamped: NULL when 0 or >80 (placeholder/unknown)
  price                    numeric,       -- PRODUCT_PRICE (parsed; BC mixes whole-dollar integers and decimals)
  sweetness_code           text,          -- SWEETNESS_CODE (~50% populated)
  source                   text        not null default 'bc_liquor',
  imported_at              timestamptz not null default now()
);

create index if not exists idx_bc_liquor_barcode on public.bc_liquor (barcode);
create index if not exists idx_bc_liquor_sku     on public.bc_liquor (sku);

-- Service-role-only: internal staging, not read by the app. The ingest script uses
-- SUPABASE_SERVICE_ROLE_KEY (bypasses RLS); the public anon key gets nothing.
alter table public.bc_liquor enable row level security;
