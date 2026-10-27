// Rangi's matching engine. Turns YouCam measurements plus Rangi's own pixel
// measurement into a recommendation, and is explicit about how sure it is.
// Deterministic: no model opinions, every number traces to a rule below.

import { deltaE2000, hexToLab } from "./colour";
import { HAIR_CODES, NATURAL_CODES, findCode, type HairCode } from "./codes";

// ---------- Inputs ----------

export type HairTypeMapping =
  | "1 to 2a" | "2a to 2b" | "2b to 2c" | "2c to 3a" | "3a to 3b"
  | "3b to 3c" | "3c to 4a" | "4a to 4b" | "4b to 4c";

export type HairLengthTerm =
  | "above the ears" | "ear length" | "ear length or longer" | "short hair"
  | "short hair or longer" | "above chest" | "above chest or longer" | "long hair";

export type LeaveOutState = "natural" | "stretched" | "relaxed";

export type Measurements = {
  hairType: { mapping: HairTypeMapping; term: string } | null;
  hairLength: { term: HairLengthTerm } | null;
  skinTone: {
    hairColor: string; // quantised hex from YouCam (one of 7 values)
    hairColorName: string; // Auburn | Black | Blonde | Brown | Grey/White | Red
    eyebrowColor?: string;
    skinColor?: string;
    lighting?: string; // face_quality.lighting as returned
  } | null;
  sample: { hex: string; spread: number; n: number }; // Rangi's tap-to-measure
  leaveOut: LeaveOutState;
};

// ---------- Textures ----------

export const TEXTURES = [
  "Silky Straight",
  "Yaki Straight",
  "Kinky Straight",
  "Body Wave",
  "Deep Wave",
  "Kinky Curly",
  "Afro Kinky Curly",
  "Afro Kinky",
] as const;
export type Texture = (typeof TEXTURES)[number];

const NATURAL_TEXTURE: Record<HairTypeMapping, { primary: Texture; alt?: Texture }> = {
  "1 to 2a": { primary: "Silky Straight" },
  "2a to 2b": { primary: "Silky Straight", alt: "Body Wave" },
  "2b to 2c": { primary: "Body Wave" },
  "2c to 3a": { primary: "Body Wave", alt: "Deep Wave" },
  "3a to 3b": { primary: "Deep Wave" },
  "3b to 3c": { primary: "Kinky Curly" },
  "3c to 4a": { primary: "Kinky Curly", alt: "Afro Kinky Curly" },
  "4a to 4b": { primary: "Afro Kinky Curly", alt: "Afro Kinky" },
  "4b to 4c": { primary: "Afro Kinky" },
};

const TYPE_ORDER: HairTypeMapping[] = Object.keys(NATURAL_TEXTURE) as HairTypeMapping[];
const isTextured = (m: HairTypeMapping) => TYPE_ORDER.indexOf(m) >= TYPE_ORDER.indexOf("3b to 3c");

export function recommendTexture(
  hairType: Measurements["hairType"],
  leaveOut: LeaveOutState,
): { primary: Texture; alt?: Texture; why: string } | null {
  if (!hairType) return null;
  const m = hairType.mapping;
  if (leaveOut === "relaxed") {
    return isTextured(m)
      ? { primary: "Yaki Straight", alt: "Silky Straight", why: "Relaxed hair has the soft, slightly coarse look of Yaki rather than glossy silky hair." }
      : { primary: "Silky Straight", why: "Your relaxed hair is naturally smooth, so silky hair matches its finish." };
  }
  if (leaveOut === "stretched") {
    return isTextured(m)
      ? { primary: "Kinky Straight", alt: "Yaki Straight", why: `Blown-out ${hairType.term.toLowerCase()} hair keeps a fluffy, textured finish. Kinky straight copies it.` }
      : { primary: "Silky Straight", why: "Straightened, your hair is smooth enough for silky hair." };
  }
  const t = NATURAL_TEXTURE[m];
  return { ...t, why: `Your curl pattern measured ${hairType.mapping} (${hairType.term}). ${t.primary} is the closest commercial texture.` };
}

export function textureDistance(a: Texture, b: Texture): number {
  return Math.abs(TEXTURES.indexOf(a) - TEXTURES.indexOf(b));
}

// ---------- Install type from length ----------

