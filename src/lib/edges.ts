// edge.wise core: hairline trend, tension load, status, safer styles.
// Deterministic and explainable. Every rule cites where it comes from.
//
// Sources
//  [AAD]  American Academy of Dermatology, "Hairstyles that pull can cause hair loss"
//         aad.org/public/diseases/hair-loss/causes/hairstyles
//  [JHU]  Johns Hopkins review, Journal of the American Academy of Dermatology (2016),
//         "Hair care practices and traction alopecia"
//  [AAD16] AAD 74th Annual Meeting survey (Black Women's Health Study, n = 5,594)
//
// edge.wise is a cosmetic tracking tool, not a diagnosis. It never names a
// medical condition as the user's condition, and it routes to a dermatologist
// whenever the evidence calls for it.

// ---------------------------------------------------------------- styles

export type StyleId =
  | "out"
  | "loose-updo"
  | "tight-ponytail"
  | "glueless-wig"
  | "glued-wig"
  | "twists"
  | "knotless"
  | "box-braids"
  | "cornrows"
  | "sew-in"
  | "locs";

export type Style = {
  id: StyleId;
  name: string;
  /** Tension on the hairline, 0 (none) to 1 (very high). Ranked from [AAD] and [JHU]. */
  tension: number;
  family: "natural" | "updo" | "wig" | "braids" | "weave" | "locs";
  why: string;
};

export const STYLES: Style[] = [
  { id: "out", name: "Out / loose natural", tension: 0.05, family: "natural", why: "No pulling at the root. A Johns Hopkins review rates natural, unprocessed styles lowest risk." },
  { id: "loose-updo", name: "Loose ponytail or claw clip", tension: 0.25, family: "updo", why: "Some pull, but low if it doesn't feel tight and the position changes." },
  { id: "glueless-wig", name: "Glueless wig (band or clips)", tension: 0.25, family: "wig", why: "No adhesive on the hairline. Clips and tight caps still add some stress." },
  { id: "twists", name: "Twists", tension: 0.4, family: "braids", why: "Less tension at the root than knotted braids when done loosely." },
  { id: "knotless", name: "Knotless braids", tension: 0.45, family: "braids", why: "Feed-in start puts less stress on each root than a knot, if not pulled tight." },
  { id: "locs", name: "Locs", tension: 0.5, family: "locs", why: "Dermatologists list locs as a risk when tight or long. Thick, short locs pull less." },
  { id: "sew-in", name: "Sew-in weave", tension: 0.65, family: "weave", why: "Braided base plus bundle weight. Dermatologists prefer sew-in over bonded, worn short-term." },
  { id: "box-braids", name: "Box braids with extensions", tension: 0.7, family: "braids", why: "A Johns Hopkins review rates braids with extensions among the highest-risk styles." },
  { id: "tight-ponytail", name: "Tight ponytail or slick bun", tension: 0.7, family: "updo", why: "Dermatologists name tightly pulled buns and ponytails, especially worn daily." },
  { id: "cornrows", name: "Cornrows", tension: 0.75, family: "braids", why: "Dermatologists name cornrows. Tension concentrates along the hairline." },
  { id: "glued-wig", name: "Glued lace wig", tension: 0.8, family: "wig", why: "A Johns Hopkins review links glued-on extensions and glued wigs to breakage. Removal pulls the edges." },
];

export const styleById = (id: StyleId) => STYLES.find((s) => s.id === id)!;

// ---------------------------------------------------------------- check-ins

export type DensityTerm = "Extremely Low Density" | "Low Density" | "Medium Density" | "High Density";

export type Symptoms = {
  /** Pain, stinging, bumps or "tenting" after install: [AAD] signs a style is too tight. */
  tightSigns: boolean;
  /** Broken hairs or visible recession at the front: [AAD] early signs. */
  brokenEdges: boolean;
  /** Itching, tingling or tenderness on the crown: [AAD16] flags these as a sign of a different, scarring condition. */
  crownItch: boolean;
};

export type StyleLog = {
  style: StyleId;
  /** Weeks this style has been (or was) worn. */
  weeks: number;
  /** Added hair or extensions (weight on the root). */
  extensions: boolean;
  /** Chemically relaxed or permed hair under the style ([AAD], [JHU]: higher risk). */
  relaxed: boolean;
};

