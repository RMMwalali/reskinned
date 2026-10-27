// Industry hair colour codes used by wig, weave and braiding-hair vendors.
//
// HONESTY NOTE: there is no official standard. The same code varies between
// brands and factories. These hex values are Rangi's reference estimates of how
// each code typically photographs indoors. That is why vendor links measure the
// vendor's own product photo instead of trusting the code alone.

export type HairCode = {
  code: string;
  name: string;
  hex: string;
  family: "black" | "brown" | "auburn" | "blonde" | "fashion";
};

export const HAIR_CODES: HairCode[] = [
  { code: "1", name: "Jet Black", hex: "#111012", family: "black" },
  { code: "1B", name: "Natural Black", hex: "#221A16", family: "black" },
  { code: "2", name: "Darkest Brown", hex: "#33231A", family: "brown" },
  { code: "4", name: "Medium Brown", hex: "#4B3022", family: "brown" },
  { code: "6", name: "Chestnut Brown", hex: "#6A432C", family: "brown" },
  { code: "8", name: "Light Ash Brown", hex: "#7D5C45", family: "brown" },
  { code: "33", name: "Dark Auburn", hex: "#5A2A1A", family: "auburn" },
  { code: "30", name: "Light Auburn", hex: "#8B4A27", family: "auburn" },
  { code: "350", name: "Copper Red", hex: "#A8461F", family: "auburn" },
  { code: "27", name: "Honey Blonde", hex: "#B07D47", family: "blonde" },
  { code: "613", name: "Bleach Blonde", hex: "#E2CFA0", family: "blonde" },
  { code: "99J", name: "Burgundy", hex: "#4B1A24", family: "fashion" },
];

export function findCode(code: string): HairCode | undefined {
  return HAIR_CODES.find((c) => c.code.toLowerCase() === code.toLowerCase());
}

/** Natural codes only — what a leave-out can realistically be. */
export const NATURAL_CODES = HAIR_CODES.filter((c) => c.family !== "fashion" && c.code !== "613");
