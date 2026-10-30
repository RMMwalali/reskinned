"use client";

// Check-in history lives only on this device (localStorage). No accounts and no
// server copy: the numbers and answers from each check-in, plus (in a separate
// store) small hairline thumbnails for the side-by-side progress view.

import { useSyncExternalStore } from "react";
import { demoHistory, type CheckIn } from "./edges";
import { planStore, thumbStore } from "./plan";
import { demoTreatment } from "./treatments";

const KEY = "edgewise.history.v1";
const listeners = new Set<() => void>();
let cache: CheckIn[] | null = null;
const EMPTY: CheckIn[] = [];

function read(): CheckIn[] {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(KEY);
    cache = raw ? (JSON.parse(raw) as CheckIn[]) : [];
  } catch {
    cache = [];
  }
  return cache;
}

function write(list: CheckIn[]) {
  cache = [...list].sort((a, b) => a.date.localeCompare(b.date));
  try {
    window.localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    // Private mode or storage blocked: keep it in memory for this visit.
  }
  listeners.forEach((l) => l());
}

export const history = {
  all: read,
  add(c: CheckIn) {
    write([...read(), c]);
  },
  remove(id: string) {
    write(read().filter((c) => c.id !== id));
    thumbStore.update((t) => {
      const { [id]: _gone, ...rest } = t;
      void _gone;
      return rest;
    });
  },
  clear() {
    write([]);
    thumbStore.set({});
    planStore.set(null);
  },
  /** Sample: seven months on minoxidil, an early dip, then regrowth. */
  loadTreatmentSample() {
    const d = demoTreatment();
    write([...read().filter((c) => !c.demo), ...d.list]);
    if (!planStore.get()) planStore.set(d.plan);
  },
  loadSample() {
    write([...read().filter((c) => !c.demo), ...demoHistory()]);
  },
  clearSample() {
    write(read().filter((c) => !c.demo));
  },
};

export function useHistory(): CheckIn[] {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    read,
    () => EMPTY,
  );
}
