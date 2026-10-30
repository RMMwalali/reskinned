"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useHistory, history } from "@/lib/history";
import { planStore, thumbStore } from "@/lib/plan";
import { hairlineHeight } from "@/lib/signals";
import { TREATMENTS, progress, treatmentById, type Plan, type TreatmentId } from "@/lib/treatments";
import { PoseGuide } from "../PoseGuide";
import ui from "../ui.module.css";
import s from "./treatment.module.css";

const TONE: Record<string, "good" | "wait" | "bad" | "info"> = {
  improving: "good",
  holding: "good",
  early: "wait",
  "early-dip": "wait",
  baseline: "info",
  declining: "bad",
  "need-checkin": "info",
  "no-plan": "info",
};

const LABEL: Record<string, string> = {
  improving: "Working",
  holding: "Holding",
  early: "On track",
  "early-dip": "Early dip",
  baseline: "Started",
  declining: "Talk to your prescriber",
  "need-checkin": "Check in",
  "no-plan": "Set up",
};

const today = () => new Date().toISOString().slice(0, 10);

export function PlanSetup({ initial, onDone }: { initial?: Plan | null; onDone?: () => void }) {
  const [picked, setPicked] = useState<Record<string, string>>(() => Object.fromEntries((initial?.items ?? []).map((i) => [i.id, i.start.slice(0, 10)])));
  const toggle = (id: TreatmentId) =>
    setPicked((p) => {
      const n = { ...p };
      if (n[id]) delete n[id];
      else n[id] = Object.values(p)[0] ?? today();
      return n;
    });
  const items = Object.entries(picked).map(([id, start]) => ({ id: id as TreatmentId, start: new Date(`${start}T12:00:00`).toISOString() }));

  return (
    <section className={ui.panel}>
      <h2>What are you using?</h2>
      <div className={s.chips} role="group" aria-label="Treatments">
        {TREATMENTS.map((t) => (
          <button key={t.id} type="button" className={s.chip} aria-pressed={Boolean(picked[t.id])} onClick={() => toggle(t.id)}>
            {t.name}
            <small>{t.access === "rx" ? "Prescription" : t.access === "clinic" ? "Clinic" : t.access === "device" ? "Device" : t.access === "habit" ? "Habit" : "Over the counter"}</small>
          </button>
        ))}
      </div>
      {items.length ? (
        <div className={s.dates}>
          {items.map((i) => (
            <label key={i.id}>
              <span>{treatmentById(i.id).name}: started</span>
              <input type="date" max={today()} value={picked[i.id]} onChange={(e) => setPicked((p) => ({ ...p, [i.id]: e.target.value || today() }))} />
            </label>
          ))}
        </div>
      ) : null}
      <div className={ui.row}>
        <button
          className="btn btn-primary"
          disabled={!items.length}
          onClick={() => {
            planStore.set({ items });
            onDone?.();
          }}
        >
          Save my plan
        </button>
        {!initial ? (
          <button className="btn btn-ghost" onClick={() => history.loadTreatmentSample()}>
            See a sample
          </button>
        ) : null}
      </div>
    </section>
  );
}

/** The month-by-month treatment report. */
const noop = () => () => {};

export function TreatmentReport() {
  // Dates depend on "now" and the data lives on this device: render after hydration only.
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  return mounted ? <Report /> : <section className={ui.panel} style={{ minHeight: 280 }} aria-busy="true" />;
}

