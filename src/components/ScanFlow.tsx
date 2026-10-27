"use client";

import { useEffect, useRef, useState } from "react";
import { MatchCard } from "./MatchCard";
import { VerdictCard } from "./VerdictCard";
import { TryOn } from "./TryOn";
import { prepareImage, sampleHair, type Prepared } from "@/lib/image-client";
import { blendCheck, rankCodes, type LeaveOutState, type MatchResult, type Measurements, type Product } from "@/lib/match";
import styles from "./ScanFlow.module.css";

type Angle = "front" | "right" | "left";
const ANGLES: { key: Angle; title: string; tip: string; turn: number }[] = [
  { key: "front", title: "Front", tip: "Look straight at the camera. Hair down, face and the top of your hair in frame.", turn: 0 },
  { key: "right", title: "Turn right", tip: "Turn your head to your right, about a quarter turn. Don't tilt up or down.", turn: 1 },
  { key: "left", title: "Turn left", tip: "Now a quarter turn to your left.", turn: -1 },
];

type Sample = { hex: string; spread: number; n: number; x: number; y: number };
type Analysis = {
  mode: "live" | "demo";
  demoReason?: string;
  measurements: Measurements;
  match: MatchResult;
  failures: { feature: string; code: string; message: string }[];
};

const STAGES = ["Uploading three photos", "Reading curl pattern", "Measuring length", "Cross-checking colour", "Matching codes"];

