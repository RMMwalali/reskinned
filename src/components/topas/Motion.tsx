"use client";

// Scroll choreography for the landing page (GSAP + ScrollTrigger + Lenis).
// Everything is opt-in through data attributes, so the page itself stays a
// server component and still reads fine with JavaScript or motion turned off.
//
//   data-intro     hero pieces that animate in on load (stagger by DOM order)
//   data-stripe    hero colour stripes that grow in
//   data-chars     text split into characters that rise in on load
//   data-split     heading whose words rise in when scrolled into view
//   data-pop="r"   element that drops in, tilted r degrees, when scrolled into view
//   data-marquee   endless strip (child [data-marquee-track] holds two copies); value = 1 | -1
//   data-steps     pinned "how it works" section with [data-step] items and [data-layer] pile
//   data-rail      pinned horizontal card rail ([data-track], [data-card], [data-ghost])
//   data-drift     row that slides sideways with scroll; value = direction

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";

export function Motion({ children, className }: { children: React.ReactNode; className?: string }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    gsap.registerPlugin(ScrollTrigger, SplitText);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    el.dataset.motion = "on";

    const lenis = new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const q = <T extends Element = HTMLElement>(s: string, scope: Element = el) => Array.from(scope.querySelectorAll<T & HTMLElement>(s));
    const cleanups: (() => void)[] = [];

    const ctx = gsap.context(() => {
      // ---- Hero intro
      const intro = gsap.timeline({ defaults: { ease: "power4.out" } });
      intro.from(q("[data-stripe]"), { scaleY: 0, duration: 1.1, stagger: 0.08, ease: "expo.inOut" });
      q("[data-chars]").forEach((t) => {
        const split = SplitText.create(t, { type: "chars", mask: "chars" });
        intro.from(split.chars, { yPercent: 115, rotate: 6, duration: 1, stagger: 0.045 }, 0.55);
      });
      intro.from(q("[data-intro]"), { y: 120, rotate: (i) => (i % 2 ? 10 : -10), opacity: 0, duration: 1.1, stagger: 0.12 }, 0.9);

      // Hero wordmark sinks as you leave the hero
      q("[data-hero]").forEach((hero) => {
        gsap.to(q("[data-hero-word]", hero), { yPercent: 30, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
      });

      // ---- Headings: words rise from behind a line mask
      q("[data-split]").forEach((h) => {
        const split = SplitText.create(h, { type: "lines,words", mask: "lines" });
        gsap.from(split.words, { yPercent: 110, duration: 0.9, stagger: 0.05, ease: "power4.out", scrollTrigger: { trigger: h, start: "top 85%" } });
      });

      // ---- Cards and stamps drop in with a tilt
      q("[data-pop]").forEach((p) => {
        const r = Number(p.dataset.pop || -6);
        gsap.from(p, { y: 90, rotate: r, opacity: 0, duration: 1, ease: "back.out(1.4)", scrollTrigger: { trigger: p, start: "top 90%" } });
      });

      // ---- Marquees: endless, and they speed up with scroll velocity
      q("[data-marquee]").forEach((m) => {
        const track = m.querySelector<HTMLElement>("[data-marquee-track]");
        if (!track) return;
        const dir = Number(m.dataset.marquee || 1);
        const loop = gsap.fromTo(track, { xPercent: dir > 0 ? 0 : -50 }, { xPercent: dir > 0 ? -50 : 0, duration: 28, ease: "none", repeat: -1 });
        ScrollTrigger.create({
          trigger: m,
          start: "top bottom",
          end: "bottom top",
          onUpdate: (self) => {
            const boost = 1 + Math.min(4, Math.abs(self.getVelocity()) / 400);
            gsap.to(loop, { timeScale: boost, duration: 0.2, overwrite: true, onComplete: () => void gsap.to(loop, { timeScale: 1, duration: 1.2 }) });
          },
        });
      });

      // ---- Rows of words drift sideways
      q("[data-drift]").forEach((row) => {
        const dir = Number(row.dataset.drift || 1);
        gsap.fromTo(row, { xPercent: -12 * dir }, { xPercent: 12 * dir, ease: "none", scrollTrigger: { trigger: row, start: "top bottom", end: "bottom top", scrub: true } });
      });

      // ---- How it works: pinned, each step drops a new layer on the pile
      q("[data-steps]").forEach((sec) => {
        const stage = sec.querySelector<HTMLElement>("[data-steps-stage]") ?? sec;
        const steps = q("[data-step]", sec);
        const layers = q("[data-layer]", sec);
        const n = steps.length;
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        layers.forEach((layer, i) => {
          if (i === 0) return;
          tl.from(layer, { y: -window.innerHeight * 0.7, rotate: i % 2 ? 18 : -18, opacity: 0, duration: 0.6 }, i - 0.6);
        });
        tl.to({}, { duration: Math.max(0.01, n - tl.duration()) });
        sec.dataset.active = "0";
        ScrollTrigger.create({
          trigger: sec,
          start: "top top",
          end: () => `+=${window.innerHeight * n * 0.9}`,
          pin: stage,
          scrub: 0.6,
          animation: tl,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            sec.dataset.active = String(Math.min(n - 1, Math.floor(self.progress * n * 0.999)));
          },
        });
      });

      // ---- The card rail: vertical scroll drives a sideways track; cards tilt
      // and shrink the further they are from the centre of the screen.
      q("[data-rail]").forEach((sec) => {
        const track = sec.querySelector<HTMLElement>("[data-track]");
        if (!track) return;
        const cards = q("[data-card]", sec);
        const ghost = sec.querySelector<HTMLElement>("[data-ghost]");
        const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
        const tl = gsap.timeline();
        tl.to(track, { x: () => -distance(), ease: "none" }, 0);
        if (ghost) tl.to(ghost, { xPercent: -25, ease: "none" }, 0);
        const st = ScrollTrigger.create({
          trigger: sec,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.8,
          animation: tl,
          invalidateOnRefresh: true,
        });
        const setters = cards.map((c) => ({
          el: c,
          rot: gsap.quickSetter(c, "rotate", "deg"),
          scale: gsap.quickSetter(c, "scale"),
          side: c.dataset.card === "odd" ? -1 : 1,
        }));
        const tilt = () => {
          if (!st.isActive && !ScrollTrigger.isInViewport(sec)) return;
          const mid = window.innerWidth / 2;
          for (const s of setters) {
            const r = s.el.getBoundingClientRect();
            const d = gsap.utils.clamp(-1.2, 1.2, (r.left + r.width / 2 - mid) / mid);
            s.rot(d * 9 + s.side * 1.2);
            s.scale(1 - Math.min(1, Math.abs(d)) * 0.2);
          }
        };
        gsap.ticker.add(tilt);
        cleanups.push(() => gsap.ticker.remove(tilt));
      });
    }, el);

    // Fonts change line breaks and widths; measure again once they're in.
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => {
      cleanups.forEach((f) => f());
      ctx.revert();
      gsap.ticker.remove(tick);
      lenis.destroy();
      delete el.dataset.motion;
    };
  }, []);

  return (
    <div ref={root} className={className} data-fullbleed>
      {children}
    </div>
  );
}
