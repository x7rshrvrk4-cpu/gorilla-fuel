/*
 * SQL — run once in the Supabase SQL Editor:
 *
 * create table public.barcode_aliases (
 *   alias_barcode         text         primary key,
 *   parent_product_name   text         not null,
 *   parent_barcode        text,
 *   pack_size             text         not null,
 *   status                text         not null default 'pending',
 *   created_at            timestamptz  not null default now()
 * );
 *
 * create index barcode_aliases_status_idx
 *   on public.barcode_aliases (status)
 *   where status = 'approved';
 *
 * alter table public.barcode_aliases enable row level security;
 *
 * -- Scanners read approved aliases only
 * create policy "Read approved aliases"
 *   on public.barcode_aliases for select
 *   to anon
 *   using (status = 'approved');
 *
 * -- Community can submit pending aliases
 * create policy "Submit aliases"
 *   on public.barcode_aliases for insert
 *   to anon
 *   with check (status = 'pending');
 *
 * -- Pre-seed: insert verified multi-pack barcodes here after physically reading the
 * -- barcode from the actual package. Do not fabricate UPCs.
 * -- INSERT INTO public.barcode_aliases (alias_barcode, parent_product_name, parent_barcode, pack_size, status)
 * -- VALUES ('VERIFIED_UPC', 'Michelob Ultra', '0018200417308', '24 PACK', 'approved');
 */

const TABLE = "barcode_aliases";

function sbUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
}
function sbKey(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
}
function baseHeaders() {
  return {
    apikey: sbKey(),
    Authorization: `Bearer ${sbKey()}`,
    "Content-Type": "application/json",
  };
}

export type BarcodeAlias = {
  alias_barcode: string;
  parent_product_name: string;
  parent_barcode: string | null;
  pack_size: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

export async function lookupBarcodeAlias(barcode: string): Promise<BarcodeAlias | null> {
  const url = sbUrl();
  if (!url || !sbKey()) return null;
  try {
    const endpoint = new URL(`${url}/rest/v1/${TABLE}`);
    endpoint.searchParams.set("alias_barcode", `eq.${barcode}`);
    endpoint.searchParams.set("status", "eq.approved");
    endpoint.searchParams.set("limit", "1");
    const res = await fetch(endpoint.toString(), {
      headers: baseHeaders(),
      signal: AbortSignal.timeout(1500),
    });
    if (!res.ok) return null;
    const rows: BarcodeAlias[] = await res.json();
    return rows[0] ?? null;
  } catch {
    return null;
  }
}