export type InstallAdvice = { install: string; detail: string };

export function recommendInstall(len: Measurements["hairLength"]): InstallAdvice | null {
  if (!len) return null;
  switch (len.term) {
    case "above the ears":
    case "ear length":
      return {
        install: "Full wig or closure",
        detail: "Your hair measured too short to blend a leave-out at the sides. A closure or full wig hides it completely, so colour matching matters less.",
      };
    case "ear length or longer":
    case "short hair":
    case "short hair or longer":
      return {
        install: "Closure or small leave-out",
        detail: "A closure is safest. A small leave-out can work if you stretch it, and then the colour and texture match below matters most.",
      };
    default:
      return {
        install: "Leave-out sew-in or U-part",
        detail: "Your hair is long enough to blend over the tracks, so the extensions must match your colour and texture closely.",
      };
  }
}

// ---------- Colour ----------

export type CodeMatch = HairCode & { deltaE: number };

export function rankCodes(sampleHex: string, codes: HairCode[] = NATURAL_CODES): CodeMatch[] {
  const s = hexToLab(sampleHex);
  return codes
    .map((c) => ({ ...c, deltaE: deltaE2000(s, hexToLab(c.hex)) }))
    .sort((a, b) => a.deltaE - b.deltaE);
}

const API_FAMILY: Record<string, HairCode["family"] | "other"> = {
  Black: "black",
  Brown: "brown",
  Auburn: "auburn",
  Red: "auburn",
  Blonde: "blonde",
  "Grey/White": "other",
};

// ---------- Confidence ----------

export type Confidence = { level: "high" | "medium" | "low"; reasons: string[] };

function confidenceFrom(points: number, reasons: string[]): Confidence {
  return { level: points >= 3 ? "high" : points >= 1 ? "medium" : "low", reasons };
}

// ---------- The match ----------

export type MatchResult = {
  colour: {
    best: CodeMatch;
    runnerUp: CodeMatch;
    ranked: CodeMatch[];
    sampleHex: string;
    apiAgrees: boolean | null;
    apiHairColorName: string | null;
    note: string;
  };
  texture: ReturnType<typeof recommendTexture>;
  install: InstallAdvice | null;
  confidence: Confidence;
};

export function matchHair(m: Measurements): MatchResult {
  const ranked = rankCodes(m.sample.hex);
  const [best, runnerUp] = ranked;
  const reasons: string[] = [];
  let points = 4;

  // 1. Is the colour clearly one code, or between two?
  const gap = runnerUp.deltaE - best.deltaE;
  let note = `Closest to ${best.code} (${best.name}), ΔE ${best.deltaE.toFixed(1)}.`;
  if (gap < 1.5) {
    points -= 1;
    note = `Between ${best.code} and ${runnerUp.code}. They are only ΔE ${gap.toFixed(1)} apart on your sample. Order ${best.code}; ${runnerUp.code} is a safe second choice.`;
    reasons.push(`Your colour sits between ${best.code} and ${runnerUp.code}.`);
  }
  if (best.deltaE > 8) {
    points -= 1;
    reasons.push("No standard code is a close match. Your hair may be dyed, sun-lightened or photographed in coloured light.");
  }

  // 2. Did the person tap a uniform area of hair?
  if (m.sample.spread > 6) {
    points -= 1;
    reasons.push("The area you tapped mixes several tones (shine, shadow or highlights). Tap a flatter patch for a steadier reading.");
  }

  // 3. Cross-check against YouCam's own hair colour classification.
  let apiAgrees: boolean | null = null;
  if (m.skinTone) {
    const fam = API_FAMILY[m.skinTone.hairColorName] ?? "other";
    apiAgrees = fam === best.family || (fam === "black" && best.family === "brown" && best.code === "2");
    if (!apiAgrees) {
      points -= 2;
      reasons.push(`YouCam classified your hair as ${m.skinTone.hairColorName}, which disagrees with Rangi's measurement (${best.code}). Retake in daylight.`);
    }
    const light = (m.skinTone.lighting ?? "").toLowerCase();
    if (light && !/(good|ok|normal|pass|sufficient|bright)/.test(light)) {
      points -= 1;
      reasons.push(`YouCam rated the lighting "${m.skinTone.lighting}". Colour readings drift in dim or yellow light.`);
    }
  } else {
    points -= 1;
    reasons.push("No independent colour check from YouCam on this scan.");
  }

  // 4. Texture needs the 3-angle scan.
  if (!m.hairType) {
    points -= 1;
    reasons.push("Curl pattern wasn't measured, so texture advice is missing.");
  } else if (m.leaveOut === "natural" && isTextured(m.hairType.mapping)) {
    reasons.push("Curly hair shrinks, so measured length can read shorter than your stretched length.");
  }

  // Very dark hair: the black codes sit close together, say so.
  if (hexToLab(m.sample.hex).L < 14) {
    reasons.push("Very dark hair: 1 and 1B differ mostly in warmth, which phone cameras flatten. Compare in daylight before cutting the bundle.");
  }

  if (reasons.length === 0) reasons.push("Clear sample, one obvious code, and YouCam's check agrees.");

  return {
    colour: {
      best,
      runnerUp,
      ranked,
      sampleHex: m.sample.hex,
      apiAgrees,
      apiHairColorName: m.skinTone?.hairColorName ?? null,
      note,
    },
    texture: recommendTexture(m.hairType, m.leaveOut),
    install: recommendInstall(m.hairLength),
    confidence: confidenceFrom(points, reasons),
  };
}

