"use client";

import { useState } from "react";
import { findCode } from "@/lib/codes";
import type { Prepared } from "@/lib/image-client";
import type { MatchResult, Product } from "@/lib/match";
import styles from "./TryOn.module.css";

type Option = { key: string; label: string; hex: string; code: string };
type State = { status: "idle" } | { status: "loading"; key: string } | { status: "done"; key: string; url: string } | { status: "note"; message: string };

export function TryOn({ photo, match, product }: { photo: Prepared; match: MatchResult; product?: Product }) {
  const options: Option[] = [
    { key: "best", label: `${match.colour.best.code} · your match`, hex: match.colour.best.hex, code: match.colour.best.code },
    { key: "runner", label: `${match.colour.runnerUp.code} · next closest`, hex: match.colour.runnerUp.hex, code: match.colour.runnerUp.code },
  ];
  if (product) {
    options.unshift({
      key: "product",
      label: `${product.code} · ${product.name}`,
      hex: product.measuredHex ?? findCode(product.code)?.hex ?? match.colour.best.hex,
      code: product.code,
    });
  }
  const [state, setState] = useState<State>({ status: "idle" });
  const [results, setResults] = useState<Record<string, string>>({});

  async function run(o: Option) {
    if (results[o.key]) {
      setState({ status: "done", key: o.key, url: results[o.key] });
      return;
    }
    setState({ status: "loading", key: o.key });
    const fd = new FormData();
    fd.set("photo", photo.blob, "front.jpg");
    fd.set("hex", o.hex);
    fd.set("code", o.code);
    try {
      const res = await fetch("/api/tryon", { method: "POST", body: fd });
      const json = await res.json();
      if (json.mode === "demo") return setState({ status: "note", message: `${json.demoReason} The colour try-on uses YouCam Hair Color and appears here when the API is live.` });
      if (!res.ok || !json.url) return setState({ status: "note", message: json.error ?? "Try-on failed. Please try again." });
      setResults((r) => ({ ...r, [o.key]: json.url }));
      setState({ status: "done", key: o.key, url: json.url });
    } catch {
      setState({ status: "note", message: "Try-on failed. Check your connection and try again." });
    }
  }

  const active = state.status === "done" || state.status === "loading" ? state.key : null;

  return (
    <section className={styles.tryon} aria-labelledby="tryon-title">
      <h2 id="tryon-title">See it on you</h2>
      <p className={styles.sub}>YouCam paints the code&rsquo;s colour onto your own hair. Compare the colour where your hair meets your face. That&rsquo;s where a leave-out shows.</p>
      <div className={styles.options} role="group" aria-label="Choose a colour to try on">
        {options.map((o) => (
          <button key={o.key} className={styles.option} aria-pressed={active === o.key} onClick={() => run(o)} disabled={state.status === "loading"}>
            <i style={{ background: o.hex }} aria-hidden="true" />
            <span className="data">{o.label}</span>
          </button>
        ))}
      </div>
      <div className={styles.compare}>
        <figure>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo.url} alt="Your photo, original" />
          <figcaption>Original</figcaption>
        </figure>
        <figure aria-live="polite">
          {state.status === "done" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={state.url} alt="Your photo with the chosen colour applied" />
          ) : (
            <div className={styles.placeholder}>
              {state.status === "loading" ? <span className={styles.spinner} aria-label="Rendering try-on" /> : state.status === "note" ? <p>{state.message}</p> : <p>Pick a colour above.</p>}
            </div>
          )}
          <figcaption>{state.status === "done" ? "Try-on · YouCam Hair Color" : "Try-on"}</figcaption>
        </figure>
      </div>
    </section>
  );
}
