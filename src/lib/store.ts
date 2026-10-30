"use client";

// Tiny localStorage-backed stores. Everything stays on this device.

import { useSyncExternalStore } from "react";

export function createStore<T>(key: string, fallback: T) {
  const listeners = new Set<() => void>();
  let cache: T | undefined;
  const get = (): T => {
    if (cache !== undefined) return cache;
    try {
      const raw = window.localStorage.getItem(key);
      cache = raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      cache = fallback;
    }
    return cache;
  };
  const set = (v: T) => {
    cache = v;
    try {
      window.localStorage.setItem(key, JSON.stringify(v));
    } catch {
      // Storage full or blocked: keep it in memory for this visit.
    }
    listeners.forEach((l) => l());
  };
  const subscribe = (l: () => void) => {
    listeners.add(l);
    return () => void listeners.delete(l);
  };
  const use = () => useSyncExternalStore(subscribe, get, () => fallback);
  return { get, set, use, update: (f: (v: T) => T) => set(f(get())) };
}
