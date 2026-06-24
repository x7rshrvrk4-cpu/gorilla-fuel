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
  dataSource?: string;
};

export default function OtherSubmitForm({ barcode, initialName = "", dataSource }: Props) {
  const [note, setNote] = useState("");

  function buildPayload({ name, barcode }: CommonFields): BuildResult {
    return {
      ok: true,
      payload: {
        barcode,
        product_name: name,
        // brand column exists (defaults to '' server-side); the Other form omits it.
        note: note.trim() || null,
      },
    };
  }

  return (
    <CommunitySubmitShell
      barcode={barcode}
      table="community_other_products"
      initialName={initialName}
      dataSource={dataSource}
      namePlaceholder="e.g. what is this product?"
      showBrand={false}
      headerTitle="ADD THIS PRODUCT"
      headerSubtitle="Not food, drink, or a supplement? Tell us what it is and we'll take it from here."
      buildPayload={buildPayload}
    >
      <div>
        <label className={labelCls}>Note (optional)</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What is it? Anything that would help us identify and add it…"
          rows={3}
          className={`${inputCls} resize-y`}
        />
      </div>
    </CommunitySubmitShell>
  );
}