export function ScanFlow({ product }: { product?: Product }) {
  const [step, setStep] = useState<"intro" | "photos" | "sample" | "analyse" | "result">("intro");
  const [photos, setPhotos] = useState<Partial<Record<Angle, Prepared>>>({});
  const [busyAngle, setBusyAngle] = useState<Angle | null>(null);
  const [sample, setSample] = useState<Sample | null>(null);
  const [leaveOut, setLeaveOut] = useState<LeaveOutState>("natural");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState(0);
  const topRef = useRef<HTMLDivElement>(null);

  const firstStep = useRef(true);
  useEffect(() => {
    // Keep the new step in view, but don't scroll on first load.
    if (firstStep.current) {
      firstStep.current = false;
      return;
    }
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  useEffect(() => {
    if (step !== "analyse") return;
    const t = setInterval(() => setStage((s) => Math.min(s + 1, STAGES.length - 1)), 2600);
    return () => clearInterval(t);
  }, [step]);

  async function onFile(angle: Angle, file: File | undefined) {
    if (!file) return;
    setBusyAngle(angle);
    setError(null);
    try {
      const prepared = await prepareImage(file);
      setPhotos((p) => {
        if (p[angle]) URL.revokeObjectURL(p[angle]!.url);
        return { ...p, [angle]: prepared };
      });
      if (angle === "front") setSample(null);
    } catch {
      setError("That file couldn't be read as a photo. Try a JPG or PNG.");
    } finally {
      setBusyAngle(null);
    }
  }

  async function onTap(e: React.MouseEvent<HTMLButtonElement>) {
    const front = photos.front;
    if (!front) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * front.width;
    const y = ((e.clientY - rect.top) / rect.height) * front.height;
    const s = await sampleHair(front.blob, x, y);
    setSample({ ...s, x, y });
  }

  async function analyse() {
    if (!photos.front || !sample) return;
    setStep("analyse");
    setStage(0);
    setError(null);
    const fd = new FormData();
    fd.set("front", photos.front.blob, "front.jpg");
    if (photos.right) fd.set("right", photos.right.blob, "right.jpg");
    if (photos.left) fd.set("left", photos.left.blob, "left.jpg");
    fd.set("sampleHex", sample.hex);
    fd.set("sampleSpread", String(sample.spread));
    fd.set("sampleN", String(sample.n));
    fd.set("leaveOut", leaveOut);
    try {
      const res = await fetch("/api/analyze", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Analysis failed");
      setAnalysis(json);
      setStep("result");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed");
      setStep("sample");
    }
  }

  const preview = sample ? rankCodes(sample.hex).slice(0, 2) : null;
  const allThree = Boolean(photos.front && photos.right && photos.left);

  return (
    <div ref={topRef} className={styles.flow}>
      <ol className={styles.progress} aria-label="Progress">
        {["Photos", "Measure", "Result"].map((label, i) => {
          const idx = step === "intro" || step === "photos" ? 0 : step === "sample" || step === "analyse" ? 1 : 2;
          return (
            <li key={label} aria-current={i === idx ? "step" : undefined} className={i <= idx ? styles.done : ""}>
              {label}
            </li>
          );
        })}
      </ol>

      {error ? <p className={styles.error} role="alert">{error}</p> : null}

      {step === "intro" && (
        <section className={styles.panel}>
          <h2>Before we start</h2>
          <ul className={styles.promises}>
            <li>You&rsquo;ll take three photos of your head: front, right and left. Wear your hair down.</li>
            <li>The photos go to YouCam&rsquo;s API for this one scan, then they&rsquo;re discarded. Rangi stores nothing.</li>
            <li>Rangi measures colour, curl pattern and length. It never guesses who you are.</li>
            <li>Daylight from a window gives the most accurate colour.</li>
          </ul>
          <button className="btn btn-primary" onClick={() => setStep("photos")}>I understand, start</button>
        </section>
      )}

      {step === "photos" && (
        <section className={styles.panel}>
          <h2>Three angles</h2>
          <p className={styles.sub}>The side photos let YouCam read your curl pattern. You can skip them, but you won&rsquo;t get texture advice.</p>
          <div className={styles.angles}>
            {ANGLES.map((a) => {
              const p = photos[a.key];
              return (
                <div key={a.key} className={styles.angle}>
                  <label className={styles.drop} data-filled={Boolean(p)}>
                    {p ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.url} alt={`${a.title} photo`} />
                    ) : (
                      <HeadGuide turn={a.turn} />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      capture="user"
                      className="sr-only"
                      onChange={(e) => onFile(a.key, e.target.files?.[0])}
                    />
                    <span className={styles.dropLabel}>
                      {busyAngle === a.key ? "Preparing…" : p ? "Retake" : `Add ${a.title.toLowerCase()} photo`}
                    </span>
                  </label>
                  <p className={styles.angleTitle}>{a.title}{a.key === "front" ? " (required)" : ""}</p>
                  <p className={styles.tip}>{a.tip}</p>
                  {p ? (
                    <p className={`data ${styles.light} ${styles[`light_${p.light.level}`]}`}>{p.light.message}</p>
                  ) : null}
                </div>
              );
            })}
          </div>
          <div className={styles.actions}>
            <button className="btn btn-primary" disabled={!photos.front} onClick={() => setStep("sample")}>
              {allThree ? "Next: measure colour" : photos.front ? "Continue without side photos" : "Add a front photo to continue"}
            </button>
          </div>
        </section>
      )}

      {(step === "sample" || step === "analyse") && photos.front && (
        <section className={styles.panel}>
          <h2>Tap your hair</h2>
          <p className={styles.sub}>
            Tap a patch of your <strong>natural hair</strong> that isn&rsquo;t in deep shadow or bright shine, ideally near the hairline where a leave-out would sit.
          </p>
          <div className={styles.sampleGrid}>
            <button type="button" className={styles.tapArea} onClick={onTap} aria-label="Tap on your hair to measure its colour">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photos.front.url} alt="" />
              {sample ? (
                <span
                  className={styles.loupe}
                  style={{ left: `${(sample.x / photos.front.width) * 100}%`, top: `${(sample.y / photos.front.height) * 100}%`, background: sample.hex }}
                  aria-hidden="true"
                />
              ) : null}
            </button>
            <div className={styles.sampleSide}>
              {sample && preview ? (
                <div className={styles.reading} aria-live="polite">
                  <div className={styles.readSwatch} style={{ background: sample.hex }} />
                  <dl className="data">
                    <div><dt>Measured</dt><dd>{sample.hex}</dd></div>
                    <div><dt>Pixels used</dt><dd>{sample.n}</dd></div>
                    <div><dt>Uniformity</dt><dd>{sample.spread < 4 ? "even" : sample.spread < 6 ? "fair" : "mixed — tap again"}</dd></div>
                    <div><dt>Nearest</dt><dd>{preview[0].code} · ΔE {preview[0].deltaE.toFixed(1)}</dd></div>
                  </dl>
                </div>
              ) : (
                <p className={styles.waiting}>Your measured colour will appear here.</p>
              )}

              <fieldset className={styles.fieldset}>
                <legend>How do you wear your leave-out?</legend>
                {([
                  ["natural", "Natural, as it grows"],
                  ["stretched", "Blow-dried or flat-ironed"],
                  ["relaxed", "Relaxed / texturised"],
                ] as [LeaveOutState, string][]).map(([v, l]) => (
                  <label key={v} className={styles.radio}>
                    <input type="radio" name="leaveOut" value={v} checked={leaveOut === v} onChange={() => setLeaveOut(v)} />
                    {l}
                  </label>
                ))}
              </fieldset>

              {step === "analyse" ? (
                <div className={styles.stages} role="status">
                  {STAGES.map((s, i) => (
                    <p key={s} className={i < stage ? styles.stageDone : i === stage ? styles.stageNow : ""}>{s}</p>
                  ))}
                </div>
              ) : (
                <div className={styles.actions}>
                  <button className="btn btn-ghost" onClick={() => setStep("photos")}>Back</button>
                  <button className="btn btn-primary" disabled={!sample} onClick={analyse}>Measure my hair</button>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {step === "result" && analysis && photos.front && (
        <section className={styles.results}>
          {analysis.mode === "demo" ? (
            <p className={styles.demoBanner}>
              <strong>Demo mode.</strong> {analysis.demoReason} Curl pattern, length and YouCam&rsquo;s colour check below are sample values. Your colour measurement is real.
            </p>
          ) : null}
          {analysis.failures.length > 0 ? (
            <div className={styles.failures} role="alert">
              {analysis.failures.map((f) => (
                <p key={f.feature}><strong>{f.feature.replace("-", " ")}:</strong> {f.message}</p>
              ))}
            </div>
          ) : null}

          {product ? <VerdictCard product={product} verdict={blendCheck(analysis.match, product)} match={analysis.match} /> : null}
          <MatchCard match={analysis.match} demo={analysis.mode === "demo"} />
          <TryOn photo={photos.front} match={analysis.match} product={product} />

          <div className={styles.actions}>
            <button
              className="btn btn-ghost"
              onClick={() => {
                setAnalysis(null);
                setSample(null);
                setStep("photos");
              }}
            >
              Scan again
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

function HeadGuide({ turn }: { turn: number }) {
  // Simple head-and-hair outline showing which way to turn.
  return (
    <svg viewBox="0 0 120 140" className={styles.guide} aria-hidden="true">
      <g transform={`translate(${60 + turn * 6} 0)`}>
        <ellipse cx="0" cy="58" rx="44" ry="42" fill="var(--pearl-2)" stroke="var(--ebony-3)" strokeWidth="2" strokeDasharray="4 4" />
        <ellipse cx={turn * 10} cy="72" rx="24" ry="30" fill="var(--white)" stroke="var(--ebony)" strokeWidth="2" />
        <circle cx={turn * 10 - 8 + turn * 4} cy="68" r="2.5" fill="var(--ebony)" />
        <circle cx={turn * 10 + 8 + turn * 4} cy="68" r="2.5" fill="var(--ebony)" />
        <path d={`M${-30} 128 Q0 104 30 128`} fill="none" stroke="var(--ebony)" strokeWidth="2" />
      </g>
      {turn !== 0 ? (
        <path d={turn > 0 ? "M84 20 q14 6 18 20 m0 0 l-7 -3 m7 3 l2 -7" : "M36 20 q-14 6 -18 20 m0 0 l7 -3 m-7 3 l-2 -7"} fill="none" stroke="var(--jacaranda)" strokeWidth="2.5" strokeLinecap="round" />
      ) : null}
    </svg>
  );
}
