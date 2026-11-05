import { ImageResponse } from "next/og";
import { getWeeklyPicks } from "../../../lib/weeklyPicks";
import { wineGorillaScore } from "../../../alcohol/lib/products";
import { mealScore } from "../../../fitness/lib/recipes";

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
  const { alcohol, food, supp, meal, smoothie, wine } = getWeeklyPicks();

  const rows: Row[] = [];
  if (alcohol)
    rows.push({ tag: "ALCOHOL", color: "#d98b2b", brand: alcohol.brand, name: alcohol.name, metric: `${alcohol.gorillaPour}/5 Pour` });
  if (food)
    rows.push({ tag: "FOOD", color: "#34b36b", brand: food.brand, name: food.name, metric: `${food.score}/100` });
  if (supp)
    rows.push({ tag: "SUPPLEMENT", color: "#4a90d9", brand: supp.brand, name: supp.name, metric: `Grade ${supp.grade}` });

  if (wine)
    rows.splice(1, 0, { tag: "WINE", color: "#e0627c", brand: wine.brand, name: wine.name, metric: `${wineGorillaScore(wine)}/100` });
  if (meal)
    rows.push({ tag: "MEAL", color: "#e8863a", brand: `${meal.mealType} · ${meal.macros.calories} kcal · ${meal.macros.protein} g protein`, name: meal.title, metric: `${mealScore(meal)}/100` });
  if (smoothie)
    rows.push({ tag: "SMOOTHIE", color: "#d65fd0", brand: `${smoothie.perServing.kcal} kcal · ${smoothie.perServing.protein} g protein · ${smoothie.perServing.sugar} g sugar`, name: smoothie.name, metric: `${smoothie.sugarFlag} sugar` });

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
          padding: story ? 56 : 36,
          justifyContent: story ? "center" : "flex-start",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: story ? 56 : 44 }}>🦍</div>
          <div style={{ display: "flex", fontSize: story ? 34 : 28, letterSpacing: 6, color: GOLD, fontWeight: 700 }}>
            GORILLA FUEL
          </div>
        </div>

        <div style={{ display: "flex", color: "#ffffff", fontSize: story ? 64 : 44, fontWeight: 800, marginTop: story ? 28 : 14, lineHeight: 1.05 }}>
          This Week&apos;s Gorilla Picks
        </div>
        <div style={{ display: "flex", color: MUTED, fontSize: story ? 30 : 24, marginTop: 10 }}>
          Six rotating picks. New every Monday.
        </div>

        <div style={{ display: "flex", flexDirection: story ? "column" : "row", ...(story ? {} : { flexWrap: "wrap" }), gap: story ? 18 : 12, marginTop: story ? 40 : 18, ...(story ? {} : { width: "100%" }) }}>
          {rows.map((r) => (
            <div
              key={r.tag}
              style={{
                display: "flex",
                flexDirection: "column",
                backgroundColor: CARD,
                border: `1px solid ${r.color}55`,
                borderRadius: 14,
                padding: story ? 22 : 14,
                overflow: "hidden",
                ...(story ? {} : { width: 552, height: 118 }),
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div
                  style={{
                    display: "flex",
                    color: r.color,
                    fontSize: story ? 22 : 15,
                    letterSpacing: 4,
                    fontWeight: 700,
                  }}
                >
                  {r.tag}
                </div>
                <div style={{ display: "flex", color: GOLD, fontSize: story ? 30 : 22, fontWeight: 800 }}>{r.metric}</div>
              </div>
              <div style={{ display: "flex", color: "#ffffff", fontSize: story ? 36 : 24, fontWeight: 700, marginTop: story ? 8 : 4 }}>
                {r.name}
              </div>
              <div style={{ display: "flex", color: MUTED, fontSize: story ? 24 : 16, marginTop: 2 }}>{r.brand}</div>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            color: GOLD,
            fontSize: story ? 32 : 24,
            fontWeight: 700,
            marginTop: story ? 40 : "auto",
            paddingTop: story ? 0 : 10,
          }}
        >
          gorillafuel.ca
        </div>
      </div>
    ),
    { width: W, height: H }
  );
}
