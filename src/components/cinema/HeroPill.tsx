"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./cinema.module.css";

const MODES = {
  shop: { tab: "Find my match", badge: "Free", text: "Three photos, about 40 seconds", href: "/scan", cta: "Scan my hair" },
  sell: { tab: "I sell hair", badge: null, text: "Make a blend link for any bundle", href: "/vendors", cta: "Make a blend link" },
} as const;

export function HeroPill() {
  const [mode, setMode] = useState<keyof typeof MODES>("shop");
  const m = MODES[mode];
  return (
    <div className={styles.pill}>
      <div className={styles.pillTabs} role="tablist" aria-label="Who are you?">
        {(Object.keys(MODES) as (keyof typeof MODES)[]).map((k) => (
          <button key={k} role="tab" aria-selected={mode === k} className={styles.pillTab} onClick={() => setMode(k)}>
            {MODES[k].tab}
            {MODES[k].badge ? <span className={styles.pillBadge}>{MODES[k].badge}</span> : null}
          </button>
        ))}
      </div>
      <Link href={m.href} className={styles.pillField}>
        <span className={styles.pillIcon} aria-hidden="true">
          {mode === "shop" ? (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
              <circle cx="12" cy="13" r="3.5" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
              <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
            </svg>
          )}
        </span>
        <span className={styles.pillText}>{m.text}</span>
        <span className={styles.pillGo}>
          <span className="sr-only">{m.cta}</span>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </span>
      </Link>
    </div>
  );
}
