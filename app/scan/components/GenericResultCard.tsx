import Image from "next/image";
import type { GoUpcProduct } from "../../api/goupc/route";
import SourceBadge from "./SourceBadge";
import SourcesFooter from "./SourcesFooter";

type Props = {
  product: GoUpcProduct;
  onSubmit: () => void;
};

export default function GenericResultCard({ product, onSubmit }: Props) {
  return (
    <div className="gorilla-card animate-rise overflow-hidden rounded-sm">
      {/* BANNER */}
      <div className="flex items-center gap-2 border-b border-line bg-surface px-6 py-3">
        <span className="h-2 w-2 shrink-0 rounded-full bg-slate-400" />
        <p className="font-display text-sm uppercase tracking-[0.3em] text-muted">
          Product Found
        </p>
        <SourceBadge source="go-upc" className="ml-auto" />
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
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted">{product.brand || "Unknown Brand"} · {product.barcode}</p>
          <h2 className="mt-1 font-display text-2xl leading-tight text-foreground">{product.name}</h2>
          {product.category && (
            <p className="mt-1 text-xs text-muted">{product.category}</p>
          )}
          {product.description && (
            <p className="mt-2 text-sm leading-relaxed text-muted">{product.description}</p>
          )}
        </div>
      </div>

      {/* NO NUTRITION DATA NOTICE */}
      <div className="border-b border-line px-6 py-5">
        <div className="rounded-sm border border-amber-400/25 bg-amber-400/5 p-4">
          <p className="text-sm leading-relaxed text-amber-200/80">
            <span className="font-display tracking-wide text-amber-300">Product identified, but no nutrition data is available.</span>{" "}
            Go-UPC confirmed this barcode exists in their 500M+ product database, but detailed
            nutritional information isn&apos;t stored there. If you know the nutrition facts, submit them below
            and they&apos;ll be verified and added for everyone.
          </p>
          <button
            type="button"
            onClick={onSubmit}
            className="mt-3 rounded-sm border border-amber-400/40 px-4 py-2 font-display text-xs tracking-widest text-amber-300 transition-colors hover:bg-amber-400/10"
          >
            Submit Nutrition Data
          </button>
        </div>
      </div>

      <SourcesFooter />
    </div>
  );
}
