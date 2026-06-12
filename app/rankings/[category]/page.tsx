import type { Metadata } from "next";
import { notFound } from "next/navigation";
import RankingsClient from "../RankingsClient";
import type { Category } from "../lib/products";

/** URL slug → rankings category tab. */
const CATEGORY_SLUGS: Record<string, Category> = {
  creatine: "Creatine",
  "whey-protein": "Whey Protein",
  "casein-protein": "Casein Protein",
  "plant-protein": "Plant Protein",
  "pre-workout": "Pre-Workout",
  bcaa: "BCAAs/EAAs",
  sleep: "Sleep & Recovery",
  "fish-oil": "Fish Oil & Omega-3",
  greens: "Greens Powders",
  electrolytes: "Electrolytes",
  collagen: "Collagen",
  vitamins: "Vitamins & Minerals",
  "protein-bars": "Protein Bars",
};

export function generateStaticParams() {
  return Object.keys(CATEGORY_SLUGS).map((category) => ({ category }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  const cat = CATEGORY_SLUGS[category];
  if (!cat) return {};
  return {
    title: `${cat} Rankings — Gorilla Fuel`,
    description: `Independent ${cat.toLowerCase()} rankings for Canada — purity, third-party testing, and value. No brand pays for placement.`,
    alternates: { canonical: `/rankings/${category}` },
  };
}

export default async function RankingsCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const cat = CATEGORY_SLUGS[category];
  if (!cat) notFound();
  return <RankingsClient initialCategory={cat} />;
}
