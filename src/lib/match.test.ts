import { describe, expect, it } from "vitest";
import { deltaE2000, hexToLab, robustHairColour, hexToRgb } from "./colour";
import { blendCheck, matchHair, rankCodes, recommendInstall, recommendTexture, type Measurements } from "./match";

describe("CIEDE2000 against Sharma, Wu & Dalal (2005) reference pairs", () => {
  const pairs: [number[], number[], number][] = [
    [[50, 2.6772, -79.7751], [50, 0, -82.7485], 2.0425],
    [[50, 0, 0], [50, -1, 2], 2.3669],
    [[50, 2.5, 0], [73, 25, -18], 27.1492],
    [[60.2574, -34.0099, 36.2677], [60.4626, -34.1751, 39.4387], 1.2644],
    [[22.7233, 20.0904, -46.694], [23.0331, 14.973, -42.5619], 2.0373],
  ];
  it.each(pairs)("pair %#", (a, b, expected) => {
    const d = deltaE2000({ L: a[0], a: a[1], b: a[2] }, { L: b[0], a: b[1], b: b[2] });
    expect(d).toBeCloseTo(expected, 3);
  });
  it("is symmetric and zero on identity", () => {
    const x = hexToLab("#4B3022");
    const y = hexToLab("#221A16");
    expect(deltaE2000(x, x)).toBe(0);
    expect(deltaE2000(x, y)).toBeCloseTo(deltaE2000(y, x), 9);
  });
});

describe("robustHairColour", () => {
  it("ignores shine and shadow outliers", () => {
    const base = Array.from({ length: 60 }, () => hexToRgb("#33231A"));
    const shine = Array.from({ length: 10 }, () => hexToRgb("#D8D0C8"));
    const shadow = Array.from({ length: 10 }, () => hexToRgb("#000000"));
    const r = robustHairColour([...base, ...shine, ...shadow]);
    expect(deltaE2000(hexToLab(r.hex), hexToLab("#33231A"))).toBeLessThan(1);
  });
});

describe("matching", () => {
  const base: Measurements = {
    hairType: { mapping: "4b to 4c", term: "Coily to Extremely Coily" },
    hairLength: { term: "above chest" },
    skinTone: { hairColor: "#000000", hairColorName: "Black", lighting: "good" },
    sample: { hex: "#231B17", spread: 2, n: 300 },
    leaveOut: "natural",
  };

  it("ranks 1B first for natural black", () => {
    expect(rankCodes("#231B17")[0].code).toBe("1B");
  });

  it("4c natural → Afro Kinky; stretched → Kinky Straight; relaxed → Yaki", () => {
    expect(recommendTexture(base.hairType, "natural")!.primary).toBe("Afro Kinky");
    expect(recommendTexture(base.hairType, "stretched")!.primary).toBe("Kinky Straight");
    expect(recommendTexture(base.hairType, "relaxed")!.primary).toBe("Yaki Straight");
  });

  it("short hair → wig or closure", () => {
    expect(recommendInstall({ term: "above the ears" })!.install).toMatch(/wig/i);
  });

  it("disagreement with YouCam lowers confidence and is explained", () => {
    const r = matchHair({ ...base, skinTone: { ...base.skinTone!, hairColorName: "Blonde" } });
    expect(r.colour.apiAgrees).toBe(false);
    expect(r.confidence.level).not.toBe("high");
    expect(r.confidence.reasons.join(" ")).toMatch(/disagrees/);
  });

  it("matching product blends, mismatched product doesn't", () => {
    const r = matchHair(base);
    const good = blendCheck(r, { name: "A", vendor: "V", code: "1B", texture: "Afro Kinky" });
    const bad = blendCheck(r, { name: "B", vendor: "V", code: "27", texture: "Silky Straight" });
    expect(good.verdict).toBe("blends");
    expect(bad.verdict).toBe("wont");
    expect(good.score).toBeGreaterThan(bad.score);
  });
});
