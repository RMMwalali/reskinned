"use client";

import { useEffect, useRef, useState } from "react";
import { findCode } from "@/lib/codes";
import type { MatchResult, Product } from "@/lib/match";
import { HairBundle } from "./HairBundle";
import { ScanFlow } from "./ScanFlow";
import { ShadeGrid } from "./ShadeGrid";
import { Faq } from "./Faq";
import styles from "./ProductPage.module.css";

type View = "bundle" | "close" | "compare";

export function ProductPage({ product }: { product: Product }) {
  const code = findCode(product.code);
  const hex = product.measuredHex ?? code?.hex ?? "#221A16";
  const [view, setView] = useState<View>("bundle");
  const [match, setMatch] = useState<MatchResult | null>(null);
  const [showBar, setShowBar] = useState(false);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const scanRef = useRef<HTMLElement>(null);

  // Sticky buy bar: show once the main button has scrolled out of view,
  // hide while the scan itself is on screen.
  useEffect(() => {
    const cta = ctaRef.current;
    const scan = scanRef.current;
    if (!cta || !scan) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const ctaGone = cta.getBoundingClientRect().bottom < 0;
      const s = scan.getBoundingClientRect();
      const mid = window.innerHeight / 2;
      const scanOnScreen = s.top < mid && s.bottom > mid; // the scan crosses the middle of the screen
      setShowBar(ctaGone && !scanOnScreen);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const goScan = () => scanRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  const price = product.priceKes ? `KES ${product.priceKes.toLocaleString("en-KE")}` : null;
  const views: { key: View; label: string }[] = [
    { key: "bundle", label: "Bundle" },
    { key: "close", label: "Colour close-up" },
    { key: "compare", label: "Next to your hair" },
  ];

  return (
    <>
      <section className={styles.pdp}>
        <div className={styles.gallery}>
          <div className={styles.stage}>
            <span className={`tag ${styles.stageTag}`}>{product.measuredHex ? "Colour measured" : "Blend link"}</span>
            {view === "bundle" && <HairBundle hex={hex} texture={product.texture} />}
            {view === "close" && (
              <div className={styles.close}>
                <div className={styles.closeSwatch} style={{ background: hex }} />
                <p className="data">
                  {product.code} · {hex}
                  <br />
                  {product.measuredHex ? "Measured from the vendor's photo" : `Rangi's reference for code ${product.code}`}
                </p>
              </div>
            )}
            {view === "compare" && (
              <div className={styles.compare}>
                <figure>
                  <div style={{ background: match?.colour.sampleHex ?? "transparent" }} className={match ? "" : styles.empty}>
                    {match ? null : <span>Scan to see your hair here</span>}
                  </div>
                  <figcaption className="data">Your hair{match ? ` · ${match.colour.sampleHex}` : ""}</figcaption>
                </figure>
                <figure>
                  <div style={{ background: hex }} />
                  <figcaption className="data">This bundle · {hex}</figcaption>
                </figure>
              </div>
            )}
          </div>
          <div className={styles.thumbs} role="tablist" aria-label="Product views">
            {views.map((v) => (
              <button
                key={v.key}
                role="tab"
                aria-selected={view === v.key}
                className={styles.thumb}
                onClick={() => setView(v.key)}
              >
                <span className={styles.thumbArt} aria-hidden="true">
                  {v.key === "bundle" ? <HairBundle hex={hex} texture={product.texture} label="" /> : null}
                  {v.key === "close" ? <i style={{ background: hex }} /> : null}
                  {v.key === "compare" ? (
                    <>
                      <i style={{ background: match?.colour.sampleHex ?? "var(--cream-2)" }} />
                      <i style={{ background: hex }} />
                    </>
                  ) : null}
                </span>
                <span className={styles.thumbLabel}>{v.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.info}>
          <div className={styles.titleRow}>
            <h1>{product.name}</h1>
            {price ? <p className={`data ${styles.price}`}>{price}</p> : null}
          </div>
          {product.vendor ? <p className={styles.vendor}>Sold by {product.vendor}</p> : null}
          <p className={styles.desc}>
            {product.inches ? `${product.inches}" ` : ""}
            {product.texture.toLowerCase()} hair in {product.code}
            {code ? ` (${code.name.toLowerCase()})` : ""}. Before you pay, scan your hair to check this bundle blends with your leave-out, colour and texture.
          </p>

          <div className={styles.field}>
            <div className={styles.fieldHead}>
              <p className="label">Colour</p>
              <button type="button" className={styles.quiz} onClick={goScan}>
                Not sure? <u>Scan your hair</u>
              </button>
            </div>
            <div className={styles.picked}>
              <i style={{ background: hex }} aria-hidden="true" />
              <span>
                <strong className="data">{product.code}</strong> {code?.name}
              </span>
              <span className="tag">{product.measuredHex ? "Measured" : "Code reference"}</span>
            </div>
            <ShadeGrid selected={product.code} available={[product.code]} match={match?.colour.best.code} caption="Colour codes in this listing" />
            {match ? (
              <p className={styles.matchNote}>
                <span className={styles.dot} aria-hidden="true" /> Your match is <strong>{match.colour.best.code}</strong>
                {match.colour.best.code === product.code ? ", the same code as this bundle." : `. This bundle is ${product.code}.`}
              </p>
            ) : null}
          </div>

          <div className={styles.field}>
            <p className="label">Texture</p>
            <div className={styles.pills}>
              <span className={styles.pillOn}>{product.texture}</span>
              {match?.texture && match.texture.primary !== product.texture ? (
                <span className={styles.pill}>Your match: {match.texture.primary}</span>
              ) : null}
            </div>
          </div>

          {product.inches ? (
            <div className={styles.field}>
              <p className="label">Length</p>
              <div className={styles.pills}>
                <span className={styles.pillOn}>{product.inches}&quot;</span>
              </div>
            </div>
          ) : null}

          <button ref={ctaRef} type="button" className={`btn btn-primary ${styles.cta}`} onClick={goScan}>
            {match ? "See my blend result" : "Check it blends with my hair"}
          </button>
          <ul className={styles.trust}>
            <li>Takes about 40 seconds</li>
            <li>Photos never stored</li>
            <li>Built for 4C to straight</li>
          </ul>
        </div>
      </section>

      <section className={styles.band}>
        <div className="wrap">
          <h2>Your leave-out decides. Not the label.</h2>
          <p>Hair codes vary between factories. Rangi compares this bundle&rsquo;s colour with your own hair, measured on you.</p>
          <button type="button" className="btn btn-primary" onClick={goScan}>Find my match</button>
        </div>
      </section>

      <section ref={scanRef} id="scan" className={`wrap ${styles.scan}`} aria-labelledby="scan-title">
        <h2 id="scan-title">Will it blend?</h2>
        <ScanFlow product={product} onResult={setMatch} />
      </section>

      <section className={`wrap ${styles.faqWrap}`}>
        <Faq />
      </section>

      <div className={`${styles.bar} ${showBar ? styles.barOn : ""}`} aria-hidden={!showBar}>
        <div className={`wrap ${styles.barInner}`}>
          <i style={{ background: hex }} aria-hidden="true" />
          <div className={styles.barText}>
            <p className={styles.barName}>{product.name}</p>
            <p className="data">{product.code} · {product.texture}</p>
          </div>
          <button type="button" className="btn btn-primary" onClick={goScan} tabIndex={showBar ? 0 : -1}>
            Check my blend{price ? ` — ${price}` : ""}
          </button>
        </div>
      </div>
    </>
  );
}
