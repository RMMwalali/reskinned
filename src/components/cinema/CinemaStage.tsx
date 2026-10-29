"use client";

import { Component, useEffect, type ReactNode } from "react";
import dynamic from "next/dynamic";
import Lenis from "lenis";
import { cinema, emitScroll } from "./store";

// WebGL only exists in the browser, so the scene is never prerendered.
const Scene = dynamic(() => import("./Scene"), { ssr: false });

/** If WebGL is unavailable or crashes, the page still reads fine without 3D. */
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function measure() {
  const sections = document.querySelectorAll<HTMLElement>("[data-scene]");
  const mid = window.innerHeight * 0.5;
  for (const s of sections) {
    const r = s.getBoundingClientRect();
    if (r.top <= mid && r.bottom > mid) {
      cinema.index = Number(s.dataset.scene);
      cinema.local = Math.min(1, Math.max(0, (mid - r.top) / r.height));
      emitScroll();
      return;
    }
  }
  // Above the first scene: hold the hero. Below the last: hold the finale.
  const first = sections[0]?.getBoundingClientRect();
  if (first && first.top > mid) {
    cinema.index = 0;
    cinema.local = 0;
  } else if (sections.length) {
    cinema.index = Number(sections[sections.length - 1].dataset.scene);
    cinema.local = 1;
  }
  emitScroll();
}

export function CinemaStage() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    cinema.reducedMotion = reduce.matches;

    let lenis: Lenis | null = null;
    if (!reduce.matches) {
      lenis = new Lenis({ autoRaf: true, lerp: 0.09, wheelMultiplier: 0.9 });
      lenis.on("scroll", measure);
    }
    const onNative = () => measure();
    window.addEventListener("scroll", onNative, { passive: true });
    window.addEventListener("resize", onNative);

    const onPointer = (e: PointerEvent) => {
      cinema.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      cinema.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    measure();

    return () => {
      lenis?.destroy();
      window.removeEventListener("scroll", onNative);
      window.removeEventListener("resize", onNative);
      window.removeEventListener("pointermove", onPointer);
      cinema.index = 0;
      cinema.local = 0;
    };
  }, []);

  return (
    <div className="stage-3d" aria-hidden="true">
      <SceneBoundary>
        <Scene />
      </SceneBoundary>
    </div>
  );
}
