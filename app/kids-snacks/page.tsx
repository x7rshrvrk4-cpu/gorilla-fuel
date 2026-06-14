import type { Metadata } from "next";
import { Suspense } from "react";
import KidsSnacksClient from "./KidsSnacksClient";

export const metadata: Metadata = {
  title: "Kids' Snacks — The Cheat Zone — Gorilla Fuel",
  description:
    "The Canadian kids' snack aisle sorted honestly: genuinely clean choices, the health-halo 'cheat zone', and the ones to skip — with marketing-vs-reality callouts and verified Canadian dye status.",
  alternates: { canonical: "/kids-snacks" },
};

export default function KidsSnacksPage() {
  // Suspense boundary required because KidsSnacksClient reads useSearchParams().
  return (
    <Suspense>
      <KidsSnacksClient />
    </Suspense>
  );
}
