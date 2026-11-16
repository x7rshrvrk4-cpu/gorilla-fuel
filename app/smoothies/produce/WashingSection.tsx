// Low-key, collapsed-by-default reference section at the bottom of the Produce Guide.
// Every figure here was read from the linked source. Residue percentages measure how often
// residues are found against legal limits, not health risk, and the section says so.

const LINKS = {
  hcFoodSafety: "https://www.canada.ca/en/health-canada/services/food-safety-fruits-vegetables.html",
  hcPesticides: "https://www.canada.ca/en/health-canada/services/about-pesticides/pesticides-food-safety.html",
  hcGlyphosate:
    "https://www.canada.ca/en/health-canada/services/consumer-product-safety/reports-publications/pesticides-pest-management/fact-sheets-other-resources/glyphosate.html",
  cfia2122:
    "https://inspection.canada.ca/en/food-safety-industry/food-chemistry-and-microbiology/testing-reports-and-journal-articles/2021-2022-ncrmp-report",
  cfia2021: "https://inspection.canada.ca/node/2932",
  usda: "https://www.ams.usda.gov/sites/default/files/media/2023PDPAnnualSummary.pdf",
  efsa: "https://www.efsa.europa.eu/en/news/pesticides-residues-food-whats-situation-eu",
  uk: "https://www.gov.uk/government/publications/uk-competent-authorities-for-pesticide-residues-in-food-annual-report-for-2024/uk-competent-authorities-for-pesticide-residues-in-food-annual-report-for-2024",
  iarc: "https://www.iarc.who.int/news-events/iarc-monographs-volume-112-evaluation-of-five-organophosphate-insecticides-and-herbicides/",
  efsaGlyphosate: "https://www.foodsafetynews.com/2015/11/efsa-finds-glyphosate-unlikely-to-cause-cancer-in-humans/",
  frontiers: "https://www.frontiersin.org/journals/environmental-health/articles/10.3389/fenvh.2026.1768399/full",
  yang: "https://doi.org/10.1021/acs.jafc.7b03118",
  foodFocus: "https://canadianfoodfocus.org/food/do-i-need-to-wash-my-fruits-and-veggies/",
};

function A({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="underline hover:text-gold">
      {children}
    </a>
  );
}

