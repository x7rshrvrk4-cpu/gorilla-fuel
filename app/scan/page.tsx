import type { Metadata } from "next";
import ScanClient from "./ScanClient";

export const metadata: Metadata = {
  title: "Live Product Scanner — Gorilla Fuel",
  description:
    "Point your camera at any barcode and get an instant no-BS health score — food, supplements, alcohol, beauty and medication barcodes all supported.",
  alternates: { canonical: "/scan" },
};

export default function ScanPage() {
  return <ScanClient />;
}
