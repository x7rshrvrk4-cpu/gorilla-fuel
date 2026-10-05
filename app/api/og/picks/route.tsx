import { ImageResponse } from "next/og";
import { getWeeklyPicks } from "../../../lib/weeklyPicks";

// Dynamic social share-card for the week's Gorilla Picks. Two formats:
//   /api/og/picks            → 1200×630 (link previews, Twitter/Facebook card)
//   /api/og/picks?format=story → 1080×1920 (TikTok / Reels / Stories)
// Regenerated hourly so it tracks the weekly rotation without a redeploy.
export const revalidate = 3600;

const BG = "#0a0a0a";
const GOLD = "#e8b23a";
const MUTED = "#8a8a8a";
const CARD = "#161616";

type Row = { tag: string; color: string; name: string; metric: string; brand: string };

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const story = searchParams.get("format") === "story";
  const { alcohol, food, supp } = getWeeklyPicks();

  const rows: Row[] = [];
  if (alcohol)
    rows.push({ tag: "ALCOHOL", color: "#d98b2b", brand: alcohol.brand, name: alcohol.name, metric: `${alcohol.gorillaPour}/5 Pour` });
  if (food)
    rows.push({ tag: "FOOD", color: "#34b36b", brand: food.brand, name: food.name, metric: `${food.score}/100` });
  if (supp)
    rows.push({ tag: "SUPPLEMENT", color: "#4a90d9", brand: supp.brand, name: supp.name, metric: `Grade ${supp.grade}` });

  const W = story ? 1080 : 1200;
  const H = story ? 1920 : 630;
  const titleSize = story ? 72 : 56;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: BG,
          padding: story ? 72 : 56,
          justifyContent: story ? "center" : "flex-start",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: story ? 56 : 44 }}>🦍</div>
          <div style={{ display: "flex", fontSize: story ? 34 : 28, letterSpacing: 6, color: GOLD, fontWeight: 700 }}>
            GORILLA FUEL
          </div>
        </div>

        <div style={{ display: "flex", color: "#ffffff", fontSize: titleSize, fontWeight: 800, marginTop: story ? 40 : 20, lineHeight: 1.05 }}>
          This Week&apos;s Gorilla Picks
        </div>
        <div style={{ display: "flex", color: MUTED, fontSize: story ? 30 : 24, marginTop: 10 }}>
          A rotating weekly pick in each category.
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: story ? 28 : 18, marginTop: story ? 64 : 36 }}>
          {rows.map((r) => (
            <div
              key={r.tag}
              style={{
                display: "flex",
                flexDirection: "column",
                backgroundColor: CARD,
                border: `1px solid ${r.color}55`,
                borderRadius: 14,
                padding: story ? 34 : 24,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div
                  style={{
                    display: "flex",
                    color: r.color,
                    fontSize: story ? 24 : 18,
                    letterSpacing: 4,
                    fontWeight: 700,
                  }}
                >
                  {r.tag}
                </div>
                <div style={{ display: "flex", color: GOLD, fontSize: story ? 34 : 26, fontWeight: 800 }}>{r.metric}</div>
              </div>
              <div style={{ display: "flex", color: "#ffffff", fontSize: story ? 42 : 32, fontWeight: 700, marginTop: 10 }}>
                {r.name}
              </div>
              <div style={{ display: "flex", color: MUTED, fontSize: story ? 28 : 20, marginTop: 4 }}>{r.brand}</div>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            color: GOLD,
            fontSize: story ? 32 : 24,
            fontWeight: 700,
            marginTop: story ? 72 : "auto",
            paddingTop: story ? 0 : 28,
          }}
        >
          gorillafuel.ca
        </div>
      </div>
    ),
    { width: W, height: H }
  );
}
