import type { Metadata } from "next";
import Link from "next/link";
import { RoiCalculator } from "@/components/treatment/RoiCalculator";
import ui from "@/components/ui.module.css";
import s from "@/components/treatment/brands.module.css";

export const metadata: Metadata = { title: "For brands and clinics — edge.wise" };

const STACK = [
  ["Hair Density", "Hairline density, two takes"],
  ["Face Analyzer", "Hairline height, a second measure"],
  ["Skin Analysis", "Treatment irritation"],
  ["Hair Frizziness", "Breakage that looks like thinning"],
  ["Hair Length · Hair Type", "Context for every reading"],
  ["Hair Volume · Bangs · Hair Color", "Look fuller while waiting"],
  ["Hairstyle Generator", "Gentler styles for traction"],
];

const ALTERNATIVES = [
  ["Consumer tracker apps", "Not tied to your product or shop."],
  ["Month-3 surveys and photo logs", "Nothing is measured."],
  ["In-clinic imaging", "Hardware, appointments, nothing in between."],
  ["Building on YouCam yourself", "You get a score, not the product around it."],
];

const PILOT = [
  ["Repeatability", "Two takes agree within ±0.15 in 90% of check-ins."],
  ["Agreement", "Matches clinician grading of photo pairs."],
  ["Retention", "Still subscribed at month six, against a control group."],
  ["Revenue", "In-app reorders and complete guarantee claims."],
];

const PLANS = [
  ["Pilot", "Free", "90 days, up to 500 subscribers."],
  ["Growth", "$1 / active user / month", "Your shop, your brand, monthly retention report."],
  ["Clinic", "$149 / month", "Progress reports for review visits."],
];

export default function BrandsPage() {
  return (
    <div className={ui.page}>
      <header className={ui.head}>
        <h1>Keep subscribers past month six.</h1>
        <p>Measured monthly progress inside your product, with your shop one tap away.</p>
        <div className={ui.row}>
          <Link className="btn btn-primary" href="/brands/portal">Partner portal</Link>
          <Link className="btn btn-ghost" href="/dashboard">Subscriber view</Link>
        </div>
      </header>

      <section className={s.stats}>
        <div data-tone="crimson">
          <b className="data">86%</b>
          <span>quit minoxidil, most within six months</span>
        </div>
        <div data-tone="sun">
          <b className="data">6–12 mo</b>
          <span>before minoxidil shows results</span>
        </div>
        <div data-tone="teal">
          <b className="data">$84</b>
          <span>monthly revenue per subscriber at a leading US telehealth brand</span>
        </div>
      </section>

      <section className={ui.panel}>
        <h2>Ten YouCam APIs, one report</h2>
        <ul className={s.stack}>
          {STACK.map(([a, b]) => (
            <li key={a}>
              <b>{a}</b>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className={ui.panel}>
        <h2>Why not just…</h2>
        <div className={s.alts}>
          {ALTERNATIVES.map(([a, gap]) => (
            <div key={a}>
              <b>{a}</b>
              <p>{gap}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={ui.panel}>
        <h2>Guarantee claims, automated</h2>
        <p className={ui.sub}>Photos in the claim windows (days 1–37, 97–127, 187–217) are collected by the monthly check-in, with the measured trend attached.</p>
      </section>

      <section className={ui.panel}>
        <h2>What it&rsquo;s worth</h2>
        <RoiCalculator />
      </section>

      <section className={ui.panel}>
        <h2>What a pilot proves</h2>
        <ol className={s.steps}>
          {PILOT.map(([t, d], i) => (
            <li key={t}>
              <span className="data">0{i + 1}</span>
              <b>{t}</b>
              <p>{d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className={ui.panel}>
        <h2>Pricing</h2>
        <div className={s.plans}>
          {PLANS.map(([n, p, d]) => (
            <div key={n}>
              <b>{n}</b>
              <span className="data">{p}</span>
              <p>{d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
