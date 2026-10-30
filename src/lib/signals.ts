// Signal → product engine. Each YouCam reading becomes, at most, one plain
// reason and the products a partner brand would sell for it.

import type { CheckIn } from "./edges";
import { skinTrend } from "./skin";
import type { Plan } from "./treatments";

export type Pick = { reason: string; products: string[]; source: string };

export type Hairline = {
  first: number;
  latest: number;
  change: number;
  /** Do density and hairline height point the same way? */
  agreement: "agree-better" | "agree-worse" | "steady" | "mixed";
} | null;

/** Percentage points of face height; smaller moves are noise. */
export const THIRD_NOISE = 1;

export function hairlineHeight(list: CheckIn[]): Hairline {
  const h = [...list].filter((c) => typeof c.upperThird === "number").sort((a, b) => a.date.localeCompare(b.date));
  if (h.length < 2) return null;
  const first = h[0].upperThird!;
  const latest = h.at(-1)!.upperThird!;
  const change = Math.round((latest - first) * 10) / 10;
  const dens = h.at(-1)!.density - h[0].density;
  const hairUp = change <= -THIRD_NOISE; // shorter forehead: hairline came forward
  const hairDown = change >= THIRD_NOISE;
  const agreement = hairUp && dens >= 0.15 ? "agree-better" : hairDown && dens <= -0.15 ? "agree-worse" : !hairUp && !hairDown && Math.abs(dens) < 0.15 ? "steady" : "mixed";
  return { first, latest, change, agreement };
}

export function picks(list: CheckIn[], plan: Plan | null): Pick[] {
  const out: Pick[] = [];
  const skin = skinTrend(list, plan);
  for (const a of skin?.advice ?? []) if (a.products.length) out.push({ reason: a.title, products: a.products, source: "Skin Analysis" });

  const latest = [...list].sort((a, b) => a.date.localeCompare(b.date)).at(-1);
  if (latest?.frizz && latest.frizz.mapping >= 2) {
    out.push({ reason: `${latest.frizz.term}: breakage can look like thinning`, products: ["bond-repair", "satin-bonnet"], source: "Hair Frizziness" });
  }
  const hl = hairlineHeight(list);
  if ((latest && latest.density < 1.6) || hl?.agreement === "agree-worse") {
    out.push({ reason: "Fuller-looking hair while you wait", products: ["hair-fibers", "topper"], source: hl ? "Hair Density + Face Analyzer" : "Hair Density" });
  }
  return out;
}
