"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { assess, buildCard, encodeCard, styleById } from "@/lib/edges";
import { history, useHistory } from "@/lib/history";
import { planStore } from "@/lib/plan";
import { Routine } from "./treatment/Routine";
import { TreatmentReport } from "./treatment/TreatmentReport";
import { TensionMeter } from "./TensionMeter";
import { TrendChart } from "./TrendChart";
import styles from "./ui.module.css";

const subscribeNoop = () => () => {};

export function Dashboard() {
  return (
    <div style={{ display: "grid", gap: "var(--s-5)" }}>
      <TreatmentReport />
      <Routine />
      <Hairline />
    </div>
  );
}

/** Density history, plus the style-tension view for people whose styles pull. */
function Hairline() {
  const list = useHistory();
  const plan = planStore.use();
  const assessment = useMemo(() => (list.length ? assess(list) : null), [list]);
  const hasDemo = list.some((c) => c.demo);
  const latest = list.at(-1);
  if (!assessment || !latest) return null;
  // Style tension matters for traction hair loss, or when no plan is set yet.
  const traction = !plan || plan.items.some((i) => i.id === "gentler-styles");

  const a = assessment;
  const pct = Math.min(100, (a.load / 12) * 100);

  return (
    <div style={{ display: "grid", gap: "var(--s-5)" }}>
      {hasDemo ? (
        <p className={styles.notice}>
          Some check-ins here are <strong>sample data</strong> (hollow points on
          the chart) to show how tracking works over months.{" "}
          <button
            className="btn btn-ghost"
            style={{ minHeight: 34, padding: "0 12px", marginLeft: 6 }}
            onClick={() => history.clearSample()}
          >
            Remove samples
          </button>
        </p>
      ) : null}

      {traction ? (
        <section
          className={styles.status}
          data-status={a.status}
          aria-live="polite"
        >
          <span className={styles.statusTag}>
            {a.status === "act"
              ? "Act now"
              : a.status === "watch"
                ? "Watch"
                : "Steady"}
          </span>
          <h2>{a.headline}</h2>
          <ul className={styles.list}>
            {a.reasons.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
          {a.seeDermatologist ? (
            <p className={styles.derm}>
              <strong>See a board-certified dermatologist.</strong> edge.wise
              can&rsquo;t tell you why your hairline is changing, only that it
              is. Hair loss caught early is more likely to be reversible.
            </p>
          ) : null}
        </section>
      ) : null}

      <div
        className={traction ? styles.grid2 : undefined}
        style={traction ? undefined : { display: "grid", gap: "var(--s-5)" }}
      >
        <section className={styles.panel} style={{ alignContent: "start" }}>
          <p className={styles.label}>Hairline density</p>
          <p className={styles.big}>
            {a.trend.latest.toFixed(2)}
            <span style={{ fontSize: "1rem", color: "var(--ink-3)" }}>
              {" "}
              / 3 · {latest.term.toLowerCase()}
            </span>
          </p>
          <p className={styles.small}>
            {!traction
              ? "Every check-in, as YouCam read it."
              : a.trend.change === null
                ? "Baseline set. Check in again before your next install."
                : `${a.trend.change >= 0 ? "+" : ""}${a.trend.change.toFixed(2)} vs your baseline of ${a.trend.baseline!.toFixed(2)}`}
          </p>
          <TrendChart trend={a.trend} />
        </section>
        <section className={styles.panel}>
          <p className={styles.label}>
            {traction ? "Tension load · last 6 months" : "Check-ins"}
          </p>
          {traction ? (
            <>
              <p className={styles.big}>
                {a.load}
                <span style={{ fontSize: "1rem", color: "var(--ink-3)" }}>
                  {" "}
                  · {a.band}
                </span>
              </p>
              <div
                style={{
                  height: 10,
                  borderRadius: 999,
                  background: "var(--cream-2)",
                  overflow: "hidden",
                }}
                aria-hidden="true"
              >
                <div
                  style={{
                    width: `${pct}%`,
                    height: "100%",
                    borderRadius: 999,
                    background:
                      a.band === "high"
                        ? "var(--clash)"
                        : a.band === "moderate"
                          ? "var(--amber)"
                          : "var(--blend)",
                  }}
                />
              </div>
              <p className={styles.small}>
                Each style&rsquo;s tension × weeks worn. Recent styles count
                more. Extensions, relaxed hair and painful installs add to it.
              </p>
            </>
          ) : null}
          <ol
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "grid",
              gap: 10,
            }}
          >
            {[...list].reverse().map((c) => {
              const s = styleById(c.style.style);
              return (
                <li
                  key={c.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: 4,
                    paddingTop: 10,
                    borderTop: "1px solid var(--line)",
                  }}
                >
                  <span>
                    <strong>{s.name}</strong>
                    {c.demo ? (
                      <span className={styles.tag} style={{ marginLeft: 6 }}>
                        sample
                      </span>
                    ) : null}
                    <br />
                    <span className={styles.small}>
                      {new Date(c.date).toLocaleDateString(undefined, {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      · {c.style.weeks} wk
                      {c.style.extensions ? " · extensions" : ""} · density{" "}
                      {c.density.toFixed(2)}
                    </span>
                  </span>
                  <span
                    style={{ display: "grid", justifyItems: "end", gap: 4 }}
                  >
                    <TensionMeter value={s.tension} label={false} />
                    <button
                      onClick={() => history.remove(c.id)}
                      style={{
                        border: 0,
                        background: "none",
                        color: "var(--ink-3)",
                        fontSize: "0.75rem",
                        cursor: "pointer",
                        textDecoration: "underline",
                      }}
                    >
                      Remove
                    </button>
                  </span>
                </li>
              );
            })}
          </ol>
        </section>
      </div>

      {traction ? (
        <>
          <section className={styles.panel}>
            <h2>What to do next</h2>
            <ul className={styles.list}>
              {a.next.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
            <div className={styles.row}>
              <Link
                href={`/plan?want=${latest.style.style}`}
                className="btn btn-primary"
              >
                Plan my next style
              </Link>
              <Link href="/check" className="btn btn-ghost">
                New check-in
              </Link>
            </div>
          </section>

          <ShareCard />
        </>
      ) : null}

      <p className={styles.small}>
        Your check-ins are stored only in this browser.{" "}
        <button
          onClick={() => {
            if (
              window.confirm(
                "Delete all your edge.wise check-ins, photos and plan from this device?",
              )
            )
              history.clear();
          }}
          style={{
            border: 0,
            background: "none",
            color: "var(--clash)",
            cursor: "pointer",
            textDecoration: "underline",
            fontSize: "inherit",
          }}
        >
          Delete all my data
        </button>
      </p>
    </div>
  );
}

function ShareCard() {
  const list = useHistory();
  const [name, setName] = useState("");
  const [copied, setCopied] = useState(false);
  const origin = useSyncExternalStore(
    subscribeNoop,
    () => window.location.origin,
    () => "",
  );
  const link = list.length
    ? `${origin}/card/${encodeCard(buildCard(list, name.trim() || undefined))}`
    : "";
  const text = `Before my appointment, here's my edge.wise card. Please go easy on my edges: ${link}`;

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My edge.wise stylist card",
          text,
          url: link,
        });
        return;
      } catch {
        /* user cancelled: fall back to copy */
      }
    }
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className={styles.panel}>
      <h2>Stylist card</h2>
      <p className={styles.sub}>
        Dermatologists call your stylist the front line for spotting hair loss.
        Send them this before your appointment: your hairline status, what to
        avoid, and how to install gently. No photos are included.
      </p>
      <label
        style={{
          display: "grid",
          gap: 6,
          maxWidth: 360,
          fontWeight: 600,
          fontSize: "0.875rem",
        }}
      >
        Your first name (optional)
        <input
          value={name}
          maxLength={40}
          onChange={(e) => setName(e.target.value)}
          style={{
            minHeight: 46,
            padding: "0 12px",
            borderRadius: 12,
            border: "1.5px solid var(--line)",
            font: "inherit",
            background: "var(--cream)",
          }}
        />
      </label>
      <div className={styles.row}>
        <button className="btn btn-primary" onClick={share}>
          {copied ? "Link copied" : "Share with my stylist"}
        </button>
        <a
          className="btn btn-ghost"
          href={`https://wa.me/?text=${encodeURIComponent(text)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          WhatsApp
        </a>
        <a
          className="btn btn-ghost"
          href={link}
          target="_blank"
          rel="noopener noreferrer"
        >
          Preview card
        </a>
      </div>
    </section>
  );
}
