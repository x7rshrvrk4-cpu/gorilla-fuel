import type { Metadata } from "next";
import KidsClient from "./KidsClient";

export const metadata: Metadata = {
  title: "Kids Snack Guide — Gorilla Fuel",
  description:
    "Healthy snack guide for Canadian parents. See which kids snacks are genuinely clean and which ones hide artificial colours behind cartoon packaging.",
  alternates: { canonical: "/kids" },
};

export default function KidsPage() {
  return <KidsClient />;
}