export default function WashingSection() {
  return (
    <details id="washing" className="mt-8 rounded-sm border border-line/70 bg-background/30 px-4 py-3">
      <summary className="cursor-pointer list-none text-xs text-foreground/70 hover:text-foreground">
        Washing produce, pesticide residues and glyphosate: what we know ▾
      </summary>

      <div className="mt-3 flex flex-col gap-4 text-sm leading-relaxed text-foreground/85">
        <section className="flex flex-col gap-2">
          <h2 className="font-display text-xs uppercase tracking-[0.15em] text-gold">What to do</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Wash fresh produce before eating it. Health Canada&apos;s food-safety guidance is to wash, prepare and store
              fruits and vegetables properly to prevent food poisoning (<A href={LINKS.hcFoodSafety}>Health Canada</A>).
            </li>
            <li>
              Canadian dietitian-run guidance: rinse under cool running tap water, even if you plan to peel, and scrub
              firm skins with a clean brush. Soaps and sprays are not needed (
              <A href={LINKS.foodFocus}>Canadian Food Focus</A>).
            </li>
            <li>
              If you want to do more with firm produce such as apples, a baking soda soak (a 1% solution, about 1 teaspoon
              per 2 cups of water, for 12 to 15 minutes in the lab study) removed more surface residue than plain water.
              Vinegar soaks also did well in a larger review. These are lab results, not proof of a health benefit.
            </li>
            <li>
              Skip salt water: we found no good evidence it helps. In the apple study, a commercial bleach-based wash
              removed less than baking soda.
            </li>
          </ul>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-display text-xs uppercase tracking-[0.15em] text-gold">What washing can&apos;t do</h2>
          <p>
            Some residues sit inside the fruit, not on it. In a 2017 lab study on apples, a baking soda soak removed about
            80% of one fungicide (thiabendazole) in 12 minutes and about 96% of an insecticide (phosmet) in 15 minutes,
            but roughly 20% of the fungicide and 4.4% of the insecticide had soaked into the apple and could not be
            washed away (<A href={LINKS.yang}>Yang et al., J Agric Food Chem 2017</A>). One lab, one fruit, two chemicals
            applied on purpose: treat it as an illustration, not a rule for every food.
          </p>
          <p>
            A 2026 review of 47 lab studies found median reductions of about 30% for a tap-water rinse, 34% for a tap-water
            soak, 51% for baking soda and 54% for vinegar, with huge spread between studies (from almost nothing to over
            94%) (<A href={LINKS.frontiers}>Frontiers in Environmental Health</A>). Its authors work for the Environmental
            Working Group, an advocacy organization that also publishes the &ldquo;Dirty Dozen&rdquo; list. The paper is
            peer-reviewed, but we flag that. Some of the studies were lab-spiked and used stronger solutions than most
            people make at home.
          </p>
          <p>
            Peeling removes surface residue, but also removes fibre and nutrients, and it cannot remove what has soaked
            in. Washing is still worth doing for dirt and bacteria.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-display text-xs uppercase tracking-[0.15em] text-gold">How often residues are found</h2>
          <p className="text-xs text-foreground/75">
            These figures count residues against legal limits. They are not a risk rating, countries sample different
            foods, and the tables are not directly comparable.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[34rem] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-line text-foreground/70">
                  <th className="py-1.5 pr-3 font-normal">Where</th>
                  <th className="py-1.5 pr-3 font-normal">What was tested</th>
                  <th className="py-1.5 pr-3 font-normal">Within legal limits</th>
                  <th className="py-1.5 font-normal">No residue found</th>
                </tr>
              </thead>
              <tbody className="align-top">
                <tr className="border-b border-line/50">
                  <td className="py-1.5 pr-3">Canada</td>
                  <td className="py-1.5 pr-3">2021–22, all foods, about 14,500 samples (<A href={LINKS.cfia2122}>CFIA</A>)</td>
                  <td className="py-1.5 pr-3">97.7%</td>
                  <td className="py-1.5">not reported there</td>
                </tr>
                <tr className="border-b border-line/50">
                  <td className="py-1.5 pr-3">Canada, fruit and veg</td>
                  <td className="py-1.5 pr-3">2020–21 report (<A href={LINKS.cfia2021}>CFIA and Health Canada</A>)</td>
                  <td className="py-1.5 pr-3">99% of Canadian-grown, 94% of imported</td>
                  <td className="py-1.5">not reported there</td>
                </tr>
                <tr className="border-b border-line/50">
                  <td className="py-1.5 pr-3">United States</td>
                  <td className="py-1.5 pr-3">2023, 9,832 samples, mostly fruit and veg (<A href={LINKS.usda}>USDA</A>)</td>
                  <td className="py-1.5 pr-3">over 99% below EPA limits</td>
                  <td className="py-1.5">38.8%</td>
                </tr>
                <tr className="border-b border-line/50">
                  <td className="py-1.5 pr-3">European Union</td>
                  <td className="py-1.5 pr-3">2023, 132,793 targeted samples (<A href={LINKS.efsa}>EFSA</A>)</td>
                  <td className="py-1.5 pr-3">98%</td>
                  <td className="py-1.5">58%</td>
                </tr>
                <tr>
                  <td className="py-1.5 pr-3">United Kingdom</td>
                  <td className="py-1.5 pr-3">2024, 3,482 samples (<A href={LINKS.uk}>HSE</A>)</td>
                  <td className="py-1.5 pr-3">97.9%</td>
                  <td className="py-1.5">51.3%</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Over a limit is a legal line, not a health line. Health Canada says maximum limits are set &ldquo;far below the
            amount of pesticide residue that could cause health concerns&rdquo; and take infants, children and pregnant
            women into account (<A href={LINKS.hcPesticides}>Health Canada</A>). EFSA concluded the 2023 EU results
            represent a low risk to consumers. The USDA states the same for its results. Some advocacy groups dispute how
            those safety assessments are done.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-display text-xs uppercase tracking-[0.15em] text-gold">Glyphosate: where the experts differ</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              The International Agency for Research on Cancer classified glyphosate as &ldquo;probably carcinogenic to
              humans&rdquo; (Group 2A) in 2015. That is a hazard classification, not a measure of risk at the amounts in
              food (<A href={LINKS.iarc}>IARC</A>).
            </li>
            <li>
              Health Canada&apos;s 2017 re-evaluation kept glyphosate registered and concluded dietary exposure would not
              pose a health risk to Canadians. Its 2015–2017 survey found 99.4% of tested samples within Canadian limits
              (<A href={LINKS.hcGlyphosate}>Health Canada</A>). Eight notices of objection were filed after the 2017
              decision.
            </li>
            <li>
              The European Food Safety Authority concluded in 2015 that glyphosate is unlikely to pose a carcinogenic
              hazard to humans; critics have argued its evaluation understated the risk (
              <A href={LINKS.efsaGlyphosate}>Food Safety News</A>).
            </li>
            <li>
              Much of the concern comes from studies of people who handle or spray glyphosate for work, which is a
              different level of exposure from eating food.
            </li>
          </ul>
          <p>We are not picking a side. The regulators and IARC reached different conclusions, and both are shown here.</p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-display text-xs uppercase tracking-[0.15em] text-gold">What this page does not say</h2>
          <p>
            We do not publish a &ldquo;Dirty Dozen&rdquo; list or a per-food danger rating. Those rank how often residues
            are found, not how much risk they carry. Where a food has a recent, sourced residue figure it may be added to
            its card later.
          </p>
        </section>

        <p className="text-xs text-foreground/65">
          General information, not medical advice. If you are pregnant, immunocompromised or have a specific concern, ask
          your clinician or dietitian.
        </p>
      </div>
    </details>
  );
}