export type CheckIn = {
  id: string;
  date: string; // ISO
  /** YouCam hair_density.mapping, 0–3 (average of the takes). */
  density: number;
  /** Spread between the two takes; large means an unreliable reading. */
  spread: number;
  term: DensityTerm;
  length?: string;
  hairType?: string;
  /** YouCam Skin Analysis scores (1–100, higher is healthier), when a front photo was checked. */
  skin?: Partial<Record<"redness" | "moisture" | "acne" | "texture", number>>;
  /** YouCam Face Analyzer: top third of the face (hairline to brows), % of face height. */
  upperThird?: number;
  /** For treatment users: this month's adherence and side effects. */
  adherence?: { missedDays: number; shedding: boolean; irritation: boolean };
  /** YouCam Hair Frizziness Detection, 0–3. */
  frizz?: { mapping: number; term: string };
  style: StyleLog;
  symptoms: Symptoms;
  demo?: boolean;
};

// ---------------------------------------------------------------- tension load

/**
 * Tension load over the last 26 weeks: Σ tension × weeks × modifiers, with
 * older styles counting less (half-life 12 weeks). Time in low-tension styles
 * is the "break" [AAD] recommends and naturally adds little.
 */
export function tensionLoad(history: CheckIn[], now = new Date()): number {
  let load = 0;
  for (const c of history) {
    const ageWeeks = (now.getTime() - new Date(c.date).getTime()) / (7 * 864e5);
    if (ageWeeks > 26) continue;
    const s = styleById(c.style.style);
    let t = s.tension;
    if (c.style.extensions) t += 0.12; // weight: [AAD] longer, heavier hair pulls more
    if (c.style.relaxed) t *= 1.25; // [AAD], [JHU]: extensions/weaves riskier on relaxed hair
    if (c.symptoms.tightSigns) t *= 1.4; // [AAD]: pain means the style is too tight
    const decay = Math.pow(0.5, Math.max(0, ageWeeks) / 12);
    load += Math.min(1.2, t) * Math.min(c.style.weeks, 16) * decay;
  }
  return Math.round(load * 10) / 10;
}

export type LoadBand = "low" | "moderate" | "high";
export const loadBand = (load: number): LoadBand => (load < 3.5 ? "low" : load < 8 ? "moderate" : "high");

// ---------------------------------------------------------------- trend

/** Readings within this of each other are treated as the same (assumed measurement noise). */
export const NOISE = 0.15;

export type Trend = {
  baseline: number | null;
  latest: number;
  change: number | null; // latest - baseline
  consecutiveDeclines: number;
  reliable: boolean;
  points: { date: string; density: number; demo?: boolean }[];
};

const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

export function trend(history: CheckIn[]): Trend {
  const h = [...history].sort((a, b) => a.date.localeCompare(b.date));
  const latest = h[h.length - 1];
  const prior = h.slice(0, -1);
  // Baseline: median of the first three readings, so one bad photo can't set it.
  const baseline = prior.length ? median(prior.slice(0, 3).map((c) => c.density)) : null;
  let declines = 0;
  for (let i = h.length - 1; i > 0; i--) {
    if (h[i].density < h[i - 1].density - NOISE / 2) declines++;
    else break;
  }
  return {
    baseline,
    latest: latest.density,
    change: baseline === null ? null : Math.round((latest.density - baseline) * 100) / 100,
    consecutiveDeclines: declines,
    reliable: latest.spread <= 0.3,
    points: h.map((c) => ({ date: c.date, density: c.density, demo: c.demo })),
  };
}

// ---------------------------------------------------------------- status

export type Status = "steady" | "watch" | "act";

export type Assessment = {
  status: Status;
  headline: string;
  reasons: string[];
  next: string[];
  seeDermatologist: boolean;
  load: number;
  band: LoadBand;
  trend: Trend;
};

