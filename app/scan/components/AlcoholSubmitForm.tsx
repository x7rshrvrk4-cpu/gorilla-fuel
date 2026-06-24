"use client";

import { useState } from "react";
import { PRODUCT_TYPES, type ProductType } from "../lib/communityProducts";
import {
  CommunitySubmitShell,
  inputCls,
  labelCls,
  type CommonFields,
  type BuildResult,
} from "./communityForm";

type Props = {
  barcode: string;
  /** Pre-filled from COLA Cloud / WineVybe fallback lookup, if available. */
  initialName?: string;
  initialBrand?: string;
  initialAbv?: number;
  /** Which external source pre-filled the form, shown as a badge. */
  dataSource?: string;
};

export default function AlcoholSubmitForm({
  barcode,
  initialName = "",
  initialBrand = "",
  initialAbv,
  dataSource,
}: Props) {
  const [productType, setProductType] = useState<ProductType>("Beer");
  const [abv, setAbv] = useState(initialAbv !== undefined ? String(initialAbv) : "");
  const [calories, setCalories] = useState("");
  const [carbs, setCarbs] = useState("");
  const [sugar, setSugar] = useState("");

  function buildPayload({ name, brand, barcode }: CommonFields): BuildResult {
    const abvNum = parseFloat(abv);
    if (isNaN(abvNum) || abvNum < 0 || abvNum > 100) {
      return { ok: false, error: "ABV must be a number between 0 and 100." };
    }
    // Nutrition fields are optional — only parse if the user provided a value
    const calNum = calories.trim() ? parseFloat(calories) : null;
    const carbNum = carbs.trim() ? parseFloat(carbs) : null;
    const sugarNum = sugar.trim() ? parseFloat(sugar) : null;

    if (calNum !== null && (isNaN(calNum) || calNum < 0)) {
      return { ok: false, error: "Calories must be a positive number." };
    }
    if (carbNum !== null && (isNaN(carbNum) || carbNum < 0)) {
      return { ok: false, error: "Carbs must be a positive number." };
    }
    if (sugarNum !== null && (isNaN(sugarNum) || sugarNum < 0)) {
      return { ok: false, error: "Sugar must be a positive number." };
    }

    return {
      ok: true,
      payload: {
        barcode,
        product_name: name,
        brand,
        product_type: productType,
        abv: abvNum,
        calories_per_serving: calNum,
        carbs_per_serving: carbNum,
        sugar_per_serving: sugarNum,
      },
    };
  }

  return (
    <CommunitySubmitShell
      barcode={barcode}
      table="community_alcohol_products"
      initialName={initialName}
      initialBrand={initialBrand}
      dataSource={dataSource}
      namePlaceholder="e.g. Busch Light"
      brandPlaceholder="e.g. Anheuser-Busch"
      buildPayload={buildPayload}
    >
      {/* Product Type + ABV */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Product Type *</label>
          <select
            value={productType}
            onChange={(e) => setProductType(e.target.value as ProductType)}
            className={inputCls}
          >
            {PRODUCT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>ABV (%) *</label>
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0"
            max="100"
            value={abv}
            onChange={(e) => setAbv(e.target.value)}
            placeholder="e.g. 4.2"
            required
            className={inputCls}
          />
        </div>
      </div>

      {/* Canadian label disclaimer */}
      <div className="rounded-sm border border-amber-400/25 bg-amber-400/5 px-4 py-3">
        <p className="text-[10px] leading-relaxed text-amber-300/70">
          <span className="font-display tracking-wide text-amber-300/90">Canadian alcohol labels are not required to show full nutrition info.</span>{" "}
          Fill in what you know from the label or the manufacturer&apos;s website — leave blank anything that isn&apos;t publicly disclosed.
          Missing fields will display as <span className="font-mono text-muted">—</span> rather than zero.
        </p>
      </div>

      {/* Nutrition (all optional) */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={labelCls}>Calories per serving</label>
          <input
            type="number"
            inputMode="decimal"
            step="1"
            min="0"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            placeholder="— optional"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Carbs per serving (g)</label>
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0"
            value={carbs}
            onChange={(e) => setCarbs(e.target.value)}
            placeholder="— optional"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Sugar per serving (g)</label>
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0"
            value={sugar}
            onChange={(e) => setSugar(e.target.value)}
            placeholder="— optional"
            className={inputCls}
          />
        </div>
      </div>

      {/* Serving note */}
      <p className="text-[10px] text-muted/60">
        Use 355mL (standard can) as your serving size for beers, lagers, ales, IPAs, stouts, hard seltzers, and ciders.
        Use 148mL for wine, 44mL for spirits.
      </p>
    </CommunitySubmitShell>
  );
}