function Report() {
  const list = useHistory();
  const plan = planStore.use();
  const thumbs = thumbStore.use();
  const [editing, setEditing] = useState(false);
  const p = useMemo(() => progress(list, plan), [list, plan]);
  const hl = useMemo(() => hairlineHeight(list), [list]);

  if (!plan || editing) return <PlanSetup initial={plan} onDone={() => setEditing(false)} />;

  const max = Math.max(p.window[1], Math.ceil(p.month) + 1, 6);
  const pos = (m: number) => `${Math.min(100, Math.max(0, (m / max) * 100))}%`;
  const withThumbs = list.filter((c) => thumbs[c.id]);
  const first = withThumbs[0];
  const last = withThumbs.at(-1);

  return (
    <div className={s.stack}>
      <section className={s.report} data-tone={TONE[p.verdict]} aria-live="polite">
        <div className={s.reportHead}>
          <span className={s.badge}>{LABEL[p.verdict]}</span>
          <span className={`data ${s.month}`}>Month {Math.max(1, Math.round(p.month))}</span>
        </div>
        <h2>{p.headline}</h2>
        <p>{p.body}</p>
        {p.change !== null ? (
          <div className={s.nums}>
            <span>
              <small>Started at</small>
              <b className="data">{p.baseline!.toFixed(2)}</b>
            </span>
            <span>
              <small>Now</small>
              <b className="data">{p.latest!.toFixed(2)}</b>
            </span>
            <span>
              <small>Change</small>
              <b className="data">{p.change >= 0 ? "+" : ""}{p.change.toFixed(2)}</b>
            </span>
            {hl ? (
              <span>
                <small>Hairline height</small>
                <b className="data">{hl.change > 0 ? "+" : ""}{hl.change.toFixed(1)} pts</b>
              </span>
            ) : null}
          </div>
        ) : null}
        {hl && hl.agreement !== "mixed" ? (
          <span className={s.agree}>{hl.agreement === "steady" ? "Density and hairline height both steady" : "Density and hairline height agree"}</span>
        ) : hl ? (
          <span className={s.agree}>Density and hairline height disagree: retake next month</span>
        ) : null}
        {p.seeDoctor ? (
          <p className={ui.derm}>
            <strong>Bring this to your prescriber or a dermatologist.</strong> edge.wise measures change; it can&rsquo;t tell you why. The dose, the treatment, or the cause may need a second look.
          </p>
        ) : null}
        <div className={ui.row}>
          <Link href="/check" className="btn btn-primary">
            {p.verdict === "need-checkin" ? "Take my first check-in" : "Monthly check-in"}
          </Link>
          {p.nextCheck ? <span className={s.next}>Next check-in from {new Date(p.nextCheck).toLocaleDateString(undefined, { day: "numeric", month: "short" })}</span> : null}
        </div>
      </section>

      {p.quitZone && p.verdict !== "declining" ? (
        <section className={s.quit}>
          <b className="data">86%</b>
          <p>stop minoxidil before it shows results. You&rsquo;re in that stretch.</p>
        </section>
      ) : null}

      <section className={ui.panel}>
        <div className={s.timelineHead}>
          <h2>Your timeline</h2>
          <button className={s.link} onClick={() => setEditing(true)}>
            Edit plan
          </button>
        </div>
        <div className={s.timeline} aria-label={`Month ${Math.max(1, Math.round(p.month))} of treatment. Results usually show from month ${p.window[0]} to ${p.window[1]}.`}>
          <span className={s.window} style={{ left: pos(p.window[0]), width: `calc(${pos(p.window[1])} - ${pos(p.window[0])})` }}>
            <em>Results usually show</em>
          </span>
          {p.points.filter((x) => x.month >= -0.5).map((x, i) => (
            <i key={i} className={s.dot} data-demo={x.demo} style={{ left: pos(Math.max(0, x.month)) }} title={`Month ${x.month.toFixed(1)}: ${x.density.toFixed(2)}`} />
          ))}
          <span className={s.now} style={{ left: pos(p.month) }}>
            <em>You</em>
          </span>
        </div>
        <div className={`data ${s.ticks}`}>
          {Array.from({ length: max + 1 }, (_, m) => (
            <span key={m} style={{ left: pos(m) }}>{m}</span>
          ))}
        </div>
        <ul className={s.plan}>
          {plan.items.map((i) => {
            const t = treatmentById(i.id);
            return (
              <li key={i.id}>
                <b>{t.name}</b>
                <span>
                  Since {new Date(i.start).toLocaleDateString(undefined, { month: "short", year: "numeric" })} · results usually months {t.results[0]}
                  {t.results[1] !== t.results[0] ? `–${t.results[1]}` : ""}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className={ui.panel}>
        <h2>Side by side</h2>
        <div className={s.compare}>
          {[first, last].map((c, k) => (
            <figure key={k}>
              <span className={s.compareImg}>
                {c && (k === 0 || c.id !== first?.id) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumbs[c.id]} alt={`Hairline photo, ${new Date(c.date).toLocaleDateString()}`} />
                ) : (
                  <PoseGuide kind="tilt" />
                )}
              </span>
              <figcaption>
                {k === 0 ? "First" : "Latest"}
                {c && (k === 0 || c.id !== first?.id) ? ` · ${new Date(c.date).toLocaleDateString(undefined, { day: "numeric", month: "short" })}` : ""}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </div>
  );
}
