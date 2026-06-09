import Image from "next/image";
import type { DrugProduct } from "../../api/drugfacts/route";
import SourceBadge from "./SourceBadge";
import SourcesFooter from "./SourcesFooter";

type Props = {
  product: DrugProduct;
};

export default function DrugResultCard({ product }: Props) {
  return (
    <div className="gorilla-card animate-rise overflow-hidden rounded-sm">
      {/* MEDICATION BANNER — blue */}
      <div className="flex items-center gap-2 border-b border-sky-400/30 bg-sky-500/10 px-6 py-3">
        <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-sky-400" />
        <p className="font-display text-sm uppercase tracking-[0.3em] text-sky-300">
          💊 Medication · OTC Drug
        </p>
        <SourceBadge source="open-drug-facts" className="ml-auto" />
      </div>

      {/* IDENTITY */}
      <div className="flex items-start gap-4 border-b border-line p-6">
        {product.image && (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-line bg-background">
            <Image
              src={product.image}
              alt={product.name}
              width={80}
              height={80}
              unoptimized
              className="h-full w-full object-contain"
            />
          </div>
        )}
        <div className="flex-1">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted">{product.brand || "Unknown Manufacturer"} · {product.barcode}</p>
          <h2 className="mt-1 font-display text-2xl leading-tight text-foreground">{product.name}</h2>
          {product.categoriesTags.length > 0 && (
            <p className="mt-1 text-xs text-muted">
              {product.categoriesTags
                .filter((t) => t.startsWith("en:"))
                .slice(0, 3)
                .map((t) => t.replace("en:", "").replace(/-/g, " "))
                .join(" · ")}
            </p>
          )}
        </div>
      </div>

      {/* ACTIVE INGREDIENTS */}
      {product.ingredientsText && (
        <div className="border-b border-line px-6 py-5">
          <h3 className="font-display text-base uppercase tracking-[0.2em] text-foreground">Ingredients / Active Substances</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">{product.ingredientsText}</p>
        </div>
      )}

      {/* DISCLAIMER */}
      <div className="px-6 py-5">
        <div className="rounded-sm border border-red-500/30 bg-red-500/5 p-4">
          <p className="font-display text-xs uppercase tracking-[0.2em] text-red-400">⚠ Important Disclaimer</p>
          <p className="mt-2 text-sm leading-relaxed text-red-300/80">
            This is not medical advice. Always follow the label directions and consult a healthcare
            professional before use. Information sourced from Open Drug Facts — verify against the
            actual product packaging.
          </p>
        </div>
      </div>

      <SourcesFooter />
    </div>
  );
}
