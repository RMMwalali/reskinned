"use client";

import { useEffect, useRef } from "react";
import { onScroll, progressOf } from "./store";

// A paragraph whose words light up one by one as its scene scrolls past.
// Text wrapped in [[double brackets]] gets a marker highlight once lit.

export function ScrollWords({ text, scene, from = 0.08, to = 0.7, className }: { text: string; scene: number; from?: number; to?: number; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const words = Array.from(el.querySelectorAll<HTMLSpanElement>("[data-w]"));
    const update = () => {
      const p = Math.min(1, Math.max(0, (progressOf(scene) - from) / (to - from)));
      const lit = p * words.length;
      words.forEach((w, i) => {
        const on = i < lit;
        if (w.dataset.on !== String(on)) w.dataset.on = String(on);
      });
    };
    update();
    return onScroll(update);
  }, [scene, from, to]);

  // Split into words, remembering which ones are inside [[...]].
  const tokens: { w: string; mark: boolean }[] = [];
  let mark = false;
  for (const raw of text.split(/\s+/)) {
    let w = raw;
    const opens = w.startsWith("[[");
    if (opens) {
      mark = true;
      w = w.slice(2);
    }
    const closes = w.endsWith("]]");
    if (closes) w = w.slice(0, -2);
    tokens.push({ w, mark });
    if (closes) mark = false;
  }

  return (
    <p ref={ref} className={`scroll-words ${className ?? ""}`}>
      {tokens.map((t, i) => (
        <span key={i} data-w="" data-on="false" className={t.mark ? "mark-word" : undefined}>
          {t.w}{" "}
        </span>
      ))}
    </p>
  );
}
