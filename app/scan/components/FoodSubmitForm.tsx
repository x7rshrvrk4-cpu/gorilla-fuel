"use client";

import { useState } from "react";
import {
  CommunitySubmitShell,
  inputCls,
  labelCls,
  type CommonFields,
  type BuildResult,
} from "./communityForm";

type Props = {
  barcode: string;
  initialName?: string;
  initialBrand?: string;
  dataSource?: string;
};

/** Parse an optional non-negative number field. Returns { ok, value|error }. */
function optNum(raw: string, fieldLabel: string): { ok: true; value: number | null } | { ok: false; error: string } {
  if (!raw.trim()) return { ok: true, value: null };
  const n = parseFloat(raw);
  if (isNaN(n) || n < 0) return { ok: false, error: `${fieldLabel} must be a positive number.` };
  return { ok: true, value: n };
}

export default function FoodSubmitForm({
  barcode,
  initialName = "",
  initialBrand = "",
  dataSource,
}: Props) {
  const [calories, setCalories] = useState("");
  const [fat, setFat] = useState("");
  const [satFat, setSatFat] = useState("");
  const [carbs, setCarbs] = useState("");
  const [sugar, setSugar] = useState("");
  const [fiber, setFiber] = useState("");
  const [protein, setProtein] = useState("");
  const [sodium, setSodium] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [servingSize, setServingSize] = useState("");

  function buildPayload({ name, brand, barcode }: CommonFields): BuildResult {
    const fields: Array<[string, string, string]> = [
      ["energy_kcal_100g", calories, "Calories"],
      ["fat_100g", fat, "Fat"],
      ["saturated_fat_100g", satFat, "Saturated fat"],
      ["carbohydrates_100g", carbs, "Carbs"],
      ["sugars_100g", sugar, "Sugar"],
      ["fiber_100g", fiber, "Fibre"],
      ["proteins_100g", protein, "Protein"],
      ["sodium_mg_100g", sodium, "Sodium"],
      ["serving_size_g", servingSize, "Serving size"],
    ];
    const payload: Record<string, unknown> = {
      barcode,
      product_name: name,
      brand,
      ingredients_text: ingredients.trim() || null,
    };
    for (const [col, raw, label] of fields) {
      const parsed = optNum(raw, label);
      if (!parsed.ok) return { ok: false, error: parsed.error };
      payload[col] = parsed.value;
    }
    return { ok: true, payload };
  }

  return (
    <CommunitySubmitShell
      barcode={barcode}
      table="community_food_products"
      initialName={initialName}
      initialBrand={initialBrand}
      dataSource={dataSource}
      namePlaceholder="e.g. Oat Crunch Granola"
      brandPlaceholder="e.g. Nature Valley"
      buildPayload={buildPayload}
    >
      {/* Canadian label note + scoring hint */}
      <div className="rounded-sm border border-amber-400/25 bg-amber-400/5 px-4 py-3">
        <p className="text-[10px] leading-relaxed text-amber-300/70">
          <span className="font-display tracking-wide text-amber-300/90">Enter values per 100&nbsp;g</span>{" "}
          (the second column on a Canadian Nutrition Facts table). Leave blank anything you can&apos;t read off the label —
          missing fields display as <span className="font-mono text-muted">—</span> rather than zero.{" "}
          <span className="text-amber-300/90">Adding the ingredients list improves the score</span> — it&apos;s what powers additive detection.
        </p>
      </div>

      {/* Macros — all optional, per 100g */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={labelCls}>Calories (per 100g)</label>
          <input type="number" inputMode="decimal" step="1" min="0" value={calories} onChange={(e) => setCalories(e.target.value)} placeholder="— optional" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Fat (g / 100g)</label>
          <input type="number" inputMode="decimal" step="0.1" min="0" value={fat} onChange={(e) => setFat(e.target.value)} placeholder="— optional" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Saturated fat (g / 100g)</label>
          <input type="number" inputMode="decimal" step="0.1" min="0" value={satFat} onChange={(e) => setSatFat(e.target.value)} placeholder="— optional" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Carbs (g / 100g)</label>
          <input type="number" inputMode="decimal" step="0.1" min="0" value={carbs} onChange={(e) => setCarbs(e.target.value)} placeholder="— optional" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Sugar (g / 100g)</label>
          <input type="number" inputMode="decimal" step="0.1" min="0" value={sugar} onChange={(e) => setSugar(e.target.value)} placeholder="— optional" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Fibre (g / 100g)</label>
          <input type="number" inputMode="decimal" step="0.1" min="0" value={fiber} onChange={(e) => setFiber(e.target.value)} placeholder="— optional" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Protein (g / 100g)</label>
          <input type="number" inputMode="decimal" step="0.1" min="0" value={protein} onChange={(e) => setProtein(e.target.value)} placeholder="— optional" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Sodium (mg / 100g)</label>
          <input type="number" inputMode="decimal" step="1" min="0" value={sodium} onChange={(e) => setSodium(e.target.value)} placeholder="— optional" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Serving size (g)</label>
          <input type="number" inputMode="decimal" step="1" min="0" value={servingSize} onChange={(e) => setServingSize(e.target.value)} placeholder="— optional" className={inputCls} />
        </div>
      </div>

      {/* Ingredients — essential for the additive score */}
      <div>
        <label className={labelCls}>Ingredients list</label>
        <textarea
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          placeholder="Copy the ingredients straight from the package, in order…"
          rows={4}
          className={`${inputCls} resize-y`}
        />
        <p className="mt-1 text-[10px] text-muted/60">
          The single most useful field — additive detection runs on this text.
        </p>
      </div>
    </CommunitySubmitShell>
  );
}
