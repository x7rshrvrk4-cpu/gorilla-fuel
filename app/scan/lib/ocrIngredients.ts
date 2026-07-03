import { submitCommunity, type SubmitResult } from "./communityProducts";

/*
 * ── OCR-AT-SCAN, PHASE 0 ──────────────────────────────────────────────────────
 * Photograph an ingredients panel → OCR (Tesseract, client-side) → English-anchor
 * parse → user confirms → write to a STAGING tier for later admin promotion.
 *
 * SAFETY INVARIANT (Phase 0): this module NEVER writes the authoritative
 * gorilla_product_cache.ingredients_text and NEVER calls upsertProductCache. OCR
 * output goes ONLY to community_ocr_ingredients (verified=false). A parse/OCR bug
 * therefore cannot change any product's real score.
 *
 * SQL — run once in the Supabase SQL editor to provision the staging table
 * (mirrors community_alcohol_products; staging is admin-only, no anon read):
 *
 *   create table public.community_ocr_ingredients (
 *     id                 uuid        primary key default gen_random_uuid(),
 *     barcode            text        not null,
 *     raw_ocr_text       text        not null,
 *     parsed_ingredients text        not null,
 *     ocr_confidence     numeric(5,2),
 *     submitted_at       timestamptz not null default now(),
 *     verified           boolean     not null default false
 *   );
 *   create index community_ocr_ingredients_barcode_idx
 *     on public.community_ocr_ingredients (barcode);
 *   alter table public.community_ocr_ingredients enable row level security;
 *   -- Anon may submit (always unverified); no anon SELECT (admin review only).
 *   create policy "Submit OCR ingredients"
 *     on public.community_ocr_ingredients for insert
 *     to anon with check (verified = false);
 */

const OCR_STAGING_TABLE = "community_ocr_ingredients";

// ── PARSE (C — English anchor) ───────────────────────────────────────────────
// Anchor on "Ingredients:" (tolerating the common I↔l OCR confusion and a
// missing colon), then take text until the next section boundary. English-only
// for Phase 0 — French/bilingual is deferred.
const ANCHOR_RE = /(?:^|\n|\.|\s)[il]ngred[il]ents?\b\s*[:.\-–—]?\s*/i;
// Where the ingredients list ends: the next label SECTION keyword. We deliberately
// do NOT treat a blank line as a boundary — OCR frequently injects spurious blank
// lines mid-list, and truncating (silently losing ingredients) is worse than
// over-capturing trailing text (which the user trims in the confirm step).
const SECTION_BOUNDARY_RE =
  /(?:^|\n|\.)\s*(?:nutrition(?:\s+facts)?|valeur\s+nutritive|contains?\b|allergen|allergy|manufactured|distributed|produced|packed\b|best\s+before|keep\s+refrigerated|store\s+in|net\s+wt|net\s+weight|poids\s+net|ingr[ée]dients?)\b/i;

export type ParseResult = {
  ok: boolean;
  parsed: string;
  reason?: string;
};

/** Extract just the ingredients list from a raw OCR blob (English anchor). */
export function parseIngredientsFromOcr(raw: string): ParseResult {
  const text = (raw ?? "").replace(/\r/g, "");
  if (!text.trim()) return { ok: false, parsed: "", reason: "empty OCR text" };

  const anchor = ANCHOR_RE.exec(text);
  if (!anchor) return { ok: false, parsed: "", reason: "no 'Ingredients:' anchor found" };

  // Text after the anchor word.
  const after = text.slice(anchor.index + anchor[0].length);

  // Cut at the next section boundary (search the remainder only).
  const boundary = SECTION_BOUNDARY_RE.exec(after);
  let list = boundary ? after.slice(0, boundary.index) : after;

  // Collapse internal newlines/whitespace into single spaces; tidy edges.
  list = list.replace(/\s*\n\s*/g, " ").replace(/\s{2,}/g, " ").trim();
  // Drop a dangling separator the boundary sometimes leaves.
  list = list.replace(/[;,\-–—:\s]+$/, "").trim();

  // Validation — guard against grabbing the nutrition table or a stray word.
  const looksLikeList = /,/.test(list) || list.length >= 20;
  const digitRatio = (list.replace(/[^0-9]/g, "").length) / Math.max(1, list.length);
  if (!looksLikeList) return { ok: false, parsed: list, reason: "parsed text too short / not a list" };
  if (digitRatio > 0.3) return { ok: false, parsed: list, reason: "looks like a nutrition table (mostly digits)" };

  return { ok: true, parsed: list };
}

// ── OCR (A — Tesseract, lazy client-side) ────────────────────────────────────
// Dynamically imported ONLY when called, so the multi-MB engine never loads on
// the scan path / page load — only when the user actually taps "add ingredients".
export type OcrResult = { text: string; confidence: number };

export async function runIngredientOcr(image: File | Blob | string): Promise<OcrResult> {
  const Tesseract = await import("tesseract.js"); // lazy — first load only on demand
  const worker = await Tesseract.createWorker("eng");
  try {
    const { data } = await worker.recognize(image);
    return {
      text: data.text ?? "",
      confidence: typeof data.confidence === "number" ? data.confidence : 0,
    };
  } finally {
    await worker.terminate();
  }
}

// ── STAGE (D — user-confirmed → staging tier, NEVER authoritative cache) ──────
export type OcrSubmission = {
  barcode: string;
  rawText: string;
  parsed: string;
  confidence: number;
};

/**
 * Write a user-confirmed OCR capture to the STAGING table (verified=false) for
 * later admin promotion. Deliberately routes through submitCommunity — it does
 * NOT call upsertProductCache and NEVER writes gorilla_product_cache.ingredients_text.
 */
export async function submitOcrIngredients(input: OcrSubmission): Promise<SubmitResult> {
  return submitCommunity(OCR_STAGING_TABLE, {
    barcode: input.barcode,
    raw_ocr_text: input.rawText,
    parsed_ingredients: input.parsed,
    ocr_confidence: Math.round(input.confidence * 100) / 100,
  });
}
