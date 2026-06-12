import type { Metadata } from "next";
import CrossLinkBanner from "../components/CrossLinkBanner";

export const metadata: Metadata = {
  title: "About — Gorilla Fuel",
  description:
    "Gorilla Fuel is a Canadian product intelligence platform. Independent scores for food, supplements and alcohol — no brand pays for placement. Free forever.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <div className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
        <p className="font-display text-sm tracking-[0.3em] text-gold">THE GORILLA STANDARD</p>
        <h1 className="mt-3 font-display text-5xl leading-[0.95] text-foreground sm:text-6xl">
          About <span className="text-gold">Gorilla Fuel</span>
        </h1>

        <div className="mt-8 space-y-5 text-base leading-relaxed text-muted">
          <p>
            Gorilla Fuel is a Canadian product intelligence platform built for
            people who want to know what is actually in their food, supplements
            and alcohol — without wading through marketing spin. We score
            products based on ingredient quality, nutritional value and
            processing level, using a transparent, publicly documented
            methodology.
          </p>
          <p>
            <span className="text-foreground">We are not affiliated with any
            brand. No company pays for a better score. No product is featured
            because someone paid for placement.</span> The data determines
            everything.
          </p>
          <p>
            We cover food and snacks, supplements, alcohol — beer and wine —
            and beauty and personal care products. Our scanner works on any
            barcode. Our database covers over 50,000 Canadian products.
          </p>
          <p className="font-display text-xl tracking-wide text-foreground">
            Gorilla Fuel is free. It will stay free.
          </p>
          <p>
            gorillafuel.ca was built in London, Ontario, Canada. 🦍
          </p>
        </div>
      </div>
      <CrossLinkBanner />
    </>
  );
}
