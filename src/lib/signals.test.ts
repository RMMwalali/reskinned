import { describe, expect, it } from "vitest";
import type { CheckIn } from "./edges";
import { hairlineHeight, picks } from "./signals";
import { demoTreatment } from "./treatments";

const ci = (d: string, density: number, upperThird?: number, frizz?: CheckIn["frizz"]): CheckIn => ({
  id: d, date: d, density, spread: 0.05, term: "Medium Density",
  style: { style: "out", weeks: 0, extensions: false, relaxed: false },
  symptoms: { tightSigns: false, brokenEdges: false, crownItch: false }, upperThird, frizz,
});

describe("hairlineHeight", () => {
  it("needs two readings", () => expect(hairlineHeight([ci("2026-01-01", 1.5, 34)])).toBeNull());
  it("agrees when both measures improve", () => expect(hairlineHeight([ci("2026-01-01", 1.4, 35), ci("2026-06-01", 1.7, 33.5)])!.agreement).toBe("agree-better"));
  it("agrees when both measures worsen", () => expect(hairlineHeight([ci("2026-01-01", 1.8, 33), ci("2026-06-01", 1.5, 34.5)])!.agreement).toBe("agree-worse"));
  it("flags a mismatch", () => expect(hairlineHeight([ci("2026-01-01", 1.4, 33), ci("2026-06-01", 1.8, 34.5)])!.agreement).toBe("mixed"));
});

describe("picks", () => {
  it("turns breakage into bond repair", () => {
    expect(picks([ci("2026-06-01", 1.9, undefined, { mapping: 2, term: "Frizzy" })], null)[0].products).toContain("bond-repair");
  });
  it("suggests fibers while density is low", () => {
    expect(picks([ci("2026-06-01", 1.3)], null).some((p) => p.products.includes("hair-fibers"))).toBe(true);
  });
  it("turns reported irritation on minoxidil into the foam swap", () => {
    const c = { ...ci("2026-06-01", 1.9), adherence: { missedDays: 0, shedding: false, irritation: true } };
    const plan = { items: [{ id: "minoxidil-topical" as const, start: "2026-01-01" }] };
    expect(picks([c], plan)[0].products).toContain("minox-foam-5");
  });
  it("gives the sample a skin swap and a breakage pick", () => {
    const d = demoTreatment(new Date("2026-10-30"));
    const p = picks(d.list, d.plan).map((x) => x.source);
    expect(p).toContain("Skin Analysis");
    expect(p).toContain("Hair Frizziness");
  });
});
