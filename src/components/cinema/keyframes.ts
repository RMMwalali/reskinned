// Where each 3D actor is in each scroll scene. The scene blends from one
// keyframe to the next during the last part of each section's scroll.
// `n` = position on narrow screens, where the 3D sits above the text.

export type V3 = [number, number, number];
export type Scroll = number | "up" | "down"; // fixed, or driven by the section's scroll

type Placed = { pos: V3; n: V3; scale: number; vis: number };

export type Key = {
  hairline: Placed & { pull: Scroll; thin: Scroll };
  cards: Placed & { spread: number };
  gauge: Placed & { fill: Scroll };
  chart: Placed & { reveal: Scroll };
  bars: Placed & { sort: Scroll };
  glow: { pos: V3; n: V3; scale: number; opacity: number };
};

const hid = (pos: V3): Placed => ({ pos, n: [pos[0] * 0.2, 1.6, pos[2]], scale: 0.6, vis: 0 });

export const KEYS: Key[] = [
  // 0 hero — a full, healthy hairline
  {
    hairline: { pos: [2.45, -0.35, 0], n: [0, 2.05, 0], scale: 1, vis: 1, pull: 0, thin: 0 },
    cards: { ...hid([2.6, 0, -2]), spread: 0 },
    gauge: { ...hid([2.6, 0, -2]), fill: 0 },
    chart: { ...hid([2.6, 0, -2]), reveal: 0 },
    bars: { ...hid([2.6, -0.6, -2]), sort: 0 },
    glow: { pos: [2.4, 0, -2.5], n: [0, 1.6, -2.5], scale: 8, opacity: 0.95 },
  },
  // 1 problem — tension pulls, then the temples thin
  {
    hairline: { pos: [-2.5, -0.3, 0], n: [0, 2.1, 0], scale: 1.05, vis: 1, pull: "up", thin: "up" },
    cards: { ...hid([2.6, 0, -2]), spread: 0 },
    gauge: { ...hid([2.6, 0, -2]), fill: 0 },
    chart: { ...hid([2.6, 0, -2]), reveal: 0 },
    bars: { ...hid([2.6, -0.6, -2]), sort: 0 },
    glow: { pos: [-2.5, 0, -2.5], n: [0, 1.6, -2.5], scale: 7, opacity: 0.8 },
  },
  // 2 check-in — two hairline photos, density gauge fills
  {
    hairline: { pos: [2.6, -0.3, -2.5], n: [0, 1.4, -2.5], scale: 0.4, vis: 0, pull: 1, thin: 0.85 },
    cards: { pos: [1.85, 0.25, -0.4], n: [-0.5, 2.55, -0.4], scale: 1.2, vis: 1, spread: 1 },
    gauge: { pos: [3.75, -0.55, 0.6], n: [0.95, 2.2, 0.6], scale: 0.75, vis: 1, fill: "up" },
    chart: { ...hid([2.6, 0, -2]), reveal: 0 },
    bars: { ...hid([2.6, -0.6, -2]), sort: 0 },
    glow: { pos: [2.6, 0, -2.5], n: [0, 1.6, -2.5], scale: 8, opacity: 0.85 },
  },
  // 3 track — density over months: a dip, a break, a recovery
  {
    hairline: { pos: [2.6, -0.3, -2.5], n: [0, 1.4, -2.5], scale: 0.4, vis: 0, pull: 0, thin: 0 },
    cards: { pos: [2.4, 0, -2.5], n: [0, 1.6, -2.5], scale: 0.5, vis: 0, spread: 0 },
    gauge: { pos: [2.6, 0, -2.5], n: [0, 1.6, -2.5], scale: 0.4, vis: 0, fill: 1 },
    chart: { pos: [2.5, -0.05, 0], n: [0, 2.45, 0], scale: 1, vis: 1, reveal: "up" },
    bars: { ...hid([2.6, -0.6, -2]), sort: 0 },
    glow: { pos: [2.5, 0, -2.5], n: [0, 1.6, -2.5], scale: 8, opacity: 0.9 },
  },
  // 4 plan — same look, less pull: the bars re-sort
  {
    hairline: { pos: [2.6, -0.3, -2.5], n: [0, 1.4, -2.5], scale: 0.4, vis: 0, pull: 0, thin: 0 },
    cards: { pos: [2.4, 0, -2.5], n: [0, 1.6, -2.5], scale: 0.5, vis: 0, spread: 0 },
    gauge: { pos: [2.6, 0, -2.5], n: [0, 1.6, -2.5], scale: 0.4, vis: 0, fill: 1 },
    chart: { pos: [2.5, 0, -2.5], n: [0, 1.6, -2.5], scale: 0.5, vis: 0, reveal: 1 },
    bars: { pos: [2.45, -0.75, 0], n: [0, 1.75, 0], scale: 1, vis: 1, sort: "up" },
    glow: { pos: [2.5, 0, -2.5], n: [0, 1.6, -2.5], scale: 8, opacity: 0.9 },
  },
  // 5 stylist — quiet stage behind the conversation
  {
    hairline: { pos: [2.7, 0.2, -3.5], n: [0, 4, -4], scale: 0.7, vis: 0, pull: 0, thin: 0 },
    cards: { pos: [2.4, 0, -2.5], n: [0, 1.6, -2.5], scale: 0.5, vis: 0, spread: 0 },
    gauge: { pos: [2.6, 0, -2.5], n: [0, 1.6, -2.5], scale: 0.4, vis: 0, fill: 1 },
    chart: { pos: [2.5, 0, -2.5], n: [0, 1.6, -2.5], scale: 0.5, vis: 0, reveal: 1 },
    bars: { pos: [2.45, -0.75, -2.5], n: [0, 1.0, -2.5], scale: 0.5, vis: 0, sort: 1 },
    glow: { pos: [2.5, 0, -2.5], n: [0, 1.6, -2.5], scale: 8, opacity: 0.55 },
  },
  // 6 finale — a full hairline again
  {
    hairline: { pos: [0, 0.9, -0.5], n: [0, 2.0, -0.5], scale: 1.05, vis: 1, pull: 0, thin: 0 },
    cards: { pos: [2.4, 0, -2.5], n: [0, 1.6, -2.5], scale: 0.5, vis: 0, spread: 0 },
    gauge: { pos: [2.6, 0, -2.5], n: [0, 1.6, -2.5], scale: 0.4, vis: 0, fill: 1 },
    chart: { pos: [2.5, 0, -2.5], n: [0, 1.6, -2.5], scale: 0.5, vis: 0, reveal: 1 },
    bars: { pos: [2.45, -0.75, -2.5], n: [0, 1.0, -2.5], scale: 0.5, vis: 0, sort: 1 },
    glow: { pos: [0, 0.9, -2.5], n: [0, 1.6, -2.5], scale: 10, opacity: 1 },
  },
];

export const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Blend weight toward the next keyframe for a section's local progress. */
export const blendWeight = (local: number) => smoothstep(0.62, 1, local);

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const lerp3 = (a: V3, b: V3, t: number): V3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
