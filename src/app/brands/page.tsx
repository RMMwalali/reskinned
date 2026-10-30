import type { Metadata } from "next";
import Link from "next/link";
import { RoiCalculator } from "@/components/treatment/RoiCalculator";
import ui from "@/components/ui.module.css";
import s from "@/components/treatment/brands.module.css";

export const metadata: Metadata = { title: "For brands and clinics — edge.wise" };

const STEPS = [
  ["Embed", "Add edge.wise to your app or site with one script, or link subscribers to a page in your colours."],
  ["Subscribers check in monthly", "Two hairline photos. YouCam AI measures density; edge.wise compares it with the subscriber's own starting point."],
  ["They see progress", "Month by month, with the timeline for their treatment, and a nudge through the months when people usually quit."],
  ["They reorder from you", "Run-out reminders and a one-tap shop with your products. Prescription refills route to your prescribers."],
];

const ALTERNATIVES = [
  ["Consumer tracker apps", "Photo logs and rough AI estimates, sold to the subscriber. No link to your product, your shop or your retention.", "Your brand, your shop, your subscribers."],
  ["Brand questionnaires and photo logs", "A month-3 survey or a camera roll. Nothing is measured, so nobody can say whether it's working.", "A measured density reading every month, against their own start."],
  ["In-clinic imaging", "Accurate, but needs hardware and an appointment. Nothing happens between visits.", "At home, on their phone, between visits."],
  ["Building it on YouCam yourself", "The API gives a score. You'd still need the capture protocol, reliability checks, treatment timelines, nudges, guarantee evidence and the portal.", "All of that, ready to embed."],
];

const PILOT = [
  ["Repeatability", "Two takes per check-in for every user. Target: takes agree within ±0.15 in 90% of check-ins."],
  ["Agreement", "A clinician grades a sample of photo pairs (better / same / worse). Target: edge.wise agrees in most of them."],
  ["Retention", "Subscribers offered edge.wise against a matched group without it. Primary measure: still subscribed at month six."],
  ["Revenue", "Reorders placed through the in-app shop, and guarantee claims that arrive with complete evidence."],
];

const PLANS = [
  ["Pilot", "Free", "90 days, up to 500 subscribers. We measure retention against a control group with you."],
  ["Growth", "$1 / active user / month", "Your products in the shop, your branding, monthly retention report."],
  ["Clinic", "$149 / month per clinic", "For PRP and trichology clinics: patient progress reports for review appointments, and rebooking."],
];

export default function BrandsPage() {
  return (
    <div className={ui.page}>
      <header className={ui.head}>
        <h1>Keep subscribers past month six.</h1>
        <p>
          Hair-loss treatment is a subscription business, and its biggest leak is people quitting before results show. edge.wise gives each subscriber a measured, monthly progress report inside your product, with your shop one tap away.
        </p>
        <div className={ui.row}>
          <Link className="btn btn-primary" href="/brands/portal">See the partner portal</Link>
          <Link className="btn btn-ghost" href="/dashboard">Try the subscriber view</Link>
          <Link className="btn btn-ghost" href="/method">How it measures</Link>
        </div>
      </header>

      <section className={s.stats}>
        <div data-tone="crimson">
          <b className="data">86%</b>
          <span>of 400 patients at one clinic stopped topical minoxidil, most within six months.</span>
          <small>Dermatology and Therapy, 2023</small>
        </div>
        <div data-tone="sun">
          <b className="data">6–12 mo</b>
          <span>before minoxidil usually shows results. About 4 months for finasteride.</span>
          <small>American Academy of Dermatology</small>
        </div>
        <div data-tone="teal">
          <b className="data">+45% / +170%</b>
          <span>year-on-year subscriber growth in men&rsquo;s and women&rsquo;s hair loss at Hims &amp; Hers.</span>
          <small>Hims &amp; Hers Q1 2025 shareholder letter</small>
        </div>
      </section>

      <section className={ui.panel}>
        <h2>The gap</h2>
        <p className={ui.sub}>
          Subscribers pay every month for something they can&rsquo;t see working for six. Before-and-after photos taken on a whim, in different light, prove nothing either way. So they cancel, often just before the treatment would have shown results. A measured, consistent monthly reading closes that gap.
        </p>
      </section>

      <section className={ui.panel}>
        <h2>How it works</h2>
        <ol className={s.steps}>
          {STEPS.map(([t, d], i) => (
            <li key={t}>
              <span className="data">0{i + 1}</span>
              <b>{t}</b>
              <p>{d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className={ui.panel}>
        <h2>Why not just…</h2>
        <div className={s.alts}>
          {ALTERNATIVES.map(([a, gap, ours]) => (
            <div key={a}>
              <b>{a}</b>
              <p>{gap}</p>
              <p className={s.ours}>edge.wise: {ours}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={ui.panel}>
        <h2>Results guarantees, automated</h2>
        <p className={ui.sub}>
          Some brands refund customers who see no growth after six months. One US hair-supplement brand&rsquo;s guarantee asks for three sets of standardized photos in set windows (days 1–37, 97–127 and 187–217), with an expert grading them by hand. edge.wise collects those photos in the monthly check-in, flags missing windows before they close, and hands over a measured trend with the evidence.
        </p>
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

      <section className={ui.panel}>
        <h2>What we don&rsquo;t claim</h2>
        <ul className={ui.list}>
          <li>edge.wise is a cosmetic measurement tool, not a medical device. It reports change against the subscriber&rsquo;s own baseline; treatment claims stay with you and your prescribers.</li>
          <li>Density readings come from YouCam&rsquo;s Hair Density Detection. Each check-in takes two photos and flags readings that don&rsquo;t agree.</li>
          <li>Photos are never stored on edge.wise servers. Subscribers own their history and can delete it at any time.</li>
          <li>The retention lift is the number a pilot exists to prove. The calculator above is an illustration.</li>
        </ul>
      </section>
    </div>
  );
}
