"use client";

import { useEffect, useRef } from "react";
import { findCode } from "@/lib/codes";
import { onScroll, progressOf } from "./store";
import { smoothstep } from "./keyframes";

// Small live readouts that stay in sync with the 3D scene.

const CYCLE = ["1", "1B", "2", "4", "30", "27"];
const TEXTURE_AT = (curl: number) =>
  curl < 0.15 ? "Silky straight" : curl < 0.35 ? "Body wave" : curl < 0.55 ? "Deep wave" : curl < 0.75 ? "Kinky curly" : "Afro kinky · 4C";

/** Scene 1: the code and texture the hair bundle is showing right now. */
export function BundleChip({ scene }: { scene: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const swatch = el.querySelector<HTMLElement>("i")!;
    const code = el.querySelector<HTMLElement>("[data-code]")!;
    const tex = el.querySelector<HTMLElement>("[data-tex]")!;
    const update = () => {
      const p = progressOf(scene);
      const c = findCode(CYCLE[Math.min(CYCLE.length - 1, Math.floor(p * CYCLE.length * 1.05))])!;
      swatch.style.background = c.hex;
      code.textContent = `${c.code} · ${c.name}`;
      tex.textContent = TEXTURE_AT(smoothstep(0.1, 0.82, p));
    };
    update();
    return onScroll(update);
  }, [scene]);
  return (
    <div ref={ref} className="live-chip" aria-hidden="true">
      <i />
      <span data-code />
      <span className="live-sep" />
      <span data-tex />
    </div>
  );
}

/** Scene 3: the measurement filling in as the orb fills. */
export function MeasureChip({ scene }: { scene: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const px = el.querySelector<HTMLElement>("[data-px]")!;
    const outs = el.querySelectorAll<HTMLElement>("[data-out]");
    const update = () => {
      const p = smoothstep(0.05, 0.6, progressOf(scene));
      px.textContent = String(Math.round(412 * p));
      outs.forEach((o) => (o.dataset.on = String(p > 0.95)));
    };
    update();
    return onScroll(update);
  }, [scene]);
  return (
    <div ref={ref} className="measure-chip data" aria-hidden="true">
      <div><span>Pixels read</span><b data-px>0</b></div>
      <div><span>Shine &amp; shadow dropped</span><b>40%</b></div>
      <div data-out><span>Your colour</span><b><i style={{ background: "#271D18" }} />#271D18</b></div>
      <div data-out><span>Closest code</span><b>1B · ΔE 1.6</b></div>
    </div>
  );
}
