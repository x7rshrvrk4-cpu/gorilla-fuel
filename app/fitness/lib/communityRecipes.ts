/*
 * ── COMMUNITY RECIPES — staging submissions ──────────────────────────────────
 * Users build + score a recipe in the Recipe Scorer and can submit it to Gorilla
 * Fuel. Submissions land in a STAGING table (verified = false) for admin review,
 * exactly like community_alcohol_products / community_ocr_ingredients. A good one
 * is later promoted by hand into the curated RECIPES list (app/fitness/lib/
 * recipes.ts) — where it gets proper pantry mappings and a real Gorilla Meal Score.
 *
 * SAFETY INVARIANT: a raw public submission NEVER appears in the Meal Finder or
 * anywhere user-facing until an admin promotes it. Anon can only INSERT (unverified);
 * there is no anon SELECT. A spam/garbage submission therefore changes nothing live.
 *
 * SQL — run ONCE in the Supabase SQL Editor to provision the table:
 *
 *   create table public.community_recipes (
 *     id            uuid        primary key default gen_random_uuid(),
 *     title         text        not null,
 *     ingredients   jsonb       not null,          -- [{ pantryId, name, core }] plus free-text extras
 *     calories      numeric(6,1),                  -- nullable: user may not supply macros
 *     protein       numeric(5,1),
 *     gorilla_score integer,                       -- the score the scorer computed at submit time
 *     notes         text,                          -- optional note from the submitter
 *     submitted_at  timestamptz not null default now(),
 *     verified      boolean     not null default false
 *   );
 *   create index community_recipes_pending_idx
 *     on public.community_recipes (submitted_at desc)
 *     where verified = false;
 *   alter table public.community_recipes enable row level security;
 *   -- Anon may submit (always unverified); NO anon select (admin review only).
 *   create policy "Submit community recipes"
 *     on public.community_recipes for insert
 *     to anon with check (verified = false);
 *
 * SCREENSHOT UPLOADS — add an image column + a public Storage bucket with anon upload:
 *
 *   alter table public.community_recipes add column if not exists image_url text;
 *
 *   insert into storage.buckets (id, name, public)
 *     values ('recipe-screenshots', 'recipe-screenshots', true)
 *     on conflict (id) do nothing;
 *   create policy "Anon upload recipe screenshots"
 *     on storage.objects for insert to anon
 *     with check (bucket_id = 'recipe-screenshots');
 *   -- public read is automatic for a public bucket (so the admin page can show the image).
 */

import { submitCommunity, type SubmitResult } from "../../scan/lib/communityProducts";

const TABLE = "community_recipes";
const BUCKET = "recipe-screenshots";

function sbUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
}
function sbKey(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
}

export type UploadResult = { ok: boolean; url?: string; message?: string };

/**
 * Upload a recipe screenshot to the public `recipe-screenshots` bucket via the
 * Supabase Storage REST API (anon key). Returns the public URL on success. The
 * image is user-review material only — it never auto-populates anything live.
 */
export async function uploadRecipeScreenshot(file: File): Promise<UploadResult> {
  const url = sbUrl();
  const key = sbKey();
  if (!url || !key) return { ok: false, message: "Storage not configured" };
  if (!file.type.startsWith("image/")) return { ok: false, message: "Please choose an image file." };
  if (file.size > 6 * 1024 * 1024) return { ok: false, message: "Image too large (max 6 MB)." };

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  try {
    const res = await fetch(`${url}/storage/v1/object/${BUCKET}/${path}`, {
      method: "POST",
      headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": file.type || "image/jpeg", "x-upsert": "true" },
      body: file,
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      return { ok: false, message: `Upload failed (${res.status})${t ? `: ${t.slice(0, 120)}` : ""}` };
    }
    return { ok: true, url: `${url}/storage/v1/object/public/${BUCKET}/${path}` };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Network error" };
  }
}

export type CommunityRecipeIngredient = { pantryId: string | null; name: string; core: boolean };

export type CommunityRecipeSubmission = {
  title: string;
  ingredients: CommunityRecipeIngredient[];
  calories: number | null;
  protein: number | null;
  gorilla_score: number | null;
  notes?: string;
  /** Public URL of an uploaded recipe screenshot, when submitted that way. */
  image_url?: string;
};

/**
 * Submit a user-built recipe to the staging queue. Always stored verified=false
 * (enforced by RLS and by submitCommunity). Returns the real HTTP status/message
 * on failure so the UI can show the true cause.
 */
export async function submitCommunityRecipe(data: CommunityRecipeSubmission): Promise<SubmitResult> {
  return submitCommunity(TABLE, data as unknown as Record<string, unknown>);
}
