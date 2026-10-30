"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { STYLES, assess, saferStyles, type StyleId } from "@/lib/edges";
import { useHistory } from "@/lib/history";
import { prepareImage, type Prepared } from "@/lib/image-client";
import { STYLE_PHOTOS } from "@/lib/photos";
import { StylePhoto } from "./StylePhoto";
import { TensionMeter } from "./TensionMeter";
import styles from "./ui.module.css";

type Tpl = { id: string; thumb: string; title: string; family: string };
const noop = () => () => {};
type TryState = { kind: "idle" } | { kind: "loading"; id: string } | { kind: "done"; id: string; url: string } | { kind: "note"; text: string };

export function Planner() {
  const list = useHistory();
  const assessment = useMemo(() => (list.length ? assess(list) : undefined), [list]);
  // Pre-select the style passed from the dashboard (?want=...), until the user picks one.
  const urlWant = useSyncExternalStore(
    noop,
    () => new URLSearchParams(window.location.search).get("want"),
    () => null,
  );
  const [picked, setWant] = useState<StyleId | null>(null);
  const want: StyleId = picked ?? (urlWant && STYLES.some((s) => s.id === urlWant) ? (urlWant as StyleId) : "box-braids");
  const [photo, setPhoto] = useState<Prepared | null>(null);
  const [templates, setTemplates] = useState<Tpl[] | null>(null);
  const [mode, setMode] = useState<"live" | "demo" | null>(null);
  const [tryState, setTryState] = useState<TryState>({ kind: "idle" });

  useEffect(() => {
    fetch("/api/styles")
      .then((r) => r.json())
      .then((j) => {
        setMode(j.mode);
        setTemplates(j.templates ?? []);
      })
      .catch(() => setTemplates([]));
  }, []);

  const options = saferStyles(want, assessment);
  const families = new Set(options.filter((o) => o.style.id !== want).map((o) => o.style.family));
  const lowTension = (templates ?? []).filter((t) => families.has(t.family as never) || t.family === "natural").slice(0, 12);

  async function tryOn(t: Tpl) {
    if (!photo) return;
    setTryState({ kind: "loading", id: t.id });
    const fd = new FormData();
    fd.set("photo", photo.blob, "front.jpg");
    fd.set("template", t.id);
    try {
      const res = await fetch("/api/style-tryon", { method: "POST", body: fd });
      const j = await res.json();
      if (j.mode === "demo") return setTryState({ kind: "note", text: j.demoReason });
      if (!res.ok || !j.url) return setTryState({ kind: "note", text: j.error ?? "Try-on failed. Please try again." });
      setTryState({ kind: "done", id: t.id, url: j.url });
    } catch {
      setTryState({ kind: "note", text: "Try-on failed. Check your connection and try again." });
    }
  }

  return (
    <div style={{ display: "grid", gap: "var(--s-5)" }}>
      <section className={styles.panel}>
        <h2>What do you want next?</h2>
        <div className={styles.options} role="radiogroup" aria-label="Style you want">
          {STYLES.map((s) => (
            <button key={s.id} role="radio" aria-checked={want === s.id} className={styles.option} onClick={() => setWant(s.id)}>
              <span className={styles.optionPhoto}>
                <StylePhoto photo={STYLE_PHOTOS[s.id]} />
              </span>
              <strong>{s.name}</strong>
              <TensionMeter value={s.tension} />
            </button>
          ))}
        </div>
      </section>

      <section className={styles.panel}>
        <h2>Gentler ways to get the look</h2>
        <div style={{ display: "grid", gap: "var(--s-3)" }}>
          {options.map((o) => (
            <article key={o.style.id} className={styles.saferCard} data-wanted={o.style.id === want}>
              <span className={styles.saferPhoto}>
                <StylePhoto photo={STYLE_PHOTOS[o.style.id]} sizes="140px" />
              </span>
              <div style={{ display: "grid", gap: 10, minWidth: 0 }}>
              <div className={styles.row} style={{ justifyContent: "space-between" }}>
                <strong style={{ fontSize: "1.05rem" }}>
                  {o.style.name}
                  {o.style.id === want ? <span className={styles.small}> · what you asked for</span> : null}
                </strong>
                <span className={styles.row} style={{ gap: 10 }}>
                  <TensionMeter value={o.style.tension} />
                  {o.tensionDrop > 0 ? <span className={styles.tag} style={{ background: "var(--blend-bg)", color: "var(--blend)" }}>−{o.tensionDrop}% tension</span> : null}
                </span>
              </div>
              <ul className={styles.list}>
                {o.rules.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.panel}>
        <h2>Try a gentler style on you</h2>
        <div className={styles.photos}>
          <div className={styles.slot}>
            <label className={styles.drop} data-filled={Boolean(photo)}>
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photo.url} alt="Your photo" />
              ) : null}
              <input
                type="file"
                accept="image/*"
                capture="user"
                className="sr-only"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  if (photo) URL.revokeObjectURL(photo.url);
                  setPhoto(await prepareImage(f));
                  setTryState({ kind: "idle" });
                }}
              />
              <span className={styles.dropLabel}>{photo ? "Change photo" : "Add front photo"}</span>
            </label>
          </div>
          <div className={styles.slot}>
            <div className={styles.drop} data-filled="true" aria-live="polite" style={{ cursor: "default" }}>
              {tryState.kind === "done" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={tryState.url} alt="You with the chosen style" />
              ) : (
                <p className={styles.small} style={{ padding: "var(--s-4)", textAlign: "center" }}>
                  {tryState.kind === "loading" ? "Styling…" : tryState.kind === "note" ? tryState.text : photo ? "Pick a style below." : "Your preview appears here."}
                </p>
              )}
            </div>
          </div>
        </div>
        {templates === null ? (
          <p className={styles.small}>Loading styles…</p>
        ) : mode === "demo" ? (
          <p className={styles.notice}>Style try-on turns on when a YouCam API key is added to this deployment. The planner above works without it.</p>
        ) : lowTension.length ? (
          <div className={styles.options} style={{ gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))" }}>
            {lowTension.map((t) => (
              <button key={t.id} className={styles.option} disabled={!photo || tryState.kind === "loading"} aria-pressed={tryState.kind === "done" && tryState.id === t.id} onClick={() => tryOn(t)} style={{ padding: 8 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={t.thumb} alt="" style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: 10 }} />
                <span className={styles.small} style={{ color: "var(--ink)" }}>{t.title}</span>
              </button>
            ))}
          </div>
        ) : (
          <p className={styles.small}>No matching try-on styles are available on this account right now.</p>
        )}
      </section>
    </div>
  );
}
