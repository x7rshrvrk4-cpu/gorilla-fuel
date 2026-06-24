"use client";

import { useState } from "react";
import AlcoholSubmitForm from "./AlcoholSubmitForm";
import FoodSubmitForm from "./FoodSubmitForm";
import SupplementSubmitForm from "./SupplementSubmitForm";
import OtherSubmitForm from "./OtherSubmitForm";
import MultiPackPrompt from "./MultiPackPrompt";

export type CommunityType = "food" | "alcohol" | "supplement" | "other";

type Props = {
  barcode: string;
  /** Default-selected tile — derived from scan context (alcohol detected → "alcohol", else "food"). */
  defaultType?: CommunityType;
  initialName?: string;
  initialBrand?: string;
  initialAbv?: number;
  dataSource?: string;
};

const TILES: { type: CommunityType; label: string; icon: string }[] = [
  { type: "food", label: "Food", icon: "🍎" },
  { type: "alcohol", label: "Alcohol", icon: "🍺" },
  { type: "supplement", label: "Supplement", icon: "💊" },
  { type: "other", label: "Other", icon: "📦" },
];

export default function CommunitySubmitPicker({
  barcode,
  defaultType = "food",
  initialName,
  initialBrand,
  initialAbv,
  dataSource,
}: Props) {
  const [type, setType] = useState<CommunityType>(defaultType);

  return (
    <div className="mt-4">
      {/* Type selector */}
      <p className="font-display text-sm tracking-[0.2em] text-gold">WHAT KIND OF PRODUCT?</p>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {TILES.map((t) => {
          const active = t.type === type;
          return (
            <button
              key={t.type}
              type="button"
              onClick={() => setType(t.type)}
              aria-pressed={active}
              className={`flex flex-col items-center gap-1.5 rounded-sm border px-3 py-4 transition-colors ${
                active
                  ? "border-gold bg-gold/10 text-gold"
                  : "border-line bg-surface text-muted hover:border-gold/50 hover:text-foreground"
              }`}
            >
              <span className="text-2xl leading-none">{t.icon}</span>
              <span className="font-display text-xs uppercase tracking-[0.15em]">{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active form */}
      {type === "food" && (
        <FoodSubmitForm
          barcode={barcode}
          initialName={initialName}
          initialBrand={initialBrand}
          dataSource={dataSource}
        />
      )}

      {type === "alcohol" && (
        <>
          {/* Alcohol-specific: multipack / different-size attach, then the full form */}
          <MultiPackPrompt barcode={barcode} primary />
          <AlcoholSubmitForm
            barcode={barcode}
            initialName={initialName}
            initialBrand={initialBrand}
            initialAbv={initialAbv}
            dataSource={dataSource}
          />
        </>
      )}

      {type === "supplement" && (
        <SupplementSubmitForm
          barcode={barcode}
          initialName={initialName}
          initialBrand={initialBrand}
          dataSource={dataSource}
        />
      )}

      {type === "other" && (
        <OtherSubmitForm barcode={barcode} initialName={initialName} dataSource={dataSource} />
      )}
    </div>
  );
}
