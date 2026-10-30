import { describe, expect, it } from "vitest";
import type { CheckIn } from "./edges";
import { demoTreatment, progress, type Plan } from "./treatments";

const NOW = new Date("2026-10-30T00:00:00Z");
const MONTH = 30.44 * 864e5;
const ago = (m: number) => new Date(NOW.getTime() - m * MONTH).toISOString();
const ci = (m: number, density: number): CheckIn => ({
  id: String(m), date: ago(m), density, spread: 0.05, term: "Medium Density",
  style: { style: "out", weeks: 0, extensions: false, relaxed: false },
  symptoms: { tightSigns: false, brokenEdges: false, crownItch: false },
});
const plan = (startMonthsAgo: number, id: Plan["items"][number]["id"] = "minoxidil-topical"): Plan => ({ items: [{ id, start: ago(startMonthsAgo) }] });

describe("progress", () => {
  it("asks for a plan first", () => {
    expect(progress([], null, NOW).verdict).toBe("no-plan");
  });
  it("asks for a first check-in", () => {
    expect(progress([], plan(1), NOW).verdict).toBe("need-checkin");
  });
  it("treats the first reading as the starting point", () => {
    expect(progress([ci(0.1, 1.5)], plan(0.2), NOW).verdict).toBe("baseline");
  });
  it("calls steady readings before the results window 'early', in the quit zone", () => {
    const p = progress([ci(3, 1.5), ci(0, 1.52)], plan(3), NOW);
    expect(p.verdict).toBe("early");
    expect(p.quitZone).toBe(true);
  });
  it("calls steady readings inside the window 'holding'", () => {
    expect(progress([ci(8, 1.5), ci(0, 1.45)], plan(8), NOW).verdict).toBe("holding");
  });
  it("reassures about an early dip", () => {
    const p = progress([ci(1.5, 1.6), ci(0, 1.35)], plan(1.5), NOW);
    expect(p.verdict).toBe("early-dip");
    expect(p.seeDoctor).toBe(false);
  });
  it("sends a later decline to a doctor", () => {
    const p = progress([ci(6, 1.6), ci(0, 1.3)], plan(6), NOW);
    expect(p.verdict).toBe("declining");
    expect(p.seeDoctor).toBe(true);
  });
  it("spots improvement", () => {
    expect(progress([ci(7, 1.4), ci(0, 1.7)], plan(7), NOW).verdict).toBe("improving");
  });
  it("uses the finasteride window", () => {
    expect(progress([], plan(1, "finasteride"), NOW).window).toEqual([4, 6]);
  });
  it("tells the sample story as improving", () => {
    const d = demoTreatment(NOW);
    expect(progress(d.list, d.plan, NOW).verdict).toBe("improving");
  });
});
