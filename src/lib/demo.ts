// Labelled demo values used when no API key is configured or the unit budget
// is exhausted. The UI always marks results built from these as "Demo".
// Rangi's own colour measurement (the tap sample) is still real in demo mode.

import type { Measurements } from "./match";

export const DEMO_YOUCAM: Pick<Measurements, "hairType" | "hairLength" | "skinTone"> = {
  hairType: { mapping: "4a to 4b", term: "Kinky Soft to Coily" },
  hairLength: { term: "above chest" },
  skinTone: { hairColor: "#000000", hairColorName: "Black", skinColor: "#7A4E36", lighting: "good" },
};

/** Units one full scan spends: hair type 2 + hair length 2 + skin tone 20. */
export const UNITS_PER_SCAN = 24;
/** Units one colour try-on spends. */
export const UNITS_PER_TRYON = 1;
