import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PLANS, PLAN_BY_SLUG } from "../lib/plans";
import PlanView from "../components/PlanView";

/** Pre-render all five plan slugs (lean-down, build, tone-up, stay-healthy, energize). */
export function generateStaticParams() {
  return PLANS.map((plan) => ({ plan: plan.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ plan: string }> }): Promise<Metadata> {
  const { plan } = await params;
  const p = PLAN_BY_SLUG[plan];
  if (!p) return {};
  return {
    title: `${p.goalLabel} Plan — Gorilla Fuel`,
    description: p.oneLiner,
    alternates: { canonical: `/fitness/${plan}` },
  };
}

export default async function FitnessPlanPage({ params }: { params: Promise<{ plan: string }> }) {
  const { plan } = await params;
  const p = PLAN_BY_SLUG[plan];
  if (!p) notFound();
  return <PlanView plan={p} />;
}
