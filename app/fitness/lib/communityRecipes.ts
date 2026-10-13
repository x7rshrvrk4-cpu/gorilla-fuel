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
 */

import { submitCommunity, type SubmitResult } from "../../scan/lib/communityProducts";

const TABLE = "community_recipes";

export type CommunityRecipeIngredient = { pantryId: string | null; name: string; core: boolean };

export type CommunityRecipeSubmission = {
  title: string;
  ingredients: CommunityRecipeIngredient[];
  calories: number | null;
  protein: number | null;
  gorilla_score: number | null;
  notes?: string;
};

/**
 * Submit a user-built recipe to the staging queue. Always stored verified=false
 * (enforced by RLS and by submitCommunity). Returns the real HTTP status/message
 * on failure so the UI can show the true cause.
 */
export async function submitCommunityRecipe(data: CommunityRecipeSubmission): Promise<SubmitResult> {
  return submitCommunity(TABLE, data as unknown as Record<string, unknown>);
}
