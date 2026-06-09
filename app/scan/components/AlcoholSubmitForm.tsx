"use client";

import { useState } from "react";
import {
  PRODUCT_TYPES,
  submitCommunityProduct,
  type ProductType,
} from "../lib/communityProducts";

type Props = {
  barcode: string;
};

const inputCls =
  "w-full rounded-sm border border-line bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted/50 focus:border-gold focus:outline-none";
const labelCls =
  "block text-[10px] uppercase tracking-[0.2em] text-muted mb-1";

export default function AlcoholSubmitForm({ barcode }: Props) {
  const [productName, setProductName] = useState("");
  const [brand, setBrand] = useState("");
  const [productType, setProductType] = useState<ProductType>("Beer");
  const [abv, setAbv] = useState("");
  const [calories, setCalories] = useState("");
  const [carbs, setCarbs] = useState("");
  const [sugar, setSugar] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!productName.trim()) {
      setError("Product name is required.");
      return;
    }
    const abvNum = parseFloat(abv);
    if (isNaN(abvNum) || abvNum < 0 || abvNum > 100) {
      setError("ABV must be a number between 0 and 100.");
      return;
    }
    const calNum = parseFloat(calories);
    if (isNaN(calNum) || calNum < 0) {
      setError("Calories must be a positive number.");
      return;
    }
    const carbNum = parseFloat(carbs);
    if (isNaN(carbNum) || carbNum < 0) {
      setError("Carbs must be a positive number.");
      return;
    }
    const sugarNum = parseFloat(sugar);
    if (isNaN(sugarNum) || sugarNum < 0) {
      setError("Sugar must be a positive number.");
      return;
    }

    setSubmitting(true);
    const ok = await submitCommunityProduct({
      barcode,
      product_name: productName.trim(),
      brand: brand.trim(),
      product_type: productType,
      abv: abvNum,
      calories_per_serving: calNum,
      carbs_per_serving: carbNum,
      sugar_per_serving: sugarNum,
    });
    setSubmitting(false);

    if (ok) {
      setSubmitted(true);
    } else {
      setError("Submission failed — please try again in a moment.");
    }
  }

  if (submitted) {
    return (
      <div className="gorilla-card mt-4 rounded-sm p-6 text-center">
        <p className="font-display text-xl text-gold">Submitted!</p>
        <p className="mt-2 text-sm text-muted">
          Thanks — our team will review and verify it shortly. Once approved it'll show up for everyone scanning this barcode.
        </p>
      </div>
    );
  }

  return (
    <div className="gorilla-card mt-4 overflow-hidden rounded-sm">
      {/* Header */}
      <div className="border-b border-line bg-surface px-5 py-3">
        <p className="font-display text-sm tracking-[0.3em] text-gold">KNOW THIS PRODUCT?</p>
        <p className="mt-0.5 text-xs text-muted">
          Help the community — your data gets reviewed before it goes live.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 p-5">
        {/* Barcode — read-only, auto-filled from scan */}
        <div>
          <label className={labelCls}>Barcode (auto-filled)</label>
          <input
            type="text"
            value={barcode}
            readOnly
            className={`${inputCls} cursor-default opacity-60`}
          />
        </div>

        {/* Name + Brand */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Product Name *</label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. Coors Light"
              required
              autoComplete="off"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Brand</label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g. Molson Coors"
              autoComplete="off"
              className={inputCls}
            />
          </div>
        </div>

        {/* Product Type */}
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

        {/* ABV + Calories */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>ABV (%)</label>
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              min="0"
              max="100"
              value={abv}
              onChange={(e) => setAbv(e.target.value)}
              placeholder="e.g. 4.2"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Calories per serving</label>
            <input
              type="number"
              inputMode="decimal"
              step="1"
              min="0"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              placeholder="e.g. 102"
              className={inputCls}
            />
          </div>
        </div>

        {/* Carbs + Sugar */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Carbs per serving (g)</label>
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              min="0"
              value={carbs}
              onChange={(e) => setCarbs(e.target.value)}
              placeholder="e.g. 5.0"
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
              placeholder="e.g. 0"
              className={inputCls}
            />
          </div>
        </div>

        {/* Serving note */}
        <p className="text-[10px] text-muted/60">
          Use 355mL (standard can) as your serving size for beers, lagers, ales, IPAs, stouts, hard seltzers, and ciders.
          Use 148mL for wine, 44mL for spirits.
        </p>

        {error && (
          <p className="rounded-sm border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-sm bg-gold px-4 py-3 font-display text-sm tracking-widest text-background transition-colors hover:bg-gold/90 disabled:opacity-50"
        >
          {submitting ? "Submitting…" : "Submit This Product"}
        </button>
      </form>
    </div>
  );
}
