"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { STYLES, type CheckIn, type DensityTerm, type StyleId, type Symptoms } from "@/lib/edges";
import { history } from "@/lib/history";
import { prepareImage, type Prepared } from "@/lib/image-client";
import { TensionMeter } from "./TensionMeter";
import styles from "./ui.module.css";

type Slot = "tiltA" | "tiltB" | "front" | "right" | "left";
const STEPS = ["About", "Style", "Feel", "Photos"] as const;
const STAGES = ["Uploading photos", "Reading hairline density (take 1)", "Reading hairline density (take 2)", "Measuring length", "Comparing with your history"];

export function CheckInFlow() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [style, setStyle] = useState<StyleId>("box-braids");
  const [weeks, setWeeks] = useState(4);
  const [extensions, setExtensions] = useState(true);
  const [relaxed, setRelaxed] = useState(false);
  const [symptoms, setSymptoms] = useState<Symptoms>({ tightSigns: false, brokenEdges: false, crownItch: false });
  const [photos, setPhotos] = useState<Partial<Record<Slot, Prepared>>>({});
  const [busy, setBusy] = useState<Slot | null>(null);
  const [sending, setSending] = useState(false);
  const [stage, setStage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const top = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  useEffect(() => {
    if (!sending) return;
    const t = setInterval(() => setStage((s) => Math.min(s + 1, STAGES.length - 1)), 2200);
    return () => clearInterval(t);
  }, [sending]);

  async function onFile(slot: Slot, file?: File) {
    if (!file) return;
    setBusy(slot);
    setError(null);
    try {
      const p = await prepareImage(file);
      setPhotos((prev) => {
        if (prev[slot]) URL.revokeObjectURL(prev[slot]!.url);
        return { ...prev, [slot]: p };
      });
    } catch {
      setError("That file couldn't be read as a photo. Try a JPG or PNG.");
    } finally {
      setBusy(null);
    }
  }

  async function submit() {
    if (!photos.tiltA) return;
    setSending(true);
    setStage(0);
    setError(null);
    const fd = new FormData();
    (Object.keys(photos) as Slot[]).forEach((k) => fd.set(k, photos[k]!.blob, `${k}.jpg`));
    try {
      const res = await fetch("/api/checkin", { method: "POST", body: fd });
      const j = (await res.json()) as {
        mode: "live" | "demo";
        density: number;
        spread: number;
        term: DensityTerm;
        length?: string;
        hairType?: string;
        error?: string;
      };
      if (!res.ok) throw new Error(j.error ?? "The check-in failed. Please try again.");
      const entry: CheckIn = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        density: j.density,
        spread: j.spread,
        term: j.term,
        length: j.length,
        hairType: j.hairType,
        style: { style, weeks, extensions, relaxed },
        symptoms,
        demo: j.mode === "demo",
      };
      history.add(entry);
      router.push("/dashboard?new=1");
    } catch (e) {
      setError(e instanceof Error ? e.message : "The check-in failed. Please try again.");
      setSending(false);
    }
  }

  const s = STYLES.find((x) => x.id === style)!;
  const slot = (key: Slot, title: string, tip: string, guide: "tilt" | "front" | "side", required = false) => {
    const p = photos[key];
    return (
      <div className={styles.slot} key={key}>
        <label className={styles.drop} data-filled={Boolean(p)}>
          {p ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.url} alt={`${title} photo`} />
          ) : (
            <Guide kind={guide} />
          )}
          <input type="file" accept="image/*" capture="user" className="sr-only" onChange={(e) => onFile(key, e.target.files?.[0])} />
          <span className={styles.dropLabel}>{busy === key ? "Preparing…" : p ? "Retake" : "Add photo"}</span>
        </label>
        <strong>
          {title}
          {required ? "" : " (optional)"}
        </strong>
        <span className={styles.small}>{tip}</span>
        {p ? <span className={styles.light} data-ok={p.light.ok}>{p.light.message}</span> : null}
      </div>
    );
  };

  return (
    <div ref={top} style={{ display: "grid", gap: "var(--s-5)", scrollMarginTop: 100 }}>
      <ol className={styles.progress} aria-label={`Step ${step + 1} of ${STEPS.length}: ${STEPS[step]}`}>
        {STEPS.map((label, i) => (
          <li key={label} data-on={i <= step} />
        ))}
      </ol>
      {error ? <p className={styles.error} role="alert">{error}</p> : null}

      {step === 0 && (
        <section className={styles.panel}>
          <h2>Two minutes, before your next install.</h2>
          <ul className={styles.list}>
            <li>You&rsquo;ll answer three quick questions about your current style, then take two photos of your hairline with your head tilted down.</li>
            <li>YouCam measures your hairline density from the photos. edge.wise compares it with your earlier check-ins and with the tension your styles put on your edges.</li>
            <li>Photos are sent to YouCam for this check-in only and never stored. Your history stays on this phone.</li>
            <li>edge.wise doesn&rsquo;t diagnose. If something looks wrong, it&rsquo;ll tell you to see a dermatologist.</li>
          </ul>
          <button className="btn btn-primary" style={{ justifySelf: "start" }} onClick={() => setStep(1)}>
            Start
          </button>
        </section>
      )}

      {step === 1 && (
        <section className={styles.panel}>
          <h2>What&rsquo;s in your hair right now?</h2>
          <div className={styles.options} role="radiogroup" aria-label="Current style">
            {STYLES.map((x) => (
              <button key={x.id} role="radio" aria-checked={style === x.id} className={styles.option} onClick={() => setStyle(x.id)}>
                <strong>{x.name}</strong>
                <TensionMeter value={x.tension} />
              </button>
            ))}
          </div>
          <div className={styles.row}>
            <span>{style === "out" ? "Weeks since your last install" : "Weeks it's been in"}</span>
            <div className={styles.stepper}>
              <button aria-label="Fewer weeks" onClick={() => setWeeks((w) => Math.max(0, w - 1))}>−</button>
              <output aria-live="polite">{weeks} {weeks === 1 ? "week" : "weeks"}</output>
              <button aria-label="More weeks" onClick={() => setWeeks((w) => Math.min(26, w + 1))}>+</button>
            </div>
          </div>
          <div className={styles.grid2}>
            <label className={styles.toggle}>
              <input type="checkbox" checked={extensions} onChange={(e) => setExtensions(e.target.checked)} />
              <span>
                Added hair or extensions
                <small>Extra weight pulls on the root.</small>
              </span>
            </label>
            <label className={styles.toggle}>
              <input type="checkbox" checked={relaxed} onChange={(e) => setRelaxed(e.target.checked)} />
              <span>
                Relaxed or permed hair underneath
                <small>Dermatologists say extensions are riskier on chemically treated hair.</small>
              </span>
            </label>
          </div>
          <p className={styles.small}>{s.why}</p>
          <div className={styles.row}>
            <button className="btn btn-ghost" onClick={() => setStep(0)}>Back</button>
            <button className="btn btn-primary" onClick={() => setStep(2)}>Next</button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className={styles.panel}>
          <h2>How does it feel?</h2>
          <p className={styles.sub}>Tick anything you&rsquo;ve noticed since this style went in.</p>
          <label className={styles.toggle}>
            <input type="checkbox" checked={symptoms.tightSigns} onChange={(e) => setSymptoms({ ...symptoms, tightSigns: e.target.checked })} />
            <span>
              Pain, stinging, small bumps, or skin pulled up like a tent
              <small>Dermatologists say these mean a style is too tight.</small>
            </span>
          </label>
          <label className={styles.toggle}>
            <input type="checkbox" checked={symptoms.brokenEdges} onChange={(e) => setSymptoms({ ...symptoms, brokenEdges: e.target.checked })} />
            <span>
              Broken hairs or a receding line at the front or temples
              <small>Early signs worth tracking.</small>
            </span>
          </label>
          <label className={styles.toggle}>
            <input type="checkbox" checked={symptoms.crownItch} onChange={(e) => setSymptoms({ ...symptoms, crownItch: e.target.checked })} />
            <span>
              Itching, tingling or tenderness on the top of your head
              <small>This can point to a different kind of hair loss, so we&rsquo;ll suggest a dermatologist.</small>
            </span>
          </label>
          <div className={styles.row}>
            <button className="btn btn-ghost" onClick={() => setStep(1)}>Back</button>
            <button className="btn btn-primary" onClick={() => setStep(3)}>Next</button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className={styles.panel}>
          <h2>Your hairline, twice.</h2>
          <p className={styles.sub}>
            Hair down and pushed back off your face, head tilted down a little, the whole hairline in frame, in daylight. Take the same photo twice. edge.wise uses both to check the reading is steady.
          </p>
          <div className={styles.photos}>
            {slot("tiltA", "Hairline, take 1", "Tilt your head down slightly. Whole hairline visible.", "tilt", true)}
            {slot("tiltB", "Hairline, take 2", "Same again. A steady reading needs both.", "tilt")}
            {slot("front", "Front", "Looking straight ahead, hair down. Adds length.", "front")}
          </div>
          <details>
            <summary style={{ cursor: "pointer", fontWeight: 600 }}>Add side photos for your curl pattern</summary>
            <div className={styles.photos} style={{ marginTop: "var(--s-3)" }}>
              {slot("right", "Turn right", "A quarter turn to your right.", "side")}
              {slot("left", "Turn left", "A quarter turn to your left.", "side")}
            </div>
          </details>
          {sending ? (
            <div className={styles.stages} role="status">
              {STAGES.map((x, i) => (
                <p key={x} data-state={i < stage ? "done" : i === stage ? "now" : "todo"}>{x}</p>
              ))}
            </div>
          ) : (
            <div className={styles.row}>
              <button className="btn btn-ghost" onClick={() => setStep(2)}>Back</button>
              <button className="btn btn-primary" disabled={!photos.tiltA} onClick={submit}>
                {photos.tiltA ? "Check my edges" : "Add a hairline photo"}
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function Guide({ kind }: { kind: "tilt" | "front" | "side" }) {
  // Outline guides for each photo: head tilted down, front, side.
  return (
    <svg viewBox="0 0 120 140" aria-hidden="true">
      <g transform={kind === "tilt" ? "rotate(-14 60 70) translate(0 6)" : kind === "side" ? "translate(6 0)" : undefined}>
        <ellipse cx="60" cy="58" rx="40" ry="38" fill="var(--cream-2)" stroke="var(--ink-3)" strokeWidth="2" strokeDasharray="4 4" />
        <ellipse cx={kind === "side" ? 66 : 60} cy="74" rx={kind === "side" ? 20 : 24} ry="28" fill="var(--white)" stroke="var(--ink)" strokeWidth="2" />
        <path d={kind === "side" ? "M46 54 Q64 40 84 52" : "M38 56 Q60 38 82 56"} fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" />
      </g>
      {kind === "tilt" ? <path d="M98 30 q8 12 2 26 m0 0 l-6 -4 m6 4 l3 -7" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" /> : null}
      <path d="M30 132 Q60 108 90 132" fill="none" stroke="var(--ink)" strokeWidth="2" />
    </svg>
  );
}