export function assess(history: CheckIn[], now = new Date()): Assessment {
  if (!history.length) throw new Error("No check-ins");
  const t = trend(history);
  const latest = [...history].sort((a, b) => a.date.localeCompare(b.date)).at(-1)!;
  const load = tensionLoad(history, now);
  const band = loadBand(load);
  const reasons: string[] = [];
  const next: string[] = [];
  let act = false;
  let watch = false;
  let derm = false;

  // Trend
  if (t.change === null) {
    reasons.push(`First check-in: your baseline is ${latest.density.toFixed(2)} (${latest.term.toLowerCase()}). Each check-in after this is compared with it.`);
  } else if (t.change <= -0.5) {
    act = true;
    derm = true;
    reasons.push(`Hairline density is down ${Math.abs(t.change).toFixed(2)} from your baseline. That's well beyond normal photo-to-photo variation.`);
  } else if (t.change <= -0.3 && t.consecutiveDeclines >= 2) {
    act = true;
    reasons.push(`Density has dropped ${t.consecutiveDeclines} check-ins in a row (${Math.abs(t.change).toFixed(2)} below baseline).`);
  } else if (t.change <= -0.2) {
    watch = true;
    reasons.push(`Density is ${Math.abs(t.change).toFixed(2)} below your baseline. Small, but worth watching.`);
  } else if (t.change >= 0.2) {
    reasons.push(`Density is up ${t.change.toFixed(2)} on your baseline. Whatever you changed is working.`);
  } else {
    reasons.push(`Density is within ${NOISE} of your baseline: steady.`);
  }

  if (!t.reliable) {
    reasons.push("Your two photos this time disagreed, so this reading is less reliable. Retake in even light with your full hairline visible.");
  }

  // Absolute level
  if (latest.term === "Extremely Low Density") {
    act = true;
    derm = true;
    reasons.push("YouCam rated your hairline density extremely low.");
  } else if (latest.term === "Low Density") {
    watch = true;
    reasons.push("YouCam rated your hairline density low.");
  }

  // Tension load
  if (band === "high") {
    watch = true;
    if (t.consecutiveDeclines >= 1 && t.change !== null && t.change < -NOISE) act = true;
    reasons.push(`Your tension load over the last 6 months is high (${load}). Back-to-back high-tension styles are the pattern dermatologists warn about.`);
  } else if (band === "moderate") {
    reasons.push(`Tension load is moderate (${load}).`);
  }

  // Symptoms
  if (latest.symptoms.tightSigns) {
    watch = true;
    reasons.push("You felt pain, stinging, bumps or tenting after your install. Dermatologists say that means the style is too tight.");
    next.push("Ask your stylist to loosen the front, or take out the braids closest to your hairline now, not at the end of the install.");
  }
  if (latest.symptoms.brokenEdges) {
    watch = true;
    reasons.push("You noticed broken hairs or recession at the front, which dermatologists list as early signs.");
  }
  if (latest.symptoms.crownItch) {
    derm = true;
    reasons.push("Itching, tingling or tenderness on the crown can point to a different, scarring type of hair loss that styling changes alone don't fix.");
  }

  const status: Status = act ? "act" : watch ? "watch" : "steady";

  // Next steps (general guidance, [AAD])
  const s = styleById(latest.style.style);
  if (status !== "steady" || band !== "low") {
    if (s.tension >= 0.6) next.push(`Make your next style a low-tension one. See the safer options for ${s.name.toLowerCase()}.`);
    next.push("Keep braids, weaves and extensions in for no more than 6 to 8 weeks, then give your hair a break.");
    next.push("Ask for the hairline to be left out or done loosely. No glue on the edges.");
  }
  if (status === "steady" && band === "low") next.push("Keep doing what you're doing. Check in again before your next install.");
  if (derm) next.unshift("See a board-certified dermatologist. Hair loss caught early is more likely to be reversible.");
  next.push("Share your stylist card before your next appointment.");

  const headline =
    status === "act" ? "Act now: your edges need a break." : status === "watch" ? "Watch: ease the tension." : "Steady: your edges are holding.";

  return { status, headline, reasons, next: [...new Set(next)], seeDermatologist: derm, load, band, trend: t };
}

// ---------------------------------------------------------------- safer styles

export type SaferOption = { style: Style; rules: string[]; tensionDrop: number };

