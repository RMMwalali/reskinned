// Hair-loss treatments and the progress model built on check-in history.
// Pure and deterministic: everything here can be unit-tested.
//
// Why this exists: treatments take months to show results, and most people
// quit before then. In one clinic study, 86% of 400 patients stopped topical
// minoxidil, most within six months (Dermatology and Therapy, 2023). edge.wise
// measures the hairline against the person's own baseline every month, so they
// can see whether the treatment is holding, working, or not, before they give up.

import { NOISE, type CheckIn } from "./edges";

export type TreatmentId =
  | "minoxidil-topical"
  | "minoxidil-oral"
  | "finasteride"
  | "spironolactone"
  | "prp"
  | "microneedling"
  | "laser"
  | "ketoconazole"
  | "gentler-styles";

export type Treatment = {
  id: TreatmentId;
  name: string;
  /** How you get it: decides whether the shop can sell it or must route to a prescriber. */
  access: "otc" | "rx" | "clinic" | "device" | "habit";
  /** Months after starting when results usually become visible. */
  results: [number, number];
  /** Where the timing comes from. */
  source: string;
  note: string;
};

export const TREATMENTS: Treatment[] = [
  {
    id: "minoxidil-topical",
    name: "Minoxidil foam or solution",
    access: "otc",
    results: [6, 12],
    source: "AAD: results usually take about 6 to 12 months",
    note: "Needs daily use. Stopping loses the benefit. Some people notice extra shedding in the first weeks; it's widely reported and usually settles.",
  },
  {
    id: "minoxidil-oral",
    name: "Oral minoxidil (low dose)",
    access: "rx",
    results: [6, 12],
    source: "Timing as for topical minoxidil (AAD); prescribed off-label",
    note: "Prescription only. Your prescriber sets the dose and checks side effects.",
  },
  {
    id: "finasteride",
    name: "Finasteride",
    access: "rx",
    results: [4, 6],
    source: "AAD: about 4 months to notice improvement, results in about 6",
    note: "Prescription only. Hair loss returns if it's stopped.",
  },
  {
    id: "spironolactone",
    name: "Spironolactone",
    access: "rx",
    results: [6, 12],
    source: "AAD gives no timing; edge.wise reviews at 6 months",
    note: "Prescription only, for female pattern hair loss.",
  },
  {
    id: "prp",
    name: "PRP injections",
    access: "clinic",
    results: [3, 6],
    source: "AAD: less hair loss within the first few months; repeat sessions needed",
    note: "Usually monthly for 3 months, then every 3 to 6 months.",
  },
  {
    id: "microneedling",
    name: "Microneedling",
    access: "clinic",
    results: [3, 6],
    source: "AAD-cited study measured results at 12 weeks (with minoxidil)",
    note: "Check with a dermatologist first.",
  },
  {
    id: "laser",
    name: "Laser cap or comb",
    access: "device",
    results: [6, 6],
    source: "AAD-cited study ran 26 weeks; more studies needed",
    note: "Typically used three times a week.",
  },
  {
    id: "ketoconazole",
    name: "Ketoconazole shampoo",
    access: "otc",
    results: [3, 6],
    source: "Supporting treatment; edge.wise reviews at 3 to 6 months",
    note: "Usually used alongside a main treatment, two or three times a week.",
  },
  {
    id: "gentler-styles",
    name: "Gentler styles (traction)",
    access: "habit",
    results: [3, 6],
    source: "Early traction hair loss can reverse once the pull stops; edge.wise reviews at 3 to 6 months",
    note: "Loosen or change styles that pull at the hairline. See a dermatologist if nothing changes.",
  },
];

export const treatmentById = (id: TreatmentId) => TREATMENTS.find((t) => t.id === id)!;

export type PlanItem = { id: TreatmentId; start: string };
export type Plan = { items: PlanItem[] };

const DAY = 864e5;
const MONTH = 30.44 * DAY;
const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

export type Verdict = "no-plan" | "need-checkin" | "baseline" | "early" | "early-dip" | "holding" | "improving" | "declining";

export type Progress = {
  verdict: Verdict;
  headline: string;
  body: string;
  /** Months since the earliest treatment started. */
  month: number;
  /** Combined window when results usually show, in months. */
  window: [number, number];
  baseline: number | null;
  latest: number | null;
  change: number | null;
  /** True during months 1 to 6: when most people give up. */
  quitZone: boolean;
  seeDoctor: boolean;
  nextCheck: string | null;
  /** Points since the treatment started, for the chart. */
  points: { month: number; density: number; demo?: boolean }[];
};

