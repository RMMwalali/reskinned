"use client";

// Browser-side photo preparation. Runs on the person's phone: photos are
// resized and light-checked before anything is uploaded.

export type Prepared = {
  blob: Blob; // JPEG, same size for every angle (YouCam Hair Type needs that)
  url: string; // object URL for preview
  width: number;
  height: number;
  light: LightCheck;
};

export type LightCheck = { ok: boolean; level: "dark" | "bright" | "good"; message: string };

// 768 × 1024 portrait fits every YouCam hair API limit (long side ≤ 1024, JPEG).
export const TARGET_W = 768;
export const TARGET_H = 1024;

/** Cover-crop to TARGET_W × TARGET_H, biased toward the top so the hairline stays in frame. */
export async function prepareImage(file: Blob): Promise<Prepared> {
  const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
  const canvas = document.createElement("canvas");
  canvas.width = TARGET_W;
  canvas.height = TARGET_H;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  const scale = Math.max(TARGET_W / bmp.width, TARGET_H / bmp.height);
  const w = bmp.width * scale;
  const h = bmp.height * scale;
  ctx.drawImage(bmp, (TARGET_W - w) / 2, Math.min(0, (TARGET_H - h) * 0.3), w, h);
  bmp.close();
  const light = checkLight(ctx);
  const blob: Blob = await new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error("encode failed"))), "image/jpeg", 0.9));
  return { blob, url: URL.createObjectURL(blob), width: TARGET_W, height: TARGET_H, light };
}

/** Relative luminance of the centre of the frame: too dark or blown out? */
export function checkLight(ctx: CanvasRenderingContext2D): LightCheck {
  const { width, height } = ctx.canvas;
  const data = ctx.getImageData(Math.floor(width * 0.2), Math.floor(height * 0.1), Math.floor(width * 0.6), Math.floor(height * 0.6)).data;
  const lin = (c: number) => {
    const v = c / 255;
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  let sum = 0;
  let n = 0;
  for (let i = 0; i < data.length; i += 16) {
    sum += 0.2126 * lin(data[i]) + 0.7152 * lin(data[i + 1]) + 0.0722 * lin(data[i + 2]);
    n++;
  }
  const Y = sum / n;
  const L = Y > 216 / 24389 ? 116 * Math.cbrt(Y) - 16 : (24389 / 27) * Y;
  if (L < 28) return { ok: false, level: "dark", message: "Too dark to read your hairline. Face a window or step into daylight." };
  if (L > 85) return { ok: false, level: "bright", message: "Very bright. Glare hides fine hairs, so try softer light." };
  return { ok: true, level: "good", message: "Light looks even." };
}
