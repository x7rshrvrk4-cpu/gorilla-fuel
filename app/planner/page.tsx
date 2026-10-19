import type { Metadata } from "next";
import Link from "next/link";
import PlannerClient from "./PlannerClient";
import { RECIPES } from "../fitness/lib/recipes";

export const metadata: Metadata = {
  title: "Budget Meal Planner — Gorilla Fuel",
  description:
    "Enter your weekly grocery budget, how many days and meals you are cooking, and how many people you are feeding. We pick healthy, Gorilla-scored recipes that fit the budget and build one grocery list with estimated costs from Statistics Canada Ontario prices.",
  alternates: { canonical: "/planner" },
};

export default function PlannerPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
      <p className="font-display text-sm tracking-[0.3em] text-gold">GORILLA FITNESS</p>
      <h1 className="mt-3 font-display text-4xl leading-[0.95] text-foreground sm:text-5xl">
        Budget Meal <span className="text-gold">Planner</span>
      </h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-foreground/85">
        Tell us your weekly budget, how many days and meals you are cooking, and how many people you are feeding. We choose
        from {RECIPES.length} Gorilla-scored recipes, aim for the highest Meal Score that fits your budget, share ingredients
        across meals to cut waste, and build one grocery list. Free, no account, nothing leaves your device.
      </p>
      <p className="mt-3 text-xs leading-relaxed text-foreground/75">
        Costs are <strong>estimates</strong>. Most prices are Statistics Canada&apos;s average retail prices for Ontario (August 2026,
        from retailer scanner data); items without a published price use our own rough estimates and are marked. Your store,
        brand and week will differ, and Costco bulk pricing is not included. Looking to cook from what you already have? Try the{" "}
        <Link href="/fitness/recipes" className="text-gold underline hover:text-foreground">Meal Finder</Link>.
      </p>
      <PlannerClient />
      <p className="mt-10 border-t border-line pt-4 text-xs leading-relaxed text-foreground/70">
        Price data: Statistics Canada, table 18-10-0245-01, average retail prices for selected products (Ontario). Estimates are
        approximations for planning, not store prices. Pantry staples that are not listed (salt, spices, soy sauce) are not
        counted. Recipes follow general healthy-eating principles and are not medical or dietary advice.
      </p>
    </div>
  );
}
