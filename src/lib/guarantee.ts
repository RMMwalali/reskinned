// Results-guarantee evidence. Some hair-loss brands refund customers who see
// no growth after six months, but only with standardized progress photos taken
// in set windows, graded by hand. edge.wise collects those photos as part of
// the monthly check-in and shows which windows are done.
// Default windows (days from first order) follow a published US guarantee:
// days 1–37, 97–127 and 187–217.

import type { CheckIn } from "./edges";

export const GUARANTEE_WINDOWS: [number, number][] = [
  [1, 37],
  [97, 127],
  [187, 217],
];

export type WindowState = "done" | "open" | "upcoming" | "missed";
export type GuaranteeWindow = { from: number; to: number; state: WindowState; checkIn?: string; opens: string; closes: string };

const DAY = 864e5;

export function guaranteeWindows(list: CheckIn[], start: string, now = new Date()): GuaranteeWindow[] {
  const t0 = new Date(start).getTime();
  const today = (now.getTime() - t0) / DAY;
  return GUARANTEE_WINDOWS.map(([from, to]) => {
    const hit = list.find((c) => {
      const d = (new Date(c.date).getTime() - t0) / DAY;
      return d >= from - 1 && d <= to;
    });
    const state: WindowState = hit ? "done" : today < from - 1 ? "upcoming" : today <= to ? "open" : "missed";
    return { from, to, state, checkIn: hit?.id, opens: new Date(t0 + (from - 1) * DAY).toISOString(), closes: new Date(t0 + to * DAY).toISOString() };
  });
}

/** Ready to claim once every window has a check-in. */
export const claimReady = (w: GuaranteeWindow[]) => w.every((x) => x.state === "done");
