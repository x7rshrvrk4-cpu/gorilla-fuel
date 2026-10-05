import { z } from "zod";

// One Reel's content. The same template renders any site topic — recipes,
// alcohol, fitness, supplements — by swapping these props. `pills`, `reco` and
// `bigStat` are optional visual modules; include whichever fits the topic.
export const reelSchema = z.object({
  accent: z.string(), // brand accent hex (gold by default; can tint per topic)
  topicTag: z.string(), // small eyebrow, e.g. "New tool · free" or "Beer · Face-Off"
  headline: z.array(z.string()), // one entry per line
  goldLines: z.array(z.number()).optional(), // indices of headline lines to paint gold
  sub: z.string(),
  ctaLabel: z.string(),
  ctaUrl: z.string(),
  // Visual module A: scored pills (ingredients / products)
  pills: z.array(z.object({ score: z.number(), name: z.string() })).optional(),
  // Visual module B: a matched-recipe / result card
  reco: z.object({ name: z.string(), kcal: z.number(), protein: z.number(), tag: z.string() }).optional(),
  // Visual module C: one big count-up stat (e.g. a Gorilla score reveal)
  bigStat: z.object({ value: z.number(), label: z.string(), suffix: z.string().optional() }).optional(),
});

export type ReelProps = z.infer<typeof reelSchema>;
