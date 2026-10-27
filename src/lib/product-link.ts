// Vendor "Will it blend?" links carry the product in the URL itself, so there
// is no database and no shopper data stored anywhere. Photos never go in links.

import { TEXTURES, type Product, type Texture } from "./match";

type Compact = { n: string; v: string; c: string; h?: string; t: number; i?: number; p?: number; w?: string };

function toB64Url(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64Url(s: string): string {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
  const bin = atob(b64);
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

export function encodeProduct(p: Product): string {
  const c: Compact = { n: p.name, v: p.vendor, c: p.code, t: TEXTURES.indexOf(p.texture) };
  if (p.measuredHex) c.h = p.measuredHex.replace("#", "");
  if (p.inches) c.i = p.inches;
  if (p.priceKes) c.p = p.priceKes;
  if (p.whatsapp) c.w = p.whatsapp;
  return toB64Url(JSON.stringify(c));
}

export function decodeProduct(token: string): Product | null {
  try {
    const c = JSON.parse(fromB64Url(token)) as Compact;
    const texture = TEXTURES[c.t] as Texture | undefined;
    if (!c.n || !c.c || !texture) return null;
    return {
      name: String(c.n).slice(0, 80),
      vendor: String(c.v ?? "").slice(0, 60),
      code: String(c.c).slice(0, 6),
      measuredHex: c.h && /^[0-9a-f]{6}$/i.test(c.h) ? `#${c.h.toUpperCase()}` : undefined,
      texture,
      inches: c.i ? Number(c.i) : undefined,
      priceKes: c.p ? Number(c.p) : undefined,
      whatsapp: c.w && /^\d{8,15}$/.test(c.w) ? c.w : undefined,
    };
  } catch {
    return null;
  }
}
