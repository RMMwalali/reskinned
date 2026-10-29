"use client";

import { useEffect, useRef } from "react";
import { onScroll, progressOf } from "./store";
import { smoothstep } from "./keyframes";

// Small readouts that stay in sync with the 3D scene.

/** Scene 1: tension and thinning, as the hairline in 3D changes. */
export function TensionChip({ scene }: { scene: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const [tension, temples] = el.querySelectorAll<HTMLElement>("[data-v]");
    const dot = el.querySelector<HTMLElement>("i")!;
    const update = () => {
      const p = progressOf(scene);
      const pull = smoothstep(0.04, 0.28, p);
      const thin = smoothstep(0.26, 0.58, p);
      tension.textContent = pull < 0.3 ? "Low" : pull < 0.75 ? "Rising" : "High";
      temples.textContent = thin < 0.15 ? "Full" : thin < 0.6 ? "Thinning" : "Receding";
      dot.style.background = thin > 0.6 ? "var(--clash)" : pull > 0.3 ? "var(--amber)" : "var(--blend)";
    };
    update();
    return onScroll(update);
  }, [scene]);
  return (
    <div ref={ref} className="live-chip" aria-hidden="true">
      <i />
      <span>Tension <b data-v>Low</b></span>
      <span className="live-sep" />
      <span>Temples <b data-v>Full</b></span>
    </div>
  );
}

/** Scene 2: the two takes and the reading they agree on. */
export function ReadingChip({ scene }: { scene: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rows = el.querySelectorAll<HTMLElement>("[data-out]");
    const update = () => {
      const p = progressOf(scene);
      rows.forEach((r, i) => (r.dataset.on = String(p > 0.15 + i * 0.15)));
    };
    update();
    return onScroll(update);
  }, [scene]);
  return (
    <div ref={ref} className="measure-chip data" aria-hidden="true">
      <div data-out><span>Take 1 · density</span><b>2.33</b></div>
      <div data-out><span>Take 2 · density</span><b>2.29</b></div>
      <div data-out><span>Agreement</span><b>±0.04 · steady</b></div>
      <div data-out><span>Baseline set</span><b>2.31 / 3</b></div>
    </div>
  );
}
