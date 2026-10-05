import type { ReelProps } from "./schema";

const GOLD = "#e8b23a";

// The first reel: the Meal Finder launch (matches the approved IG preview).
// Phase 2 will add the full rotating library across every site topic + a
// season→topic weighting (food/alcohol near the holidays, fitness in January…).
export const MEAL_FINDER_REEL: ReelProps = {
  accent: GOLD,
  topicTag: "New tool · free",
  headline: ["YOU ALREADY", "HAVE DINNER."],
  goldLines: [1],
  sub: "You just don't know it yet. Tap what's in your kitchen — we rank the healthy meals you can make right now.",
  ctaLabel: "Find your meal",
  ctaUrl: "gorillafuel.ca/fitness/recipes",
  pills: [
    { score: 88, name: "Chicken Breast" },
    { score: 95, name: "Broccoli" },
    { score: 82, name: "Brown Rice" },
  ],
  reco: { name: "Chicken & Broccoli Rice Bowl", kcal: 520, protein: 45, tag: "✓ Make it now" },
};
