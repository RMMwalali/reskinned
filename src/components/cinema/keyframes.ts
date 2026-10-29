// Where each 3D actor is in each scroll scene. The scene blends from one
// keyframe to the next during the last part of each section's scroll.
// `n` = position on narrow screens, where the 3D sits above the text.

export type V3 = [number, number, number];

export type SwatchLayout = "fan" | "stack" | "orbit" | "arc";

export type Key = {
  swatch: { layout: SwatchLayout; pos: V3; n: V3; scale: number; rot: V3; opacity: number };
  bundle: { pos: V3; n: V3; scale: number; vis: number; curl: number | "scroll"; colour: "neutral" | "cycle" | "sample" };
  orb: { pos: V3; n: V3; scale: number; fill: number | "scroll" };
  frames: { pos: V3; n: V3; scale: number; spread: number; opacity: number };
  particles: number;
  glow: { pos: V3; n: V3; scale: number; opacity: number };
};

const OFF: V3 = [7, 0.4, -4];

export const KEYS: Key[] = [
  // 0 hero — the colour ring, fanned open
  {
    swatch: { layout: "fan", pos: [2.55, -0.15, 0], n: [0, 1.55, 0], scale: 1, rot: [-0.22, -0.5, 0], opacity: 1 },
    bundle: { pos: [2.5, -0.4, -1], n: [0, 1.4, -1], scale: 0.4, vis: 0, curl: 0, colour: "neutral" },
    orb: { pos: [2.6, 0, 0], n: [0, 1.6, 0], scale: 0, fill: 0 },
    frames: { pos: [2.6, 0, -1], n: [0, 1.6, -1], scale: 0.6, spread: 0, opacity: 0 },
    particles: 0,
    glow: { pos: [2.5, 0, -2.5], n: [0, 1.6, -2.5], scale: 8, opacity: 0.95 },
  },
  // 1 problem — one bundle, colour and curl changing as you read
  {
    swatch: { layout: "stack", pos: OFF, n: OFF, scale: 0.5, rot: [0, -0.6, 0], opacity: 0 },
    bundle: { pos: [-2.55, 0.05, 0], n: [0, 1.55, 0], scale: 1, vis: 1, curl: "scroll", colour: "cycle" },
    orb: { pos: [-2.5, 0, 0], n: [0, 1.6, 0], scale: 0, fill: 0 },
    frames: { pos: [2.6, 0, -1], n: [0, 1.6, -1], scale: 0.6, spread: 0, opacity: 0 },
    particles: 0,
    glow: { pos: [-2.5, 0, -2.5], n: [0, 1.6, -2.5], scale: 7, opacity: 0.8 },
  },
  // 2 photos — three frosted photo cards
  {
    swatch: { layout: "stack", pos: OFF, n: OFF, scale: 0.5, rot: [0, -0.6, 0], opacity: 0 },
    bundle: { pos: [2.4, -0.3, -2], n: [0, 1.5, -2], scale: 0.45, vis: 0, curl: 0.85, colour: "sample" },
    orb: { pos: [2.5, 0, 0], n: [0, 1.6, 0], scale: 0, fill: 0 },
    frames: { pos: [2.55, 0.05, 0], n: [0, 1.6, 0], scale: 1, spread: 1, opacity: 1 },
    particles: 0,
    glow: { pos: [2.5, 0, -2.5], n: [0, 1.6, -2.5], scale: 8, opacity: 0.85 },
  },
  // 3 measure — pixels stream from the hair into the colour orb
  {
    swatch: { layout: "stack", pos: OFF, n: OFF, scale: 0.5, rot: [0, -0.6, 0], opacity: 0 },
    bundle: { pos: [0.55, 0, 0], n: [-0.75, 1.85, 0], scale: 0.82, vis: 1, curl: 0.85, colour: "sample" },
    orb: { pos: [3.4, 0.05, 0], n: [0.82, 1.9, 0], scale: 0.78, fill: "scroll" },
    frames: { pos: [5, 0, -3], n: [3, 1.6, -3], scale: 0.4, spread: 0, opacity: 0 },
    particles: 1,
    glow: { pos: [2.2, 0, -2.5], n: [0, 1.6, -2.5], scale: 9, opacity: 0.9 },
  },
  // 4 try-on — codes orbit the orb, the match steps forward
  {
    swatch: { layout: "orbit", pos: [2.55, -0.05, 0], n: [0, 1.6, 0], scale: 0.86, rot: [0.22, 0, 0.06], opacity: 1 },
    bundle: { pos: [2.55, 0, 0], n: [0, 1.6, 0], scale: 0.2, vis: 0, curl: 0.85, colour: "sample" },
    orb: { pos: [2.55, -0.05, 0], n: [0, 1.6, 0], scale: 0.62, fill: 1 },
    frames: { pos: [5, 0, -3], n: [3, 1.6, -3], scale: 0.4, spread: 0, opacity: 0 },
    particles: 0,
    glow: { pos: [2.5, 0, -2.5], n: [0, 1.6, -2.5], scale: 8, opacity: 1 },
  },
  // 5 vendor — codes settle into a quiet arc behind the conversation
  {
    swatch: { layout: "arc", pos: [2.6, 0.3, -3.2], n: [0, 4.2, -4], scale: 0.85, rot: [0, -0.25, 0], opacity: 0.22 },
    bundle: { pos: [2.6, 0, -2], n: [0, 1.6, -2], scale: 0.2, vis: 0, curl: 0.85, colour: "sample" },
    orb: { pos: [2.6, 0, -2], n: [0, 1.6, -2], scale: 0, fill: 1 },
    frames: { pos: [5, 0, -3], n: [3, 1.6, -3], scale: 0.4, spread: 0, opacity: 0 },
    particles: 0,
    glow: { pos: [2.5, 0, -2.5], n: [0, 1.6, -2.5], scale: 8, opacity: 0.5 },
  },
  // 6 call to action — the ring opens again, centre stage
  {
    swatch: { layout: "fan", pos: [0, 1.2, -0.6], n: [0, 1.75, -0.6], scale: 0.85, rot: [-0.12, 0, 0], opacity: 1 },
    bundle: { pos: [0, 0, -2], n: [0, 1.5, -2], scale: 0.2, vis: 0, curl: 0, colour: "neutral" },
    orb: { pos: [0, 0.4, -2], n: [0, 1.5, -2], scale: 0, fill: 0 },
    frames: { pos: [5, 0, -3], n: [3, 1.6, -3], scale: 0.4, spread: 0, opacity: 0 },
    particles: 0,
    glow: { pos: [0, 0.5, -2.5], n: [0, 1.5, -2.5], scale: 10, opacity: 1 },
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
