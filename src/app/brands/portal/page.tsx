import type { Metadata } from "next";
import Link from "next/link";
import { Nudge } from "@/components/treatment/Nudge";
import { cohortStats, nudgeFor, sampleCohort, TYPICAL_RETENTION } from "@/lib/portal";
import { treatmentById } from "@/lib/treatments";
import ui from "@/components/ui.module.css";
import s from "@/components/treatment/brands.module.css";

export const metadata: Metadata = { title: "Partner portal (sample) — edge.wise" };

const VERDICT: Record<string, string> = {
  improving: "Working",
  holding: "Holding",
  early: "On track",
  "early-dip": "Early dip",
  baseline: "Started",
  declining: "Declining",
  "need-checkin": "No check-in",
};

function RetentionChart() {
  const W = 640;
  const H = 260;
  const pad = { l: 44, r: 16, t: 16, b: 34 };
  const x = (m: number) => pad.l + (m / 12) * (W - pad.l - pad.r);
  const y = (v: number) => pad.t + (1 - v / 100) * (H - pad.t - pad.b);
  const line = TYPICAL_RETENTION.map(([m, v], i) => `${i ? "L" : "M"}${x(m)} ${y(v)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Share of patients still on minoxidil by month: 79% at 1 month, 54% at 3, 33% at 6, 12% at 12." style={{ width: "100%", height: "auto" }}>
      <rect x={x(1)} y={pad.t} width={x(6) - x(1)} height={H - pad.t - pad.b} fill="var(--lilac)" />
      <text x={x(3.5)} y={pad.t + 18} textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--crimson)" fontFamily="var(--font-cond)">
        WHERE EDGE.WISE WORKS: MONTHS 1–6
      </text>
      {[0, 25, 50, 75, 100].map((v) => (
        <g key={v}>
          <line x1={pad.l} x2={W - pad.r} y1={y(v)} y2={y(v)} stroke="var(--line)" />
          <text x={pad.l - 8} y={y(v) + 4} textAnchor="end" fontSize="11" fill="var(--ink-3)">{v}%</text>
        </g>
      ))}
      {[0, 1, 3, 6, 9, 12].map((m) => (
        <text key={m} x={x(m)} y={H - 10} textAnchor="middle" fontSize="11" fill="var(--ink-3)">{m} mo</text>
      ))}
      <path d={line} fill="none" stroke="var(--ink)" strokeWidth="3.5" strokeLinejoin="round" />
      {TYPICAL_RETENTION.map(([m, v]) => (
        <g key={m}>
          <circle cx={x(m)} cy={y(v)} r="6" fill="var(--saffron)" stroke="var(--ink)" strokeWidth="2.5" />
          <text x={m === 12 ? x(m) - 8 : x(m) + 8} y={y(v) - 10} textAnchor={m === 12 ? "end" : "start"} fontSize="13" fontWeight="700" fill="var(--ink)">{v}%</text>
        </g>
      ))}
    </svg>
  );
}

export default function PortalPage() {
  const cohort = sampleCohort();
  const st = cohortStats(cohort);
  const money = (n: number) => `$${n.toLocaleString("en-US")}`;

  return (
    <div className={ui.page}>
      <header className={ui.head}>
        <p className={s.sampleBar}>Sample partner portal · 240 synthetic subscribers · nothing is sent</p>
        <h1>Who&rsquo;s about to quit.</h1>
        <p>What a treatment brand sees when its subscribers use edge.wise: who&rsquo;s checking in, who&rsquo;s drifting off before results show, and who&rsquo;s about to run out.</p>
        <div className={ui.row}>
          <Link className="btn btn-ghost" href="/brands">Back to For brands</Link>
        </div>
      </header>

      <section className={s.kpis}>
        <div>
          <span>Active subscribers</span>
          <b className="data">{st.active}</b>
        </div>
        <div>
          <span>Checked in, last 35 days</span>
          <b className="data">{st.checkedIn}%</b>
        </div>
        <div data-tone="crimson">
          <span>At risk of cancelling</span>
          <b className="data">{st.atRisk.length}</b>
          <small>{money(st.revenueAtRisk)} a month</small>
        </div>
        <div data-tone="sun">
          <span>Reorders due in 14 days</span>
          <b className="data">{st.reorders.length}</b>
          <small>about {money(st.reorderValue)}</small>
        </div>
      </section>

      <section className={ui.panel}>
        <h2>The months that matter</h2>
        <p className={ui.sub}>Share of patients still on topical minoxidil, by month, in a 400-patient clinic study. Most of the loss happens before results usually show. That&rsquo;s the window edge.wise is built for; the lift is what a pilot measures.</p>
        <RetentionChart />
        <p className={ui.small}>Dermatology and Therapy, 2023. Points between the reported months are joined with straight lines.</p>
      </section>

      <section className={ui.panel}>
        <h2>Guarantee claims</h2>
        <p className={ui.sub}>
          If you offer a results guarantee, each claim needs standardized photos from set windows, usually graded by hand. edge.wise collects them during the monthly check-ins and hands you the evidence with a measured trend.
        </p>
        <div className={s.kpis}>
          <div>
            <span>Past the last window</span>
            <b className="data">{st.guaranteeDue}</b>
          </div>
          <div data-tone="sun">
            <span>Complete evidence</span>
            <b className="data">{st.evidenceReady}</b>
            <small>{Math.round((st.evidenceReady / Math.max(1, st.guaranteeDue)) * 100)}% of them</small>
          </div>
        </div>
      </section>

      <section className={ui.panel}>
        <h2>At risk now</h2>
        <p className={ui.sub}>Ranked by risk: early in treatment, quiet for weeks, a worrying first reading, or about to run out. Send each one the progress message that fits.</p>
        <ol className={s.riskList}>
          {st.atRisk.slice(0, 8).map((p) => (
            <li key={p.id}>
              <span className={s.riskScore} data-high={p.risk >= 75}>
                <b className="data">{p.risk}</b>
                <small>risk</small>
              </span>
              <span className={s.riskWho}>
                <b>{p.id}</b>
                <small>
                  {treatmentById(p.treatment).name} · month {Math.max(1, Math.round(p.month))} · {VERDICT[p.verdict] ?? p.verdict}
                  {p.change !== null ? ` · ${p.change >= 0 ? "+" : ""}${p.change.toFixed(2)}` : ""}
                </small>
                <span className={s.reasons}>
                  {p.reasons.map((r) => (
                    <i key={r}>{r}</i>
                  ))}
                </span>
              </span>
              <Nudge text={nudgeFor(p)} />
            </li>
          ))}
        </ol>
        <p className={ui.small}>Showing 8 of {st.atRisk.length}. Subscribers see only their own report; the brand sees status and engagement, never photos.</p>
      </section>
    </div>
  );
}
