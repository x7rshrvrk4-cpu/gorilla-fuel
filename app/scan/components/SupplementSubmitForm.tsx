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

export default function SupplementSubmitForm({
  barcode,
  initialName = "",
  initialBrand = "",
  dataSource,
}: Props) {
  const [supplementType, setSupplementType] = useState("");
  const [servingSize, setServingSize] = useState("");
  const [note, setNote] = useState("");

  function buildPayload({ name, brand, barcode }: CommonFields): BuildResult {
    return {
      ok: true,
      payload: {
        barcode,
        product_name: name,
        brand,
        supplement_type: supplementType.trim() || null,
        serving_size: servingSize.trim() || null,
        note: note.trim() || null,
      },
    };
  }

  return (
    <CommunitySubmitShell
      barcode={barcode}
      table="community_supplement_products"
      initialName={initialName}
      initialBrand={initialBrand}
      dataSource={dataSource}
      namePlaceholder="e.g. Whey Isolate Vanilla"
      brandPlaceholder="e.g. Optimum Nutrition"
      headerTitle="SUGGEST THIS SUPPLEMENT"
      headerSubtitle="Supplements are hand-reviewed and curated — your suggestion goes to our team."
      submitLabel="Suggest This Supplement"
      successTitle="Suggestion sent!"
      successMessage="Thanks — supplements are curated by hand, so our team will review this one and may add it to the rankings."
      buildPayload={buildPayload}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Supplement type</label>
          <input
            type="text"
            value={supplementType}
            onChange={(e) => setSupplementType(e.target.value)}
            placeholder="e.g. Whey protein, Creatine…"
            autoComplete="off"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Serving size</label>
          <input
            type="text"
            value={servingSize}
            onChange={(e) => setServingSize(e.target.value)}
            placeholder="e.g. 1 scoop (30g)"
            autoComplete="off"
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>Note (optional)</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Anything that would help us review it — flavour, key ingredients, where you bought it…"
          rows={3}
          className={`${inputCls} resize-y`}
        />
      </div>
    </CommunitySubmitShell>
  );
}
