import type { MetadataRoute } from "next";
import { PLANS } from "./fitness/lib/plans";

const BASE = "https://www.gorillafuel.ca";

// Static routes worth indexing (admin + API intentionally excluded).
const STATIC_PATHS = [
  "", "about", "methodology", "attribution",
  "alcohol", "bc-liquor", "rankings", "rankings/alcohol",
  "approved", "approved/list", "avoid", "cheat", "top", "explore", "search", "scan",
  "beauty", "caffeine", "energy", "kids", "kids-snacks", "fitness", "fitness/recipes", "glutenfree",
];

// Dynamic params mirrored from their route files:
//   rankings/[category]  → CATEGORY_SLUGS keys (app/rankings/[category]/page.tsx)
//   glutenfree/[tab]     → TABS (app/glutenfree/[tab]/page.tsx)
//   fitness/[plan]       → PLANS slugs (imported, stays in sync)
const RANKING_CATEGORIES = [
  "creatine", "whey-protein", "casein-protein", "plant-protein", "pre-workout",
  "bcaa", "sleep", "fish-oil", "greens", "electrolytes", "collagen", "vitamins", "protein-bars",
];
const GLUTENFREE_TABS = ["alcohol", "breads", "pasta", "flours", "snacks", "cereals"];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entry = (path: string, priority: number, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]): MetadataRoute.Sitemap[number] => ({
    url: path ? `${BASE}/${path}` : BASE,
    lastModified: now,
    changeFrequency,
    priority,
  });

  return [
    entry("", 1, "weekly"), // home — rotates weekly
    ...STATIC_PATHS.filter((p) => p !== "").map((p) => entry(p, 0.8, "weekly")),
    ...RANKING_CATEGORIES.map((c) => entry(`rankings/${c}`, 0.7, "weekly")),
    ...GLUTENFREE_TABS.map((t) => entry(`glutenfree/${t}`, 0.6, "monthly")),
    ...PLANS.map((p) => entry(`fitness/${p.slug}`, 0.6, "monthly")),
  ];
}
