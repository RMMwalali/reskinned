import { describe, expect, it } from "vitest";
import type { CheckIn } from "./edges";
import { claimReady, guaranteeWindows } from "./guarantee";
import { demoTreatment } from "./treatments";

const start = "2026-01-01T00:00:00Z";
const day = (n: number) => new Date(new Date(start).getTime() + n * 864e5).toISOString();
const ci = (n: number): CheckIn => ({
  id: String(n), date: day(n), density: 1.5, spread: 0.05, term: "Medium Density",
  style: { style: "out", weeks: 0, extensions: false, relaxed: false },
  symptoms: { tightSigns: false, brokenEdges: false, crownItch: false },
});

describe("guaranteeWindows", () => {
  it("marks windows done, open and upcoming", () => {
    const w = guaranteeWindows([ci(5)], start, new Date(day(100)));
    expect(w.map((x) => x.state)).toEqual(["done", "open", "upcoming"]);
  });
  it("marks a passed window as missed", () => {
    expect(guaranteeWindows([ci(5)], start, new Date(day(140)))[1].state).toBe("missed");
  });
  it("is claim-ready when all three are done", () => {
    expect(claimReady(guaranteeWindows([ci(3), ci(110), ci(200)], start, new Date(day(205))))).toBe(true);
  });
  it("the sample history fills every window", () => {
    const d = demoTreatment(new Date("2026-10-30T00:00:00Z"));
    expect(claimReady(guaranteeWindows(d.list, d.plan.items[0].start, new Date("2026-10-30T00:00:00Z")))).toBe(true);
  });
});
