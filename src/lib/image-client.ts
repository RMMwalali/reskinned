"use client";

// Browser-side image preparation. Everything here runs on the shopper's phone:
// photos are resized, checked and sampled before anything leaves the device.

import { robustHairColour, rgbToLab, type RGB } from "./colour";

export type Prepared = {
  blob: Blob; // JPEG, identical dimensions across the three angles
  url: string; // object URL for preview
  width: number;
  height: number;
  light: LightCheck;
};

export type LightCheck = { ok: boolean; level: "dark" | "bright" | "warm" | "good"; message: string; meanL: number };

// 768 x 1024 portrait: under every YouCam size limit (hair-ext/hairstyle need
// long side ≤ 1024 and JPEG; hair type needs all three photos the same size).
export const TARGET_W = 768;
export const TARGET_H = 1024;

async function loadBitmap(file: Blob): Promise<ImageBitmap> {
  return await createImageBitmap(file, { imageOrientation: "from-image" });
}

/** Cover-crop to TARGET_W x TARGET_H, centred slightly high to keep hair in frame. */
export async function prepareImage(file: Blob): Promise<Prepared> {
  const bmp = await loadBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = TARGET_W;
  canvas.height = TARGET_H;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  const scale = Math.max(TARGET_W / bmp.width, TARGET_H / bmp.height);
  const w = bmp.width * scale;
  const h = bmp.height * scale;
  const x = (TARGET_W - w) / 2;
  const y = Math.min(0, (TARGET_H - h) * 0.35); // bias toward the top of the photo
  ctx.drawImage(bmp, x, y, w, h);
  bmp.close();

  const light = checkLight(ctx);
  const blob: Blob = await new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error("encode failed"))), "image/jpeg", 0.9));
  return { blob, url: URL.createObjectURL(blob), width: TARGET_W, height: TARGET_H, light };
}

/** Grey-world light check on the central region: too dark, blown out, or a strong yellow cast. */
export function checkLight(ctx: CanvasRenderingContext2D): LightCheck {
  const { width, height } = ctx.canvas;
  const x0 = Math.floor(width * 0.2);
  const y0 = Math.floor(height * 0.15);
  const data = ctx.getImageData(x0, y0, Math.floor(width * 0.6), Math.floor(height * 0.6)).data;
  let r = 0, g = 0, b = 0, n = 0;
  for (let i = 0; i < data.length; i += 16) {
    r += data[i]; g += data[i + 1]; b += data[i + 2]; n++;
  }
  const mean = { r: r / n, g: g / n, b: b / n };
  const lab = rgbToLab(mean);
  if (lab.L < 28) return { ok: false, level: "dark", message: "Too dark to read colour reliably. Face a window or step into daylight.", meanL: lab.L };
  if (lab.L > 85) return { ok: false, level: "bright", message: "Very bright. Highlights wash colour out, so try softer light.", meanL: lab.L };
  if (lab.b > 22) return { ok: true, level: "warm", message: "Warm, yellow light detected. It can make black hair read brown. Daylight is better.", meanL: lab.L };
  return { ok: true, level: "good", message: "Light looks even.", meanL: lab.L };
}

/** Read pixels in a circle (image coordinates) and return a robust hair colour. */
export async function sampleHair(blob: Blob, cx: number, cy: number, radius = 22) {
  const bmp = await loadBitmap(blob);
  const canvas = document.createElement("canvas");
  canvas.width = bmp.width;
  canvas.height = bmp.height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(bmp, 0, 0);
  bmp.close();
  const x0 = Math.max(0, Math.round(cx - radius));
  const y0 = Math.max(0, Math.round(cy - radius));
  const size = radius * 2;
  const data = ctx.getImageData(x0, y0, size, size).data;
  const pixels: RGB[] = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if ((x - radius) ** 2 + (y - radius) ** 2 > radius ** 2) continue;
      const i = (y * size + x) * 4;
      if (data[i + 3] < 200) continue;
      pixels.push({ r: data[i], g: data[i + 1], b: data[i + 2] });
    }
  }
  return robustHairColour(pixels);
}
