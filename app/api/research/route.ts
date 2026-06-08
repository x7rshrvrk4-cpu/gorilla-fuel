import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const EUTILS_BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";

export type ResearchPaper = {
  pmid: string;
  title: string;
  journal: string;
  year: string;
  conclusion: string;
  url: string;
};

// Pull the AbstractText, preferring a "Conclusion"-labelled section if the
// paper is structured that way — otherwise fall back to the final sentence,
// which usually carries the paper's takeaway.
function extractConclusion(abstractXml: string): string {
  const sections = [...abstractXml.matchAll(/<AbstractText[^>]*Label="([^"]*)"[^>]*>([^<]*)<\/AbstractText>/gi)];
  const labelled = sections.find((m) => /conclusion/i.test(m[1]));
  if (labelled) return labelled[2].trim();

  const all = [...abstractXml.matchAll(/<AbstractText[^>]*>([^<]*)<\/AbstractText>/gi)].map((m) => m[1].trim());
  if (all.length === 0) return "";
  const text = all[all.length - 1];
  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
  return sentences.slice(-2).join(" ").trim();
}

async function fetchAbstracts(ids: string[]): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (ids.length === 0) return map;

  try {
    const url = new URL(`${EUTILS_BASE}/efetch.fcgi`);
    url.searchParams.set("db", "pubmed");
    url.searchParams.set("id", ids.join(","));
    url.searchParams.set("rettype", "abstract");
    url.searchParams.set("retmode", "xml");

    const res = await fetch(url.toString(), { headers: { Accept: "application/xml" } });
    if (!res.ok) return map;

    const xml = await res.text();
    const articles = xml.split("<PubmedArticle>").slice(1);
    for (const article of articles) {
      const idMatch = article.match(/<PMID[^>]*>(\d+)<\/PMID>/);
      if (!idMatch) continue;
      const conclusion = extractConclusion(article);
      if (conclusion) map.set(idMatch[1], conclusion);
    }
  } catch {
    // Abstracts are a nice-to-have — degrade gracefully to titles only.
  }

  return map;
}

export async function GET(req: NextRequest) {
  const term = req.nextUrl.searchParams.get("term")?.trim();
  if (!term) {
    return NextResponse.json({ papers: [] satisfies ResearchPaper[] });
  }

  try {
    const searchUrl = new URL(`${EUTILS_BASE}/esearch.fcgi`);
    searchUrl.searchParams.set("db", "pubmed");
    searchUrl.searchParams.set("term", `${term} AND (food OR additive OR diet OR toxicology OR safety)`);
    searchUrl.searchParams.set("retmax", "2");
    searchUrl.searchParams.set("sort", "date");
    searchUrl.searchParams.set("retmode", "json");

    const searchRes = await fetch(searchUrl.toString(), { headers: { Accept: "application/json" } });
    if (!searchRes.ok) {
      return NextResponse.json({ papers: [] satisfies ResearchPaper[] });
    }
    const searchData = await searchRes.json();
    const ids: string[] = searchData?.esearchresult?.idlist ?? [];
    if (ids.length === 0) {
      return NextResponse.json({ papers: [] satisfies ResearchPaper[] });
    }

    const summaryUrl = new URL(`${EUTILS_BASE}/esummary.fcgi`);
    summaryUrl.searchParams.set("db", "pubmed");
    summaryUrl.searchParams.set("id", ids.join(","));
    summaryUrl.searchParams.set("retmode", "json");

    const [summaryRes, abstracts] = await Promise.all([
      fetch(summaryUrl.toString(), { headers: { Accept: "application/json" } }),
      fetchAbstracts(ids),
    ]);

    if (!summaryRes.ok) {
      return NextResponse.json({ papers: [] satisfies ResearchPaper[] });
    }

    const summaryData = await summaryRes.json();
    const result = summaryData?.result;
    const papers: ResearchPaper[] = ids
      .map((id) => {
        const doc = result?.[id];
        if (!doc) return null;
        const paper: ResearchPaper = {
          pmid: id,
          title: doc.title || "Untitled",
          journal: doc.fulljournalname || doc.source || "",
          year: (doc.pubdate || "").slice(0, 4),
          conclusion: abstracts.get(id) || "",
          url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
        };
        return paper;
      })
      .filter((p): p is ResearchPaper => p !== null);

    return NextResponse.json({ papers });
  } catch {
    return NextResponse.json({ papers: [] satisfies ResearchPaper[] });
  }
}
