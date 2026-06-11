-- ════════════════════════════════════════════════════════════════════════════
-- GORILLA FUEL SCORE PROTECTION — run once in the Supabase SQL Editor.
--
-- 1. gorilla_score_corrections: audit log of every score correction.
-- 2. Trigger on gorilla_product_cache: rejects score updates that conflict
--    with curated scores, and logs the attempt. Prevents any cron job or
--    cache refresh from overwriting verified scores.
-- ════════════════════════════════════════════════════════════════════════════

-- ── 1. Corrections audit table ───────────────────────────────────────────────
create table if not exists public.gorilla_score_corrections (
  id                uuid        primary key default gen_random_uuid(),
  product_name      text,
  barcode           text        not null,
  old_score         integer,
  new_score         integer,
  correction_reason text,
  corrected_at      timestamptz not null default now()
);

alter table public.gorilla_score_corrections enable row level security;
create policy "Anon insert corrections"
  on public.gorilla_score_corrections for insert to anon with check (true);
create policy "Anon read corrections"
  on public.gorilla_score_corrections for select to anon using (true);

-- ── 2. Curated score registry (mirror of app curated DB, by barcode) ─────────
-- Keep this in sync with app/scan/lib/curatedScoreConstants.ts.
create table if not exists public.gorilla_curated_scores (
  barcode text primary key,
  score   integer not null
);

insert into public.gorilla_curated_scores (barcode, score) values
  ('0028400090308', 20),  -- Doritos
  ('0044000030131', 22),  -- Oreo
  ('0069000019832', 23),  -- Coca-Cola
  ('0069000008947', 22),  -- Pepsi
  ('0062100012284', 48),  -- Canada Dry Zero
  ('0028400590679', 62),  -- Tostitos Restaurant Style
  ('0028400090155', 58),  -- Lay's Classic
  ('0072030007972', 80),  -- Wasa Crispbread
  ('0817939020025', 78),  -- SkinnyPop
  ('0602652179864', 71),  -- KIND Dark Chocolate
  ('0041570050000', 90),  -- Blue Diamond Almonds
  ('0069000019849', 24)   -- Sprite
on conflict (barcode) do update set score = excluded.score;

-- ── 3. Protection trigger ─────────────────────────────────────────────────────
create or replace function public.protect_curated_scores()
returns trigger language plpgsql security definer as $$
declare
  curated integer;
begin
  select score into curated
  from public.gorilla_curated_scores
  where barcode = new.barcode
     or ltrim(barcode, '0') = ltrim(new.barcode, '0');

  if curated is not null and new.gorilla_score is distinct from curated then
    -- Log the rejected attempt
    insert into public.gorilla_score_corrections
      (product_name, barcode, old_score, new_score, correction_reason)
    values
      (new.product_name, new.barcode, new.gorilla_score, curated,
       'trigger: rejected update conflicting with curated score');
    -- Force the curated score instead of the attempted value
    new.gorilla_score := curated;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_protect_curated_scores on public.gorilla_product_cache;
create trigger trg_protect_curated_scores
  before insert or update of gorilla_score on public.gorilla_product_cache
  for each row execute function public.protect_curated_scores();
