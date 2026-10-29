"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./cinema.module.css";

const MODES = {
  me: { tab: "For me", badge: "Free", text: "Two hairline photos, about two minutes", href: "/check", cta: "Check my edges" },
  stylist: { tab: "I'm a stylist", badge: null, text: "Ask clients for their card before you book", href: "/card/demo", cta: "See a stylist card" },
} as const;

export function HeroPill({ demoCard }: { demoCard: string }) {
  const [mode, setMode] = useState<keyof typeof MODES>("me");
  const m = MODES[mode];
  const href = mode === "stylist" ? `/card/${demoCard}` : m.href;
  return (
    <div className={styles.pill}>
      <div className={styles.pillTabs} role="tablist" aria-label="Who is this for?">
        {(Object.keys(MODES) as (keyof typeof MODES)[]).map((k) => (
          <button key={k} role="tab" aria-selected={mode === k} className={styles.pillTab} onClick={() => setMode(k)}>
            {MODES[k].tab}
            {MODES[k].badge ? <span className={styles.pillBadge}>{MODES[k].badge}</span> : null}
          </button>
        ))}
      </div>
      <Link href={href} className={styles.pillField}>
        <span className={styles.pillIcon} aria-hidden="true">
          {mode === "me" ? (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
              <circle cx="12" cy="13" r="3.5" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="5" width="16" height="14" rx="3" />
              <path d="M8 10h8M8 14h5" />
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
