"use client";

// Check-in history lives only on this device (localStorage). No accounts, no
// server copy, no photos — just the numbers and answers from each check-in.

import { useSyncExternalStore } from "react";
import { demoHistory, type CheckIn } from "./edges";

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
  },
  clear() {
    write([]);
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