/** Lower-tension options that keep the look the person wants, with install rules. */
export function saferStyles(wanted: StyleId, assessment?: Assessment): SaferOption[] {
  const w = styleById(wanted);
  const strict = assessment && assessment.status !== "steady";
  const familyAlts: Record<Style["family"], StyleId[]> = {
    braids: ["knotless", "twists", "glueless-wig", "out"],
    weave: ["glueless-wig", "knotless", "out"],
    wig: ["glueless-wig", "out"],
    updo: ["loose-updo", "out"],
    locs: ["locs", "out"],
    natural: ["out", "loose-updo"],
  };
  const ids = [...new Set([wanted, ...familyAlts[w.family], "out" as StyleId])];
  const rulesFor = (s: Style): string[] => {
    const r: string[] = [];
    if (s.family === "braids" || s.family === "locs") {
      r.push("Bigger, thicker sections, not micro braids");
      r.push("Keep length short to medium, since longer is heavier");
      r.push("Leave the hairline out, or braid it loosely");
      r.push(strict ? "Take out within 6 weeks" : "Take out within 8 weeks");
    }
    if (s.family === "weave") {
      r.push("Sewn in, never bonded with glue");
      r.push("Leave out your edges; fewer tracks at the front");
      r.push("Out within 6 to 8 weeks");
    }
    if (s.id === "glued-wig") r.push("Skip it if you can. If not, keep glue off the hairline and remove with a proper adhesive remover");
    if (s.id === "glueless-wig") {
      r.push("Wig cap and band snug, not tight");
      r.push("Take the wig off at night");
    }
    if (s.family === "updo") {
      r.push("If it hurts, it's too tight");
      r.push("Change where the ponytail sits day to day");
    }
    if (s.id === "out") r.push("Give your edges a full break for a few weeks");
    r.push("Pain, stinging or bumps after install mean loosen it right away");
    return r;
  };
  return ids
    .map((id) => styleById(id))
    .filter((s) => s.id === wanted || s.tension < w.tension)
    .map((s) => ({ style: s, rules: rulesFor(s), tensionDrop: Math.round((w.tension - s.tension) * 100) }))
    .sort((a, b) => a.style.tension - b.style.tension);
}

// ---------------------------------------------------------------- stylist card

export type StylistCard = {
  name?: string;
  status: Status;
  term: DensityTerm;
  change: number | null;
  band: LoadBand;
  avoid: StyleId[];
  rules: string[];
  date: string;
  demo?: boolean;
};

export function buildCard(history: CheckIn[], name?: string): StylistCard {
  const a = assess(history);
  const latest = [...history].sort((x, y) => x.date.localeCompare(y.date)).at(-1)!;
  const avoid = STYLES.filter((s) => s.tension >= (a.status === "act" ? 0.45 : a.status === "watch" ? 0.65 : 0.8)).map((s) => s.id);
  const rules = [
    "Nothing tight at the hairline. If it hurts, loosen it",
    "No glue on the edges",
    a.status === "steady" ? "Out within 8 weeks" : "Out within 6 weeks",
    "Larger sections, shorter length",
  ];
  if (latest.symptoms.tightSigns) rules.unshift("Last install hurt. Please go noticeably looser this time");
  return { name, status: a.status, term: latest.term, change: a.trend.change, band: a.band, avoid, rules, date: latest.date.slice(0, 10), demo: history.some((c) => c.demo) };
}

export function encodeCard(card: StylistCard): string {
  const json = JSON.stringify(card);
  const bytes = new TextEncoder().encode(json);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeCard(token: string): StylistCard | null {
  try {
    const b64 = token.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((token.length + 3) % 4);
    const bin = atob(b64);
    const c = JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, (ch) => ch.charCodeAt(0)))) as StylistCard;
    if (!["steady", "watch", "act"].includes(c.status)) return null;
    c.avoid = (c.avoid ?? []).filter((id) => STYLES.some((s) => s.id === id));
    c.rules = (c.rules ?? []).map((r) => String(r).slice(0, 140)).slice(0, 8);
    c.name = c.name ? String(c.name).slice(0, 40) : undefined;
    return c;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------- demo history

/** A labelled sample history, used to show tracking over time in demos. */
export function demoHistory(now = new Date()): CheckIn[] {
  const wk = (n: number) => new Date(now.getTime() - n * 7 * 864e5).toISOString();
  const none: Symptoms = { tightSigns: false, brokenEdges: false, crownItch: false };
  return [
    { id: "d1", date: wk(24), density: 2.31, spread: 0.06, term: "High Density", style: { style: "box-braids", weeks: 10, extensions: true, relaxed: false }, symptoms: none, demo: true },
    { id: "d2", date: wk(14), density: 2.24, spread: 0.08, term: "Medium Density", style: { style: "glued-wig", weeks: 6, extensions: false, relaxed: false }, symptoms: none, demo: true },
    { id: "d3", date: wk(7), density: 2.02, spread: 0.07, term: "Medium Density", style: { style: "cornrows", weeks: 6, extensions: true, relaxed: false }, symptoms: { ...none, tightSigns: true }, demo: true },
  ];
}
