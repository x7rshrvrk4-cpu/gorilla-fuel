// "Frequency and Rife machines": claim check. Researched 2026-11-03 from Cancer Research UK, PolitiFact, Full Fact,
// MassDevice and Novocure. Pages were read in summary form; nothing here is a treatment claim and nothing is medical advice.

export const FREQ_INTRO =
  "Rife machines (also sold as frequency generators or zappers) are devices that claim every disease has its own electromagnetic frequency, and that sending the matching frequency can kill or disable the disease. They trace to Royal Rife in the 1920s and 1930s. Frequency also has a real place in approved medicine, so the question is which claims are which.";

export const FREQ_VERDICT = "Not supported as a cure";

export const FREQ_CLAIMS: { claim: string; finding: string }[] = [
  {
    claim: "Rife machines cure cancer or infections by matching a disease frequency",
    finding:
      "Cancer Research UK: there is no reliable evidence that the Rife machine works as a cure for cancer, and it has not gone through the usual scientific testing. PolitiFact (2022) rated the viral cure claim as having no evidence, and Full Fact rated the claim that Rife machines cure all cancers as false.",
  },
  {
    claim: "Regulators approved them",
    finding:
      "In July 2022 the FDA told PolitiFact the device is not approved. Cancer Research UK likewise says no reputable scientific cancer organisation supports these claims.",
  },
  {
    claim: "They have no side effects",
    finding:
      "Supporters say there are none. Cancer Research UK reports some reports of electrical shocks and rashes, and says there is no evidence the machines are safe, meaning they have not been shown to avoid harm.",
  },
  {
    claim: "The low power of the devices can destroy germs",
    finding:
      "The American Cancer Society's 1994 report on questionable cancer methods states that radio waves cannot destroy bacteria because of their low energy level (as quoted by PolitiFact).",
  },
];

export const FREQ_FEELING =
  "Some people report feeling better after using a frequency device. That experience is real to the person, but one person's result cannot separate the machine from relaxation, expectation or the placebo response. Telling those apart is what a controlled trial is for, and we found no controlled trial showing a Rife device treats any disease.";

export const FREQ_REAL: string[] = [
  "Tumor Treating Fields (Optune) uses alternating electric fields at set frequencies to disrupt cell division. It is a regulated cancer device, approved in Japan for glioblastoma with national insurance coverage from December 2017 and later approvals for other cancers (Novocure, MassDevice). It is not a Rife machine, makes no claim about killing germs, and its main trial had no sham-control group, so its evidence is still debated.",
  "High-intensity focused ultrasound, which uses high-frequency sound waves, has a good evidence base for treating certain cancers (Full Fact).",
  "Cancer Research UK mentions one small, experimental study in advanced liver cancer in which low-frequency waves affected cancer cells but not normal ones. It used different frequencies from Rife machines, the mechanism is unclear, and more research is needed.",
];

export const FREQ_JAPAN =
  "We could not trace the claim that Japanese hospitals use frequency healing. The closest real example we found is the regulated cancer device above. We did not find evidence that Japanese hospitals use Rife-type devices.";

export const FREQ_CAUTION =
  "Not medical advice. Do not stop or delay a prescribed treatment for cancer or any serious illness in favour of a frequency device. If you use one anyway, ask your doctor first, especially if you have a pacemaker or other implanted device, and stop if you feel shocks or get a rash (both have been reported).";

export const FREQ_UNVERIFIED: string[] = [
  "Cancer Research UK's Rife page was last reviewed in June 2022 and notes it is due for review. We could not retrieve the FDA, FTC or American Cancer Society pages directly, so the FDA position comes from PolitiFact (July 2022) and the ACS quote from PolitiFact's account of its 1994 report.",
  "The claim that Rife's 1934 university study cured terminal patients appears only on enthusiast sites in our searches, with no independent confirmation, so we do not repeat it as fact.",
  "“No evidence found” means our searches found none, not that none exists. If you have a published human trial, send it and we will read it.",
  "These checks have not been reviewed by a doctor or pharmacist.",
];

export const FREQ_SOURCES: Record<string, { title: string; publisher: string; url: string }> = {
  F1: { title: "Rife machines", publisher: "Cancer Research UK (reviewed June 2022)", url: "https://www.cancerresearchuk.org/about-cancer/treatment/complementary-alternative-therapies/individual-therapies/rife-machine-and-cancer" },
  F2: { title: "There is no evidence vibrational frequencies from Rife machines cure cancer", publisher: "PolitiFact (29 July 2022)", url: "https://api.politifact.com/factchecks/2022/jul/29/viral-image/there-no-evidence-vibrational-frequencies-rife-mac/" },
  F3: { title: "No evidence Rife machines can cure all cancers", publisher: "Full Fact", url: "https://fullfact.org/health/Rife-machines/" },
  F4: { title: "Novocure earns Japanese approval for Tumor Treating Fields", publisher: "MassDevice", url: "https://www.massdevice.com/novocure-earns-japanese-approval-tumor-treating-fields/" },
  F5: { title: "Novocure fourth quarter and full year 2017 results", publisher: "Novocure", url: "https://www.novocure.com/novocure-reports-fourth-quarter-and-full-year-2017-financial-results-and-provides-company-update/" },
};
