"use client";

// The routine shop: what a partner brand would sell inside edge.wise.
// Every listing here is a SAMPLE (no real brand, no real payment). In a real
// deployment the partner supplies the catalogue and checkout.

import { createStore } from "./store";
import type { PlanItem, TreatmentId } from "./treatments";

export type Product = {
  id: string;
  name: string;
  detail: string;
  price: number; // USD
  /** Days one unit lasts, for "runs out in…" reminders. Null for one-off items. */
  supplyDays: number | null;
  for: TreatmentId[];
  /** How it's bought: cart, prescriber refill, or a clinic booking. */
  buy: "cart" | "refill" | "book";
};

export const PRODUCTS: Product[] = [
  { id: "minox-foam-5", name: "Minoxidil 5% foam", detail: "3-month supply · once daily", price: 44, supplyDays: 90, for: ["minoxidil-topical"], buy: "cart" },
  { id: "minox-sol-2", name: "Minoxidil 2% solution", detail: "3-month supply · twice daily", price: 36, supplyDays: 90, for: ["minoxidil-topical"], buy: "cart" },
  { id: "keto-1", name: "Ketoconazole 1% shampoo", detail: "200 ml · 2–3 times a week", price: 16, supplyDays: 60, for: ["ketoconazole", "minoxidil-topical", "finasteride"], buy: "cart" },
  { id: "rx-finasteride", name: "Finasteride 1 mg", detail: "Prescription · 90 tablets", price: 30, supplyDays: 90, for: ["finasteride"], buy: "refill" },
  { id: "rx-oral-minox", name: "Oral minoxidil", detail: "Prescription · 90 tablets", price: 27, supplyDays: 90, for: ["minoxidil-oral"], buy: "refill" },
  { id: "rx-spiro", name: "Spironolactone", detail: "Prescription · 90 tablets", price: 25, supplyDays: 90, for: ["spironolactone"], buy: "refill" },
  { id: "prp-session", name: "PRP session", detail: "Partner clinic · 45 min", price: 450, supplyDays: null, for: ["prp"], buy: "book" },
  { id: "microneedle-session", name: "Microneedling session", detail: "Partner clinic · 30 min", price: 180, supplyDays: null, for: ["microneedling"], buy: "book" },
  { id: "laser-cap", name: "Laser cap", detail: "Home device · 3 sessions a week", price: 399, supplyDays: null, for: ["laser"], buy: "cart" },
  { id: "gentle-moisturizer", name: "Fragrance-free moisturizer", detail: "For skin along the hairline · 100 ml", price: 14, supplyDays: 60, for: [], buy: "cart" },
  { id: "bond-repair", name: "Bond repair treatment", detail: "Weekly, for breakage · 100 ml", price: 24, supplyDays: 60, for: [], buy: "cart" },
  { id: "hair-fibers", name: "Hair-building fibers", detail: "Shade-matched · 45 days", price: 29, supplyDays: 45, for: [], buy: "cart" },
  { id: "topper", name: "Volumising topper", detail: "Clip-in, human hair", price: 189, supplyDays: null, for: [], buy: "cart" },
  { id: "fringe-cut", name: "Fringe cut", detail: "Partner stylist · 30 min", price: 45, supplyDays: null, for: [], buy: "book" },
  { id: "colour", name: "Root-blending colour", detail: "Partner stylist · 90 min", price: 90, supplyDays: null, for: [], buy: "book" },
  { id: "satin-bonnet", name: "Satin bonnet", detail: "Less friction at night", price: 18, supplyDays: null, for: ["gentler-styles", "minoxidil-topical"], buy: "cart" },
  { id: "glueless-cap", name: "Glueless wig grip band", detail: "Holds a wig without glue on the hairline", price: 14, supplyDays: null, for: ["gentler-styles"], buy: "cart" },
  { id: "soft-brush", name: "Soft edge brush", detail: "Lays edges without tugging", price: 9, supplyDays: null, for: ["gentler-styles"], buy: "cart" },
];

export const productById = (id: string) => PRODUCTS.find((p) => p.id === id)!;

export type Order = { id: string; date: string; lines: { id: string; qty: number }[]; total: number };

export const cartStore = createStore<Record<string, number>>("edgewise.cart.v1", {});
export const orderStore = createStore<Order[]>("edgewise.orders.v1", []);

/** Products that fit the plan, consumables first. */
export function productsFor(items: PlanItem[]): Product[] {
  const ids = new Set(items.map((i) => i.id));
  return PRODUCTS.filter((p) => p.for.some((f) => ids.has(f))).sort((a, b) => Number(b.supplyDays !== null) - Number(a.supplyDays !== null));
}

/** Days until a consumable runs out: from its last order, or from when the treatment started. */
export function daysLeft(p: Product, items: PlanItem[], orders: Order[], now = new Date()): number | null {
  if (!p.supplyDays) return null;
  const lastOrder = orders.filter((o) => o.lines.some((l) => l.id === p.id)).at(-1);
  const started = items.filter((i) => p.for.includes(i.id)).map((i) => i.start).sort()[0];
  const from = lastOrder?.date ?? started;
  if (!from) return null;
  const elapsed = (now.getTime() - new Date(from).getTime()) / 864e5;
  // Assume a fresh supply at each refill point since the start.
  const intoCycle = lastOrder ? elapsed : elapsed % p.supplyDays;
  return Math.round(p.supplyDays - intoCycle);
}

export const money = (n: number) => `$${n.toFixed(2)}`;
