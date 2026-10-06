import { currentWeek, picksForWeek } from "../lib/weeklyPicks";

// Weekly Gorilla Picks as an RSS 2.0 feed — the automation hook. Point a
// scheduler (Make.com / Buffer / Zapier / n8n) at https://www.gorillafuel.ca/feed.xml
// and it gets one new item each week with a caption + share-card image, which it
// fans out to the connected socials. New week → new <item>, no manual step.
export const revalidate = 3600;

const BASE = "https://www.gorillafuel.ca";
const UTM = "utm_source=rss&utm_medium=social&utm_campaign=weekly-picks";
const WEEKS_BACK = 7; // current week + 7 prior = 8 items

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function GET() {
  const now = currentWeek();
  const items: string[] = [];

  for (let w = now; w > now - 1 - WEEKS_BACK; w--) {
    const { weekStart, alcohol, food, supp } = picksForWeek(w);
    const dateLabel = weekStart.toLocaleDateString("en-CA", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
    const parts: string[] = [];
    // names already embed the brand in these datasets, so don't prefix it again
    if (alcohol) parts.push(`🍺 Alcohol: ${alcohol.name} (${alcohol.gorillaPour}/5)`);
    if (food) parts.push(`🥗 Food: ${food.name} (${food.score}/100)`);
    if (supp) parts.push(`💊 Supplement: ${supp.brand} ${supp.name} (Grade ${supp.grade})`);

    const link = `${BASE}/?${UTM}&utm_content=week-${w}`;
    const img = `${BASE}/api/og/picks`;
    const caption = `This week's Gorilla Picks 🦍 — ${parts.join("  ·  ")}. See all the scores at gorillafuel.ca.`;
    const descHtml = `<![CDATA[<p>${parts.join("<br/>")}</p><p><img src="${img}" alt="Gorilla Fuel weekly picks"/></p><p><a href="${link}">See all the scores at gorillafuel.ca</a></p>]]>`;

    items.push(
      `    <item>
      <title>${esc(`Gorilla Picks — Week of ${dateLabel}`)}</title>
      <link>${esc(link)}</link>
      <guid isPermaLink="false">gorilla-picks-week-${w}</guid>
      <pubDate>${weekStart.toUTCString()}</pubDate>
      <description>${descHtml}</description>
      <content:encoded>${descHtml}</content:encoded>
      <enclosure url="${esc(img)}" type="image/png" length="0"/>
      <category>Weekly Picks</category>
      <comments>${esc(caption)}</comments>
    </item>`
    );
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Gorilla Fuel — Weekly Gorilla Picks</title>
    <link>${BASE}</link>
    <description>A rotating weekly pick in alcohol, food and supplements — independently scored. New drop every week.</description>
    <language>en-CA</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items.join("\n")}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