// ---------- Will this vendor product blend? ----------

export type Product = {
  name: string;
  vendor: string;
  code: string; // vendor-declared colour code
  measuredHex?: string; // measured from the vendor's own product photo
  texture: Texture;
  inches?: number;
  priceKes?: number;
  whatsapp?: string; // digits only, international format
};

export type BlendVerdict = {
  verdict: "blends" | "close" | "wont";
  score: number; // 0..100
  colourDeltaE: number;
  colourBasis: "measured" | "declared";
  textureSteps: number | null;
  headline: string;
  lines: string[];
};

export function blendCheck(match: MatchResult, product: Product): BlendVerdict {
  const declared = findCode(product.code) ?? HAIR_CODES[1];
  const productHex = product.measuredHex ?? declared.hex;
  const colourBasis = product.measuredHex ? "measured" : "declared";
  const dE = deltaE2000(hexToLab(match.colour.sampleHex), hexToLab(productHex));

  const tex = match.texture;
  const steps = tex
    ? Math.min(textureDistance(tex.primary, product.texture), tex.alt ? textureDistance(tex.alt, product.texture) : 99)
    : null;

  const colourScore = Math.max(0, 100 - dE * 7); // ΔE 0 → 100, ΔE ~14 → 0
  const textureScore = steps === null ? 70 : Math.max(0, 100 - steps * 35);
  const score = Math.round(colourScore * 0.55 + textureScore * 0.45);

  const lines: string[] = [];
  lines.push(
    dE <= 3 ? `Colour: near-identical to your hair (ΔE ${dE.toFixed(1)}).`
    : dE <= 6 ? `Colour: a close match (ΔE ${dE.toFixed(1)}). Most people won't see the line.`
    : dE <= 10 ? `Colour: noticeably different (ΔE ${dE.toFixed(1)}). The leave-out may show in daylight.`
    : `Colour: clearly different (ΔE ${dE.toFixed(1)}). ${match.colour.best.code} would match you better than ${product.code}.`,
  );
  if (steps === null) lines.push("Texture: not checked. Scan from three angles to compare curl pattern.");
  else if (steps === 0) lines.push(`Texture: ${product.texture} matches your hair.`);
  else if (steps === 1) lines.push(`Texture: ${product.texture} is one step from your ${tex!.primary}. It blends if you stretch or curl your leave-out slightly.`);
  else lines.push(`Texture: ${product.texture} is far from your ${tex!.primary}. The join will show.`);
  if (colourBasis === "declared") lines.push(`The vendor didn't photograph this product, so we used Rangi's reference for code ${product.code}. Codes vary by factory.`);

  const verdict: BlendVerdict["verdict"] =
    dE <= 6 && (steps === null || steps === 0) ? "blends"
    : dE <= 10 && (steps === null || steps <= 1) ? "close"
    : "wont";
  const headline = verdict === "blends" ? "This will blend." : verdict === "close" ? "Close — with a little styling." : "This won't blend.";

  return { verdict, score, colourDeltaE: dE, colourBasis, textureSteps: steps, headline, lines };
}
