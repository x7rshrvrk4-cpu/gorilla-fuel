import type { Metadata } from "next";
import RecipeScorerClient from "./RecipeScorerClient";

export const metadata: Metadata = {
  title: "Recipe Scorer — Gorilla Fuel",
  description:
    "Build any meal from real ingredients and get its Gorilla Meal Score instantly — the weak link to swap, and a grocery list with buy links. Save your own recipes. Free, no account.",
  alternates: { canonical: "/fitness/recipe-scorer" },
};

export default function RecipeScorerPage() {
  return <RecipeScorerClient />;
}
