import { describe, expect, it } from "vitest";
import { assess, buildCard, decodeCard, demoHistory, encodeCard, saferStyles, tensionLoad, trend, type CheckIn } from "./edges";

const now = new Date("2026-11-01T12:00:00Z");
const wk = (n: number) => new Date(now.getTime() - n * 7 * 864e5).toISOString();
const none = { tightSigns: false, brokenEdges: false, crownItch: false };
const ci = (weeksAgo: number, density: number, over: Partial<CheckIn> = {}): CheckIn => ({
  id: String(weeksAgo),
  date: wk(weeksAgo),
  density,
  spread: 0.05,
  term: density > 2.2 ? "High Density" : density > 1.5 ? "Medium Density" : density > 0.8 ? "Low Density" : "Extremely Low Density",
  style: { style: "out", weeks: 4, extensions: false, relaxed: false },
  symptoms: none,
  ...over,
});

describe("trend", () => {
  it("uses the median of the first readings as baseline, so one bad photo can't set it", () => {
    const t = trend([ci(30, 2.3), ci(20, 1.2), ci(10, 2.28), ci(0, 2.25)]);
    expect(t.baseline).toBeCloseTo(2.28, 2);
  });
  it("counts consecutive declines beyond noise", () => {
    expect(trend([ci(30, 2.4), ci(20, 2.2), ci(10, 2.0), ci(0, 1.8)]).consecutiveDeclines).toBe(3);
    expect(trend([ci(20, 2.0), ci(10, 2.02), ci(0, 2.01)]).consecutiveDeclines).toBe(0);
  });
});

describe("tension load", () => {
  it("is higher for glued wigs than glueless, and decays with time", () => {
    const glued = tensionLoad([ci(1, 2, { style: { style: "glued-wig", weeks: 8, extensions: false, relaxed: false } })], now);
    const glueless = tensionLoad([ci(1, 2, { style: { style: "glueless-wig", weeks: 8, extensions: false, relaxed: false } })], now);
    const old = tensionLoad([ci(20, 2, { style: { style: "glued-wig", weeks: 8, extensions: false, relaxed: false } })], now);
    expect(glued).toBeGreaterThan(glueless);
    expect(old).toBeLessThan(glued);
  });
  it("increases when the install hurt (AAD: pain means too tight)", () => {
    const base = { style: { style: "cornrows" as const, weeks: 6, extensions: true, relaxed: false } };
    expect(tensionLoad([ci(1, 2, { ...base, symptoms: { ...none, tightSigns: true } })], now)).toBeGreaterThan(tensionLoad([ci(1, 2, base)], now));
  });
});

describe("assess", () => {
  it("first check-in sets a baseline", () => {
    const a = assess([ci(0, 2.3)], now);
    expect(a.trend.change).toBeNull();
    expect(a.status).toBe("steady");
  });
  it("a big drop is 'act' and recommends a dermatologist", () => {
    const a = assess([ci(20, 2.3), ci(10, 2.2), ci(0, 1.6)], now);
    expect(a.status).toBe("act");
    expect(a.seeDermatologist).toBe(true);
  });
  it("small wobble within noise stays steady", () => {
    expect(assess([ci(20, 2.3), ci(10, 2.25), ci(0, 2.22)], now).status).toBe("steady");
  });
  it("crown itching always routes to a dermatologist", () => {
    const a = assess([ci(0, 2.3, { symptoms: { ...none, crownItch: true } })], now);
    expect(a.seeDermatologist).toBe(true);
    expect(a.next[0]).toMatch(/dermatologist/);
  });
  it("demo history shows a decline under high tension", () => {
    const a = assess(demoHistory(now), now);
    expect(a.status).not.toBe("steady");
    expect(a.band).not.toBe("low");
  });
});

describe("safer styles", () => {
  it("only suggests options with less tension, lowest first", () => {
    const opts = saferStyles("box-braids");
    expect(opts[0].style.id).toBe("out");
    for (const o of opts) if (o.style.id !== "box-braids") expect(o.tensionDrop).toBeGreaterThan(0);
  });
});

describe("stylist card", () => {
  it("round-trips through a link and drops unknown styles", () => {
    const card = buildCard(demoHistory(now), "Wanjiru");
    const back = decodeCard(encodeCard({ ...card, avoid: [...card.avoid, "nonsense" as never] }));
    expect(back?.name).toBe("Wanjiru");
    expect(back?.avoid).not.toContain("nonsense");
  });
  it("rejects garbage", () => {
    expect(decodeCard("not-a-card")).toBeNull();
  });
});
