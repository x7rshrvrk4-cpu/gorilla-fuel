// Paid "Gorilla Spotlight" placements. IMPORTANT policy: the spotlight is PAID and
// clearly LABELED, but a product's Gorilla Score is NEVER for sale — only feature
// products that already earned a good score. The score shown here must be the real
// earned score, not a favour. Empty array = nothing renders on the site.
//
// Each entry auto-expires via endsAt, so a 1-week / 1-month sponsorship cleans
// itself up. Add an entry when a sponsor signs; remove or let it expire when done.

export type Spotlight = {
  id: string;
  brand: string;
  product: string;
  /** The real, earned Gorilla Score (0-100). Never fabricated for a sponsor. */
  score: number;
  category: string; // "Wine", "Supplement", "Food", etc.
  blurb: string; // short, sponsor-approved copy
  lcboNumber?: string; // wines — shows the "LCBO #" shelf tag
  buyUrl?: string; // outbound buy/learn link
  href?: string; // internal link to the product's page/section, optional
  startsAt?: string; // ISO date — spotlight shows from here (optional)
  endsAt?: string; // ISO date — spotlight auto-expires after here (optional)
};

export const SPONSORS: Spotlight[] = [
  // Example of a 1-month wine partner (kept commented so nothing renders yet):
  // {
  //   id: "cave-spring-chardonnay-2026-10",
  //   brand: "Cave Spring",
  //   product: "Cave Spring Chardonnay",
  //   score: 89,
  //   category: "Wine",
  //   blurb: "Niagara VQA Chardonnay — scored 89/100, nothing flagged beyond sulphites.",
  //   lcboNumber: "228551",
  //   startsAt: "2026-10-01",
  //   endsAt: "2026-11-01",
  // },
];

/** Sponsors whose window includes `now`. */
export function activeSponsors(now: Date = new Date()): Spotlight[] {
  return SPONSORS.filter((s) => {
    if (s.startsAt && new Date(s.startsAt).getTime() > now.getTime()) return false;
    if (s.endsAt && new Date(s.endsAt).getTime() < now.getTime()) return false;
    return true;
  });
}
