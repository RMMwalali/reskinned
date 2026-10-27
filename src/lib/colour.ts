// Colour science used by Rangi. Pure functions, no dependencies, unit-tested.
// sRGB (D65) -> CIE XYZ -> CIELAB, and CIEDE2000 colour difference.

export type RGB = { r: number; g: number; b: number }; // 0..255
export type Lab = { L: number; a: number; b: number };

export function hexToRgb(hex: string): RGB {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) throw new Error(`Invalid hex colour: ${hex}`);
  const n = parseInt(m[1], 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function rgbToHex({ r, g, b }: RGB): string {
  const h = (v: number) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`.toUpperCase();
}

function srgbToLinear(c: number): number {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

export function rgbToLab({ r, g, b }: RGB): Lab {
  const R = srgbToLinear(r);
  const G = srgbToLinear(g);
  const B = srgbToLinear(b);
  // D65 reference white
  const X = (0.4124564 * R + 0.3575761 * G + 0.1804375 * B) / 0.95047;
  const Y = 0.2126729 * R + 0.7151522 * G + 0.072175 * B;
  const Z = (0.0193339 * R + 0.119192 * G + 0.9503041 * B) / 1.08883;
  const f = (t: number) => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116);
  const fx = f(X);
  const fy = f(Y);
  const fz = f(Z);
  return { L: 116 * fy - 16, a: 500 * (fx - fy), b: 200 * (fy - fz) };
}

export function hexToLab(hex: string): Lab {
  return rgbToLab(hexToRgb(hex));
}

const deg = (rad: number) => (rad * 180) / Math.PI;
const rad = (d: number) => (d * Math.PI) / 180;

/** CIEDE2000 (Sharma, Wu & Dalal 2005), kL = kC = kH = 1. */
export function deltaE2000(x: Lab, y: Lab): number {
  const C1 = Math.hypot(x.a, x.b);
  const C2 = Math.hypot(y.a, y.b);
  const Cbar = (C1 + C2) / 2;
  const G = 0.5 * (1 - Math.sqrt(Cbar ** 7 / (Cbar ** 7 + 25 ** 7)));
  const a1 = (1 + G) * x.a;
  const a2 = (1 + G) * y.a;
  const C1p = Math.hypot(a1, x.b);
  const C2p = Math.hypot(a2, y.b);
  const h = (b: number, a: number) => {
    if (a === 0 && b === 0) return 0;
    const v = deg(Math.atan2(b, a));
    return v >= 0 ? v : v + 360;
  };
  const h1p = h(x.b, a1);
  const h2p = h(y.b, a2);

  const dLp = y.L - x.L;
  const dCp = C2p - C1p;
  let dhp = 0;
  if (C1p * C2p !== 0) {
    dhp = h2p - h1p;
    if (dhp > 180) dhp -= 360;
    else if (dhp < -180) dhp += 360;
  }
  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin(rad(dhp / 2));

  const Lbp = (x.L + y.L) / 2;
  const Cbp = (C1p + C2p) / 2;
  let hbp = h1p + h2p;
  if (C1p * C2p !== 0) {
    if (Math.abs(h1p - h2p) > 180) hbp += h1p + h2p < 360 ? 360 : -360;
    hbp /= 2;
  }
  const T =
    1 -
    0.17 * Math.cos(rad(hbp - 30)) +
    0.24 * Math.cos(rad(2 * hbp)) +
    0.32 * Math.cos(rad(3 * hbp + 6)) -
    0.2 * Math.cos(rad(4 * hbp - 63));
  const dTheta = 30 * Math.exp(-(((hbp - 275) / 25) ** 2));
  const Rc = 2 * Math.sqrt(Cbp ** 7 / (Cbp ** 7 + 25 ** 7));
  const Sl = 1 + (0.015 * (Lbp - 50) ** 2) / Math.sqrt(20 + (Lbp - 50) ** 2);
  const Sc = 1 + 0.045 * Cbp;
  const Sh = 1 + 0.015 * Cbp * T;
  const Rt = -Math.sin(rad(2 * dTheta)) * Rc;
  return Math.sqrt(
    (dLp / Sl) ** 2 + (dCp / Sc) ** 2 + (dHp / Sh) ** 2 + Rt * (dCp / Sc) * (dHp / Sh),
  );
}

/**
 * Robust average of sampled hair pixels. Hair photographs with specular
 * highlights (shine) and deep shadow, so we drop the brightest and darkest
 * 20% by lightness and average the rest in linear light.
 */
export function robustHairColour(pixels: RGB[]): { hex: string; spread: number; n: number } {
  if (pixels.length === 0) throw new Error("No pixels sampled");
  const withL = pixels.map((p) => ({ p, L: rgbToLab(p).L })).sort((a, b) => a.L - b.L);
  const lo = Math.floor(withL.length * 0.2);
  const hi = Math.max(lo + 1, Math.ceil(withL.length * 0.8));
  const kept = withL.slice(lo, hi);
  const lin = kept.reduce(
    (acc, { p }) => ({
      r: acc.r + srgbToLinear(p.r),
      g: acc.g + srgbToLinear(p.g),
      b: acc.b + srgbToLinear(p.b),
    }),
    { r: 0, g: 0, b: 0 },
  );
  const toS = (v: number) => {
    const c = v / kept.length;
    return 255 * (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);
  };
  const mean = { r: toS(lin.r), g: toS(lin.g), b: toS(lin.b) };
  const meanLab = rgbToLab(mean);
  // Spread = mean ΔE of kept pixels from the mean: how uniform the sample is.
  const spread = kept.reduce((s, { p }) => s + deltaE2000(rgbToLab(p), meanLab), 0) / kept.length;
  return { hex: rgbToHex(mean), spread, n: kept.length };
}
