"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { STYLES, type CheckIn, type DensityTerm, type StyleId, type Symptoms } from "@/lib/edges";
import { history } from "@/lib/history";
import { makeThumb, planStore, thumbStore } from "@/lib/plan";
import { prepareImage, type Prepared } from "@/lib/image-client";
import { STYLE_PHOTOS } from "@/lib/photos";
import { PoseGuide } from "./PoseGuide";
import { StylePhoto } from "./StylePhoto";
import { TensionMeter } from "./TensionMeter";
import { PlanSetup } from "./treatment/TreatmentReport";
import styles from "./ui.module.css";

type Slot = "tiltA" | "tiltB" | "front" | "right" | "left";
type StepName = "about" | "style" | "feel" | "month" | "photos";
const TRACTION_STEPS: StepName[] = ["about", "style", "feel", "photos"];
const TREATMENT_STEPS: StepName[] = ["about", "month", "photos"];
const STAGES = ["Uploading photos", "Reading hairline density (take 1)", "Reading hairline density (take 2)", "Measuring hairline height and length", "Comparing with your history"];

export function CheckInFlow() {
  const router = useRouter();
  const plan = planStore.use();
  // Braid and install questions only matter for traction hair loss.
  const traction = Boolean(plan?.items.some((i) => i.id === "gentler-styles"));
  const STEPS = traction ? TRACTION_STEPS : TREATMENT_STEPS;
  const [step, setStep] = useState(0);
  const at = STEPS[Math.min(step, STEPS.length - 1)];
  const go = (name: StepName) => setStep(STEPS.indexOf(name));
  const [missedDays, setMissedDays] = useState(0);
  const [shedding, setShedding] = useState(false);
  const [irritation, setIrritation] = useState(false);
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
  const [skinCheck, setSkinCheck] = useState(true);
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
    if (skinCheck && photos.front) fd.set("skin", "1");
    try {
      const res = await fetch("/api/checkin", { method: "POST", body: fd, signal: AbortSignal.timeout(150_000) });
      const j = (await res.json().catch(() => ({ error: res.status === 504 ? "YouCam took too long to answer. Please try again." : `The check-in failed (error ${res.status}). Please try again.` }))) as {
        mode: "live" | "demo";
        density: number;
        spread: number;
        term: DensityTerm;
        length?: string;
        hairType?: string;
        skin?: CheckIn["skin"];
        upperThird?: number;
        frizz?: CheckIn["frizz"];
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
        skin: j.skin,
        upperThird: j.upperThird,
        frizz: j.frizz,
        style: traction ? { style, weeks, extensions, relaxed } : { style: "out", weeks: 0, extensions: false, relaxed: false },
        symptoms: traction ? symptoms : { tightSigns: false, brokenEdges: false, crownItch: symptoms.crownItch },
        adherence: traction ? undefined : { missedDays, shedding, irritation },
        demo: j.mode === "demo",
      };
      history.add(entry);
      // A small copy of the hairline photo stays on this phone for the side-by-side view.
      const thumb = await makeThumb(photos.tiltA.url);
      if (thumb) thumbStore.update((m) => ({ ...m, [entry.id]: thumb }));
      router.push("/dashboard?new=1");
    } catch (e) {
      const timeout = e instanceof DOMException && (e.name === "TimeoutError" || e.name === "AbortError");
      setError(timeout ? "YouCam took too long to answer. Please try again." : e instanceof Error ? e.message : "The check-in failed. Please try again.");
      setSending(false);
      // Show the reason where the person is looking: next to the button.
      requestAnimationFrame(() => document.getElementById("checkin-error")?.scrollIntoView({ behavior: "smooth", block: "center" }));
    }
  }

  // Progress lines for what was actually sent. The two takes are read at the same time.
  const stages = STAGES.filter((x) => (x.includes("take 2") ? Boolean(photos.tiltB) : x.includes("length") ? Boolean(photos.front) : true));
  const slot = (key: Slot, title: string, tip: string, guide: "tilt" | "front" | "side", required = false) => {
    const p = photos[key];
    return (
      <div className={styles.slot} key={key}>
        <label className={styles.drop} data-filled={Boolean(p)}>
          {p ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.url} alt={`${title} photo`} />
          ) : (
            <PoseGuide kind={guide} flip={key === "right"} />
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
      <ol className={styles.progress} aria-label={`Step ${step + 1} of ${STEPS.length}`}>
        {STEPS.map((label, i) => (
          <li key={label} data-on={i <= step} />
        ))}
      </ol>
      {error && at !== "photos" ? <p className={styles.error} role="alert">{error}</p> : null}

      {at === "about" && !plan ? <PlanSetup /> : null}

      {at === "about" && plan ? (
        <section className={styles.panel}>
          <h2>Two minutes, once a month.</h2>
          <ul className={styles.list}>
            <li>{traction ? "Three questions about your current style." : "Two questions about this month."} Then two hairline photos, head lowered about 45°.</li>
            <li>Photos go to YouCam for this check-in only. A small thumbnail stays on this phone.</li>
          </ul>
          <button className="btn btn-primary" style={{ justifySelf: "start" }} onClick={() => setStep(1)}>
            Start
          </button>
        </section>
      ) : null}

      {at === "month" && (
        <section className={styles.panel}>
          <h2>This month</h2>
          <div className={styles.row}>
            <span>Days you missed your treatment</span>
            <div className={styles.stepper}>
              <button aria-label="Fewer days" onClick={() => setMissedDays((d) => Math.max(0, d - 1))}>−</button>
              <output aria-live="polite">{missedDays} {missedDays === 1 ? "day" : "days"}</output>
              <button aria-label="More days" onClick={() => setMissedDays((d) => Math.min(31, d + 1))}>+</button>
            </div>
          </div>
          <label className={styles.toggle}>
            <input type="checkbox" checked={shedding} onChange={(e) => setShedding(e.target.checked)} />
            <span>More shedding than usual</span>
          </label>
          <label className={styles.toggle}>
            <input type="checkbox" checked={irritation} onChange={(e) => setIrritation(e.target.checked)} />
            <span>Itching, redness or flaking where you apply it</span>
          </label>
          <label className={styles.toggle}>
            <input type="checkbox" checked={symptoms.crownItch} onChange={(e) => setSymptoms({ ...symptoms, crownItch: e.target.checked })} />
            <span>Burning or tenderness on the top of your head</span>
          </label>
          <div className={styles.row}>
            <button className="btn btn-ghost" onClick={() => go("about")}>Back</button>
            <button className="btn btn-primary" onClick={() => go("photos")}>Next</button>
          </div>
        </section>
      )}

      {at === "style" && (
        <section className={styles.panel}>
          <h2>What&rsquo;s in your hair right now?</h2>
          <div className={styles.options} role="radiogroup" aria-label="Current style">
            {STYLES.map((x) => (
              <button key={x.id} role="radio" aria-checked={style === x.id} className={styles.option} onClick={() => setStyle(x.id)}>
                <span className={styles.optionPhoto}>
                  <StylePhoto photo={STYLE_PHOTOS[x.id]} />
                </span>
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
              </span>
            </label>
            <label className={styles.toggle}>
              <input type="checkbox" checked={relaxed} onChange={(e) => setRelaxed(e.target.checked)} />
              <span>
                Relaxed or permed hair underneath
              </span>
            </label>
          </div>
          <div className={styles.row}>
            <button className="btn btn-ghost" onClick={() => go("about")}>Back</button>
            <button className="btn btn-primary" onClick={() => go("feel")}>Next</button>
          </div>
        </section>
      )}

      {at === "feel" && (
        <section className={styles.panel}>
          <h2>How does it feel?</h2>
          <label className={styles.toggle}>
            <input type="checkbox" checked={symptoms.tightSigns} onChange={(e) => setSymptoms({ ...symptoms, tightSigns: e.target.checked })} />
            <span>
              Pain, stinging, small bumps, or skin pulled up like a tent
            </span>
          </label>
          <label className={styles.toggle}>
            <input type="checkbox" checked={symptoms.brokenEdges} onChange={(e) => setSymptoms({ ...symptoms, brokenEdges: e.target.checked })} />
            <span>
              Broken hairs or a receding line at the front or temples
            </span>
          </label>
          <label className={styles.toggle}>
            <input type="checkbox" checked={symptoms.crownItch} onChange={(e) => setSymptoms({ ...symptoms, crownItch: e.target.checked })} />
            <span>
              Itching, tingling or tenderness on the top of your head
            </span>
          </label>
          <div className={styles.row}>
            <button className="btn btn-ghost" onClick={() => go("style")}>Back</button>
            <button className="btn btn-primary" onClick={() => go("photos")}>Next</button>
          </div>
        </section>
      )}

      {at === "photos" && (
        <section className={styles.panel}>
          <h2>Your hairline, twice.</h2>
          <p className={styles.sub}>
            Hair back, daylight, the same photo twice.
          </p>
          <div className={styles.photos}>
            {slot("tiltA", "Hairline, take 1", "Head down 45°.", "tilt", true)}
            {slot("tiltB", "Hairline, take 2", "Same again.", "tilt")}
            {slot("front", "Front", "Face fills the frame.", "front")}
          </div>
          {photos.front ? (
            <label className={styles.toggle}>
              <input type="checkbox" checked={skinCheck} onChange={(e) => setSkinCheck(e.target.checked)} />
              <span>
                <strong>Also check my skin for irritation</strong>
              </span>
            </label>
          ) : null}
          <details>
            <summary style={{ cursor: "pointer", fontWeight: 600 }}>Add side photos: curl pattern and breakage</summary>
            <div className={styles.photos} style={{ marginTop: "var(--s-3)" }}>
              {slot("right", "Turn right", "Quarter turn.", "side")}
              {slot("left", "Turn left", "Quarter turn.", "side")}
            </div>
          </details>
          {error && !sending ? (
            <p id="checkin-error" className={styles.error} role="alert">
              <b>That didn&rsquo;t work.</b> {error}
            </p>
          ) : null}
          {sending ? (
            <div className={styles.stages} role="status">
              {stages.map((x, i) => (
                <p key={x} data-state={i < Math.min(stage, stages.length - 1) ? "done" : i === Math.min(stage, stages.length - 1) ? "now" : "todo"}>{x}</p>
              ))}
            </div>
          ) : (
            <div className={styles.row}>
              <button className="btn btn-ghost" onClick={() => setStep(step - 1)}>Back</button>
              <button className="btn btn-primary" disabled={!photos.tiltA} onClick={submit}>
                {photos.tiltA ? "Measure my hairline" : "Add a hairline photo"}
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
