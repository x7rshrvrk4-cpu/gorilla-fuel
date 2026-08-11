-- fuel_audit_log — pulled live from Supabase on 2026-08-11 via pg_catalog
-- (pg_get_constraintdef / pg_get_indexdef / pg_policies). Real DDL, not inferred.
--
-- Daily recall/advisory audit trail written by the cron job
-- app/api/cron/audit/route.ts (Open FDA recalls + Health Canada advisories).
-- No committed DDL existed for this table before this file.
--
-- ⚠️ SECURITY NOTE — worth reviewing (NOT fixed here): the INSERT policy below is
-- granted to the PUBLIC role (i.e. open to the anon key), not restricted to the
-- service role. Despite the policy name "Allow insert from service", anyone with
-- the public anon key can insert rows into this audit log. Flagging for review.

create table if not exists public.fuel_audit_log (
  id           uuid        not null default gen_random_uuid(),
  date         timestamptz default now(),
  product_name text,
  change_type  text,
  old_value    text,
  new_value    text,
  source_url   text,
  primary key (id)
);

-- No additional constraints or indexes beyond the primary key.

-- Row-level security (enabled live):
alter table public.fuel_audit_log enable row level security;

-- NOTE: both policies target the PUBLIC role — INSERT is NOT restricted to the
-- service role despite the policy name. See the security note above.
create policy "Allow insert from service"
  on public.fuel_audit_log for insert to public with check (true);
create policy "Allow read all"
  on public.fuel_audit_log for select to public using (true);
