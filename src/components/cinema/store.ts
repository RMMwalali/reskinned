// Shared, mutable state between the DOM (scroll, pointer) and the WebGL scene.
// Mutated outside React on purpose: the scene reads it every frame, so routing
// it through React state would re-render 60 times a second for nothing.

export const SCENES = ["hero", "problem", "photos", "measure", "tryon", "vendor", "cta"] as const;
export type SceneId = (typeof SCENES)[number];

export const cinema = {
  /** Index of the scene whose section holds the middle of the viewport. */
  index: 0,
  /** 0..1 progress of the viewport middle through that section. */
  local: 0,
  /** Pointer position, -1..1 on both axes. */
  pointer: { x: 0, y: 0 },
  reducedMotion: false,
  /** Narrow screens move the 3D above the text instead of beside it. */
  narrow: false,
};

type Listener = () => void;
const listeners = new Set<Listener>();

/** Subscribe to scroll updates (fires after cinema.index/local change). */
export function onScroll(fn: Listener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function emitScroll() {
  listeners.forEach((fn) => fn());
}

/** Progress of a given scene: 0 before it, its local progress during, 1 after. */
export function progressOf(scene: number): number {
  if (cinema.index > scene) return 1;
  if (cinema.index < scene) return 0;
  return cinema.local;
}

export function sceneIndex(id: SceneId): number {
  return SCENES.indexOf(id);
}
