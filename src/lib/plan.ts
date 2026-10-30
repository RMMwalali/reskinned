"use client";

import { createStore } from "./store";
import type { Plan } from "./treatments";

/** The person's treatment plan. */
export const planStore = createStore<Plan | null>("edgewise.plan.v1", null);

/** Small hairline thumbnails, kept only on this device, for side-by-side progress. */
export const thumbStore = createStore<Record<string, string>>("edgewise.thumbs.v1", {});

/** Draw a small JPEG of a photo for the on-device progress view. */
export async function makeThumb(src: string, width = 220): Promise<string | null> {
  try {
    const img = new Image();
    img.src = src;
    await img.decode();
    const h = Math.round((img.naturalHeight / img.naturalWidth) * width);
    const c = document.createElement("canvas");
    c.width = width;
    c.height = h;
    c.getContext("2d")!.drawImage(img, 0, 0, width, h);
    return c.toDataURL("image/jpeg", 0.72);
  } catch {
    return null;
  }
}
