import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CrossLinkBanner from "../../components/CrossLinkBanner";
import GlutenFreeClient from "../GlutenFreeClient";

const TABS = ["alcohol", "breads", "pasta", "flours", "snacks", "cereals"] as const;
type Tab = (typeof TABS)[number];

export function generateStaticParams() {
  return TABS.map((tab) => ({ tab }));
}

export async function generateMetadata({ params }: { params: Promise<{ tab: string }> }): Promise<Metadata> {
  const { tab } = await params;
  if (!TABS.includes(tab as Tab)) return {};
  const label = tab.charAt(0).toUpperCase() + tab.slice(1);
  return {
    title: `Gluten Free ${label} — Gorilla Fuel`,
    description: `The honest guide to gluten free ${tab} in Canada — what is truly safe for celiac disease and what is just marketing.`,
    alternates: { canonical: `/glutenfree/${tab}` },
  };
}

export default async function GlutenFreeTabPage({ params }: { params: Promise<{ tab: string }> }) {
  const { tab } = await params;
  if (!TABS.includes(tab as Tab)) notFound();
  return (
    <>
      <GlutenFreeClient initialTab={tab as Tab} />
      <div className="mx-auto w-full max-w-5xl px-5 pb-12 sm:px-8">
        <div className="-mx-5 sm:-mx-8">
          <CrossLinkBanner />
        </div>
      </div>
    </>
  );
}
