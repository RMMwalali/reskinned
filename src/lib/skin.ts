// Skin side-effect check. YouCam AI Skin Analysis scores each concern 1–100
// (higher = healthier-looking skin). edge.wise compares each check-in with the
// first one that had a skin reading, to catch irritation that some hair-loss
// treatments cause, and turns it into a concrete, shoppable swap.

import type { CheckIn } from "./edges";
import type { Plan } from "./treatments";

export const SKIN_ACTIONS = ["redness", "moisture", "acne", "texture"] as const;
export type SkinConcern = (typeof SKIN_ACTIONS)[number];
export type SkinScores = Partial<Record<SkinConcern, number>>;

export const SKIN_LABEL: Record<SkinConcern, string> = {
  redness: "Calm (redness)",
  moisture: "Moisture",
  acne: "Clear (breakouts)",
  texture: "Smoothness",
};

/** A drop of this many points since the first skin reading counts as a real change. */
export const SKIN_DROP = 10;

export type SkinAdvice = { title: string; body: string; products: string[] };

export type SkinTrend = {
  first: SkinScores;
  latest: SkinScores;
  change: SkinScores;
  worse: SkinConcern[];
  advice: SkinAdvice[];
} | null;

export function skinTrend(list: CheckIn[], plan: Plan | null): SkinTrend {
  const withSkin = [...list].filter((c) => c.skin).sort((a, b) => a.date.localeCompare(b.date));
  if (!withSkin.length) return null;
  const first = withSkin[0].skin!;
  const latest = withSkin.at(-1)!.skin!;
  const change: SkinScores = {};
  const worse: SkinConcern[] = [];
  for (const k of SKIN_ACTIONS) {
    if (first[k] === undefined || latest[k] === undefined) continue;
    change[k] = latest[k]! - first[k]!;
    if (withSkin.length > 1 && change[k]! <= -SKIN_DROP) worse.push(k);
  }
  const on = new Set(plan?.items.map((i) => i.id));
  const advice: SkinAdvice[] = [];
  if ((worse.includes("redness") || worse.includes("moisture")) && on.has("minoxidil-topical")) {
    advice.push({
      title: "Try the foam instead of the solution",
      body: "Irritation, dryness and flaking with minoxidil are often caused by propylene glycol in the liquid solution. The foam doesn't contain it. Ask your pharmacist before switching, and see a doctor if it itches badly or blisters.",
      products: ["minox-foam-5", "gentle-moisturizer"],
    });
  } else if (worse.includes("redness") || worse.includes("moisture")) {
    advice.push({
      title: "Calm the skin along your hairline",
      body: "Your skin reads redder or drier than when you started. A fragrance-free moisturizer helps; if it persists, tell your prescriber which products you use.",
      products: ["gentle-moisturizer"],
    });
  }
  if (worse.includes("acne")) {
    advice.push({
      title: "More breakouts than when you started",
      body: "Mention it to your prescriber at your next review: some treatments and heavy hair products can cause breakouts along the hairline.",
      products: [],
    });
  }
  return { first, latest, change, worse, advice };
}
