/*
 * SQL — run once in the Supabase SQL Editor to create the missed_scans table:
 *
 * create table public.missed_scans (
 *   id           uuid        primary key default gen_random_uuid(),
 *   barcode      text        not null,
 *   scan_mode    text        not null default 'unknown',
 *   scanned_at   timestamptz not null default now(),
 *   country_code text        not null default 'unknown'
 * );
 *
 * create index missed_scans_barcode_idx on public.missed_scans (barcode);
 * create index missed_scans_scanned_at_idx on public.missed_scans (scanned_at desc);
 *
 * alter table public.missed_scans enable row level security;
 *
 * -- Anon users can insert missed scan records (fire-and-forget analytics)
 * create policy "Log missed scans"
 *   on public.missed_scans for insert
 *   to anon
 *   with check (true);
 *
 * -- Only authenticated users (admins) can read missed scans
 * create policy "Admin read missed scans"
 *   on public.missed_scans for select
 *   to authenticated
 *   using (true);
 *
 * -- Useful admin query to find highest-priority missing products:
 * -- select barcode, scan_mode, country_code, count(*) as scan_count
 * -- from public.missed_scans
 * -- group by barcode, scan_mode, country_code
 * -- order by scan_count desc;
 */

export type ScanMode = "food" | "alcohol" | "beauty" | "unknown";

function sbUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
}
function sbKey(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
}

/** Infer the likely country from the GS1 company prefix (first 3 digits). */
function countryFromBarcode(barcode: string): string {
  const digits = barcode.replace(/\D/g, "");
  const prefix = parseInt(digits.slice(0, 3), 10);
  if (isNaN(prefix)) return "unknown";
  if (prefix <= 19)  return "US/CA";
  if (prefix <= 99)  return "US";
  if (prefix <= 139) return "US/CA";
  if (prefix <= 199) return "US";
  if (prefix >= 300 && prefix <= 379) return "FR";
  if (prefix >= 400 && prefix <= 440) return "DE";
  if (prefix >= 450 && prefix <= 459) return "JP";
  if (prefix >= 490 && prefix <= 499) return "JP";
  if (prefix >= 500 && prefix <= 509) return "UK";
  if (prefix >= 539 && prefix <= 539) return "IE";
  if (prefix >= 540 && prefix <= 549) return "BE";
  if (prefix >= 570 && prefix <= 579) return "DK";
  if (prefix >= 590 && prefix <= 590) return "PL";
  if (prefix >= 600 && prefix <= 601) return "ZA";
  if (prefix >= 640 && prefix <= 649) return "FI";
  if (prefix >= 690 && prefix <= 699) return "CN";
  if (prefix >= 700 && prefix <= 709) return "NO";
  if (prefix >= 729 && prefix <= 729) return "IL";
  if (prefix >= 730 && prefix <= 739) return "SE";
  if (prefix >= 750 && prefix <= 750) return "MX";
  if (prefix >= 754 && prefix <= 755) return "CA";
  if (prefix >= 760 && prefix <= 769) return "CH";
  if (prefix >= 770 && prefix <= 771) return "CO";
  if (prefix >= 779 && prefix <= 779) return "AR";
  if (prefix >= 789 && prefix <= 790) return "BR";
  if (prefix >= 800 && prefix <= 839) return "IT";
  if (prefix >= 840 && prefix <= 849) return "ES";
  if (prefix >= 860 && prefix <= 860) return "RS";
  if (prefix >= 868 && prefix <= 869) return "TR";
  if (prefix >= 870 && prefix <= 879) return "NL";
  if (prefix >= 880 && prefix <= 880) return "KR";
  if (prefix >= 885 && prefix <= 885) return "TH";
  if (prefix >= 888 && prefix <= 888) return "SG";
  if (prefix >= 890 && prefix <= 890) return "IN";
  if (prefix >= 893 && prefix <= 893) return "VN";
  if (prefix >= 899 && prefix <= 899) return "ID";
  if (prefix >= 900 && prefix <= 919) return "AT";
  if (prefix >= 930 && prefix <= 939) return "AU";
  if (prefix >= 940 && prefix <= 949) return "NZ";
  if (prefix >= 955 && prefix <= 955) return "MY";
  return "unknown";
}

/**
 * Fire-and-forget: log a barcode that returned no valid product to Supabase.
 * Never throws — logging failure must never affect the UI.
 */
export async function logMissedScan(barcode: string, scanMode: ScanMode): Promise<void> {
  const url = sbUrl();
  if (!url || !sbKey()) return;
  try {
    await fetch(`${url}/rest/v1/missed_scans`, {
      method: "POST",
      headers: {
        apikey: sbKey(),
        Authorization: `Bearer ${sbKey()}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        barcode,
        scan_mode: scanMode,
        country_code: countryFromBarcode(barcode),
      }),
    });
  } catch {
    // Non-critical — logging failure must not affect the scanner UI
  }
}
