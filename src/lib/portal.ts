// Sample data for the brand partner portal. Deterministic (seeded), so the
// page renders the same everywhere. Every subscriber here is synthetic.

import type { CheckIn } from "./edges";
import { claimReady, guaranteeWindows } from "./guarantee";
import { progress, treatmentById, type TreatmentId, type Verdict } from "./treatments";

export const PORTAL_NOW = new Date("2026-10-30T09:00:00Z");
const DAY = 864e5;
const MONTH = 30.44 * DAY;

function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Subscriber = {
  id: string;
  treatment: TreatmentId;
  price: number;
  month: number;
  lastCheckDays: number | null;
  checkIns: number;
  verdict: Verdict;
  change: number | null;
  runoutDays: number;
  risk: number;
  reasons: string[];
  /** Past the last guarantee window, and whether every window has a check-in. */
  guaranteeDue: boolean;
  evidence: boolean;
  missedDays: number;
};

const MIX: [TreatmentId, number, number][] = [
  ["minoxidil-topical", 0.45, 30],
  ["finasteride", 0.25, 25],
  ["minoxidil-oral", 0.15, 35],
  ["spironolactone", 0.1, 30],
  ["gentler-styles", 0.05, 15],
];

export function sampleCohort(n = 240): Subscriber[] {
  const r = rng(20261102);
  const out: Subscriber[] = [];
  for (let i = 0; i < n; i++) {
    let x = r();
    const [treatment, , price] = MIX.find(([, w]) => (x -= w) < 0) ?? MIX[0];
    const month = Math.round(r() * 11 * 10) / 10 + 0.3;
    const start = PORTAL_NOW.getTime() - month * MONTH;
    // Monthly check-ins, with some people drifting off.
    const engaged = r();
    const list: CheckIn[] = [];
    const base = 1.2 + r() * 0.9;
    const responder = r() < 0.6;
    for (let m = 0; m <= month; m += 1) {
      if (m > 0 && r() > 0.35 + engaged * 0.6) continue;
      const effect = responder ? Math.max(0, m - 3) * 0.05 : -m * 0.025;
      const dip = m >= 1 && m <= 2 && treatment.startsWith("minoxidil") ? -0.08 : 0;
      list.push({
        id: `${i}-${m}`,
        date: new Date(start + m * MONTH + r() * 6 * DAY).toISOString(),
        density: Math.round((base + effect + dip + (r() - 0.5) * 0.12) * 100) / 100,
        spread: 0.06,
        term: "Medium Density",
        style: { style: "out", weeks: 0, extensions: false, relaxed: false },
        symptoms: { tightSigns: false, brokenEdges: false, crownItch: false },
      });
    }
    const valid = list.filter((c) => new Date(c.date) <= PORTAL_NOW);
    const p = progress(valid, { items: [{ id: treatment, start: new Date(start).toISOString() }] }, PORTAL_NOW);
    const last = valid.at(-1);
    const lastCheckDays = last ? Math.round((PORTAL_NOW.getTime() - new Date(last.date).getTime()) / DAY) : null;
    const runoutDays = Math.round(90 - ((month * 30.44) % 90));

    const reasons: string[] = [];
    let risk = 0;
    const window = treatmentById(treatment).results;
    if (month >= 1 && month < Math.max(6, window[0])) {
      risk += 30;
      reasons.push(`Month ${Math.max(1, Math.round(month))}: the months people quit`);
    }
    if (lastCheckDays === null || lastCheckDays > 40) {
      risk += 35;
      reasons.push(lastCheckDays === null ? "Never checked in" : `No check-in for ${lastCheckDays} days`);
    }
    const missedDays = Math.round(r() < 0.3 ? 6 + r() * 14 : r() * 4);
    if (missedDays >= 7) {
      risk += 15;
      reasons.push(`Missed ${missedDays} days last month`);
    }
    if (p.verdict === "early-dip") {
      risk += 25;
      reasons.push("Early dip: likely worried");
    }
    if (p.verdict === "declining") {
      risk += 20;
      reasons.push("Still declining: needs a prescriber review");
    }
    if (treatment !== "gentler-styles" && runoutDays <= 10) {
      risk += 10;
      reasons.push(runoutDays <= 0 ? "Runs out today" : `Runs out in ${runoutDays} days`);
    }
    const windows = guaranteeWindows(valid, new Date(start).toISOString(), PORTAL_NOW);
    const guaranteeDue = month * 30.44 >= 217;
    out.push({ id: `S-${String(1040 + i * 7).padStart(5, "0")}`, treatment, price, month, lastCheckDays, checkIns: valid.length, verdict: p.verdict, change: p.change, runoutDays, risk: Math.min(100, risk), reasons, guaranteeDue, evidence: claimReady(windows), missedDays });
  }
  return out;
}

/** Share still on treatment by month, from the minoxidil compliance study (n = 400):
 *  20.8% stopped within a month, a further 24.8% by month 3, 21.0% by month 6;
 *  12% were still using it after a year. Points in between are interpolated. */
export const TYPICAL_RETENTION: [number, number][] = [
  [0, 100],
  [1, 79],
  [3, 54],
  [6, 33],
  [12, 12],
];

export function cohortStats(c: Subscriber[]) {
  const atRisk = c.filter((s) => s.risk >= 55).sort((a, b) => b.risk - a.risk);
  const recent = c.filter((s) => s.lastCheckDays !== null && s.lastCheckDays <= 35).length;
  const reorders = c.filter((s) => s.treatment !== "gentler-styles" && s.runoutDays <= 14);
  return {
    active: c.length,
    checkedIn: Math.round((recent / c.length) * 100),
    atRisk,
    revenueAtRisk: atRisk.reduce((t, s) => t + s.price, 0),
    reorders,
    reorderValue: reorders.reduce((t, s) => t + s.price * 3, 0),
    improving: c.filter((s) => s.verdict === "improving" || s.verdict === "holding").length,
    guaranteeDue: c.filter((s) => s.guaranteeDue).length,
    evidenceReady: c.filter((s) => s.guaranteeDue && s.evidence).length,
  };
}

export function nudgeFor(s: Subscriber): string {
  const t = treatmentById(s.treatment);
  const m = Math.max(1, Math.round(s.month));
  if (s.lastCheckDays === null || s.lastCheckDays > 40) return `It's been a while. Two minutes today shows whether your ${t.name.toLowerCase()} is working. You're at month ${m}.`;
  if (s.verdict === "early-dip") return `A dip at month ${m} is common and usually settles. Results typically show from month ${t.results[0]}. Keep going, and check in again next month.`;
  if (s.verdict === "declining") return `Your report shows continued loss at month ${m}. Book a quick review with your prescriber; bring your edge.wise report.`;
  return `You're at month ${m}. Results usually show from month ${t.results[0]}. Holding steady now is what working looks like.`;
}
