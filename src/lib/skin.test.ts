import { describe, expect, it } from "vitest";
import type { CheckIn } from "./edges";
import { skinTrend } from "./skin";
import { demoTreatment } from "./treatments";

const ci = (d: string, skin?: CheckIn["skin"]): CheckIn => ({
  id: d, date: d, density: 1.5, spread: 0.05, term: "Medium Density",
  style: { style: "out", weeks: 0, extensions: false, relaxed: false },
  symptoms: { tightSigns: false, brokenEdges: false, crownItch: false }, skin,
});
const minox = { items: [{ id: "minoxidil-topical" as const, start: "2026-01-01" }] };

describe("skinTrend", () => {
  it("is null without skin readings", () => {
    expect(skinTrend([ci("2026-01-01")], minox)).toBeNull();
  });
  it("flags nothing on a single reading", () => {
    expect(skinTrend([ci("2026-01-01", { redness: 50 })], minox)!.worse).toEqual([]);
  });
  it("suggests the foam when redness rises on minoxidil", () => {
    const t = skinTrend([ci("2026-01-01", { redness: 80 }), ci("2026-03-01", { redness: 65 })], minox)!;
    expect(t.worse).toContain("redness");
    expect(t.advice[0].products).toContain("minox-foam-5");
  });
  it("gives general advice without minoxidil", () => {
    const t = skinTrend([ci("2026-01-01", { moisture: 80 }), ci("2026-03-01", { moisture: 60 })], null)!;
    expect(t.advice[0].products).toEqual(["gentle-moisturizer"]);
  });
  it("ignores small changes", () => {
    expect(skinTrend([ci("2026-01-01", { redness: 80 }), ci("2026-03-01", { redness: 75 })], minox)!.advice).toEqual([]);
  });
  it("tells the sample story with an irritation swap", () => {
    const d = demoTreatment(new Date("2026-10-30"));
    expect(skinTrend(d.list, d.plan)!.advice[0].title).toMatch(/foam/);
  });
});