export function progress(list: CheckIn[], plan: Plan | null, now = new Date()): Progress {
  const empty = { baseline: null, latest: null, change: null, quitZone: false, seeDoctor: false, nextCheck: null, points: [] };
  if (!plan || plan.items.length === 0) {
    return { ...empty, verdict: "no-plan", headline: "Add your treatment", body: "Tell edge.wise what you're using and when you started. It will track your hairline against where you began.", month: 0, window: [0, 0] };
  }
  const start = Math.min(...plan.items.map((i) => new Date(i.start).getTime()));
  const month = Math.max(0, (now.getTime() - start) / MONTH);
  const ts = plan.items.map((i) => treatmentById(i.id));
  const window: [number, number] = [Math.min(...ts.map((t) => t.results[0])), Math.max(...ts.map((t) => t.results[1]))];
  const sorted = [...list].sort((a, b) => a.date.localeCompare(b.date));
  const points = sorted.map((c) => ({ month: (new Date(c.date).getTime() - start) / MONTH, density: c.density, demo: c.demo }));
  const quitZone = month >= 1 && month < Math.max(6, window[0]);

  if (sorted.length === 0) {
    return { ...empty, verdict: "need-checkin", headline: "Take your first check-in", body: "Your first check-in is your starting point. Every month after, edge.wise compares your hairline with it.", month, window, quitZone, points };
  }

  // Baseline: readings up to 3 weeks after starting (nothing can have changed
  // yet), or the very first reading if tracking began later.
  const early = sorted.filter((c) => new Date(c.date).getTime() <= start + 21 * DAY);
  const baseline = median((early.length ? early : sorted.slice(0, 1)).map((c) => c.density));
  const last = sorted.at(-1)!;
  const latest = last.density;
  const change = Math.round((latest - baseline) * 100) / 100;
  const nextCheck = new Date(new Date(last.date).getTime() + 30 * DAY).toISOString();
  const base = { baseline, latest, change, quitZone, nextCheck, points, month, window };
  const monthWord = `month ${Math.max(1, Math.round(month))}`;

  if (sorted.length === 1 || new Date(last.date).getTime() <= start + 21 * DAY) {
    return { ...base, seeDoctor: false, verdict: "baseline", headline: "Starting point saved", body: `Check in again in about a month. Results usually show from month ${window[0]}, so the first months are about holding steady.` };
  }
  if (change >= 0.2) {
    return { ...base, seeDoctor: false, verdict: "improving", headline: "Your hairline is filling in", body: `Up ${change.toFixed(2)} from where you started, at ${monthWord}. Keep going: most treatments only keep working while you use them.` };
  }
  if (change > -0.2) {
    if (month < window[0]) {
      return { ...base, seeDoctor: false, verdict: "early", headline: "On track. Too early for regrowth.", body: `You're at ${monthWord}. Results usually show from month ${window[0]}. Holding steady now is what working looks like this early. This is the stretch when most people quit.` };
    }
    return { ...base, seeDoctor: false, verdict: "holding", headline: "Holding steady", body: `No further loss since you started. Stopping loss is a result in itself. Regrowth, if it comes, usually shows by month ${window[1]}.` };
  }
  if (month < Math.min(3, window[0])) {
    return { ...base, seeDoctor: false, verdict: "early-dip", headline: "A dip this early is common", body: `Down ${Math.abs(change).toFixed(2)} at ${monthWord}. Extra shedding in the first weeks of some treatments is widely reported and usually settles. Keep checking in monthly, and ask your prescriber if you're worried.` };
  }
  return { ...base, seeDoctor: true, verdict: "declining", headline: "Still losing ground", body: `Down ${Math.abs(change).toFixed(2)} since you started, at ${monthWord}. Take this report to your prescriber or a dermatologist: the dose, the treatment, or the cause may need a second look.` };
}

/** A sample plan and history: four months on minoxidil, a dip, then regrowth. */
export function demoTreatment(now = new Date()): { plan: Plan; list: CheckIn[] } {
  const ago = (months: number) => new Date(now.getTime() - months * MONTH).toISOString();
  const none = { tightSigns: false, brokenEdges: false, crownItch: false };
  const style = { style: "out" as const, weeks: 0, extensions: false, relaxed: false };
  const row = (id: string, m: number, density: number, term: CheckIn["term"], skin?: CheckIn["skin"], upperThird?: number, frizz?: CheckIn["frizz"]): CheckIn => ({ id, date: ago(m), density, spread: 0.07, term, style, symptoms: none, demo: true, skin, upperThird, frizz });
  return {
    plan: { items: [{ id: "minoxidil-topical", start: ago(7) }, { id: "ketoconazole", start: ago(7) }] },
    list: [
      row("t0", 7, 1.42, "Low Density", { redness: 81, moisture: 72, acne: 84, texture: 70 }, 34.6),
      row("t1", 6, 1.33, "Low Density", undefined, 34.8),
      row("t2", 5, 1.4, "Low Density", { redness: 77, moisture: 68, acne: 83, texture: 69 }, 34.5),
      row("t3", 3, 1.51, "Medium Density", undefined, 34.0),
      row("t4", 0.8, 1.66, "Medium Density", { redness: 64, moisture: 58, acne: 82, texture: 66 }, 33.4, { mapping: 2, term: "Frizzy" }),
    ],
  };
}

export { NOISE };
