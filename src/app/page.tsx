import Link from "next/link";
import { Faq } from "@/components/Faq";
import { StylePhoto } from "@/components/StylePhoto";
import { Motion } from "@/components/topas/Motion";
import { SCENE_PHOTOS, STYLE_PHOTOS, type Photo } from "@/lib/photos";
import s from "@/components/topas/landing.module.css";


type Reading = { name: string; api: string; photo: Photo; position?: string; href: string };

const READINGS: Reading[] = [
  { name: "Hairline density", api: "Hair Density", photo: SCENE_PHOTOS.takeA, position: "50% 30%", href: "/check" },
  { name: "Hairline height", api: "Face Analyzer", photo: STYLE_PHOTOS.out, href: "/check" },
  { name: "Skin irritation", api: "Skin Analysis", photo: STYLE_PHOTOS.twists, href: "/check" },
  { name: "Breakage", api: "Hair Frizziness", photo: SCENE_PHOTOS.side, href: "/check" },
  { name: "Curl pattern", api: "Hair Type", photo: STYLE_PHOTOS["loose-updo"], href: "/check" },
  { name: "Length", api: "Hair Length", photo: STYLE_PHOTOS["sew-in"], href: "/check" },
  { name: "Fuller look", api: "Hair Volume", photo: STYLE_PHOTOS["glueless-wig"], href: "/fuller" },
  { name: "Fringe", api: "Bangs", photo: STYLE_PHOTOS.locs, href: "/fuller" },
  { name: "Colour", api: "Hair Color", photo: STYLE_PHOTOS["box-braids"], href: "/fuller" },
  { name: "Gentler styles", api: "Hairstyle Generator", photo: STYLE_PHOTOS.knotless, href: "/plan" },
];

function Marquee({ words, tone, dir = 1, tilt }: { words: string[]; tone: "crimson" | "cream" | "sun"; dir?: 1 | -1; tilt: number }) {
  // Two copies of the run, so the strip can loop seamlessly at -50%.
  const items = (copy: number) =>
    [...words, ...words].map((w, i) => (
      <span key={`${copy}-${i}`}>
        {w}
        <b aria-hidden="true">✱</b>
      </span>
    ));
  return (
    <div className={s.ribbon} data-tone={tone} style={{ rotate: `${tilt}deg` }} data-marquee={dir}>
      <div className={s.ribbonTrack} data-marquee-track>
        <span className={s.run}>{items(0)}</span>
        <span className={s.run} aria-hidden="true">
          {items(1)}
        </span>
      </div>
    </div>
  );
}

function Wave({ from, to, flip = false }: { from: string; to: string; flip?: boolean }) {
  return (
    <div className={s.wave} style={{ background: from }} aria-hidden="true">
      <svg viewBox="0 0 1440 80" preserveAspectRatio="none" style={flip ? { transform: "scaleX(-1)" } : undefined}>
        <path d="M0 48 C 120 10, 240 10, 360 40 S 600 78, 720 44 S 960 6, 1080 36 S 1320 76, 1440 40 L 1440 80 L 0 80 Z" fill={to} />
      </svg>
    </div>
  );
}

export default function Home() {
  return (
    <Motion className={s.page}>
      {/* ---------------------------------------------------------- Hero */}
      <section className={s.hero} data-hero>
        <div className={s.stripes} aria-hidden="true">
          <i data-stripe />
          <i data-stripe />
          <i data-stripe />
          <i data-stripe />
          <i data-stripe />
        </div>
        <p className={s.word} data-hero-word aria-hidden="true">
          <span data-chars>edge.wise</span>
        </p>

        <div className={`wrap ${s.heroGrid}`}>
          <div className={s.heroPhotoWrap} data-intro>
            <figure className={s.heroPhoto}>
              <StylePhoto photo={SCENE_PHOTOS.takeA} sizes="(max-width: 760px) 40vw, 300px" priority position="50% 40%" />
              <figcaption>Month 1</figcaption>
            </figure>
          </div>

          <div className={s.ticketWrap} data-intro>
            <div className={s.ticket}>
              <h1 className={s.heroTitle}>
                Know if it&rsquo;s <span>working.</span>
              </h1>
              <p className={s.lede}>
                Hair-loss treatments take months. Most people quit first. edge.wise measures your hairline every month, so you can see it working.
              </p>
              <div className={s.ctaRow}>
                <Link href="/check" className="btn btn-primary">Start tracking</Link>
                <Link href="/brands" className="btn btn-ghost">For brands</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className={s.ribbons}>
        <Marquee tone="crimson" tilt={-3} words={["Know if it’s working", "Don’t quit at month three", "Measured, not guessed", "Never run out"]} />
        <Marquee tone="cream" tilt={2} dir={-1} words={["Hair Density", "Face Analyzer", "Skin Analysis", "Hair Frizziness", "Hair Volume", "Bangs", "Hair Color", "Hairstyle Try-On", "Hair Length", "Hair Type", "Built on YouCam AI"]} />
      </div>

      {/* ---------------------------------------------------------- Problem */}
      <section className={s.problem}>
        <div className="wrap">
          <h2 className={s.h2} data-split>
            Month three is where it dies.
          </h2>
          <div className={s.stats}>
            <div className={s.stat} data-tone="sun" data-pop="-8">
              <b className="data">86%</b>
              <span>quit minoxidil, most within six months</span>
            </div>
            <div className={s.stat} data-tone="crimson" data-pop="10">
              <b className="data">6–12 mo</b>
              <span>before it shows results</span>
            </div>
            <div className={s.stat} data-tone="teal" data-pop="-6">
              <b className="data">+170%</b>
              <span>women&rsquo;s hair-loss subscribers, year on year</span>
            </div>
          </div>
        </div>
      </section>

      <Wave from="var(--paper)" to="var(--teal)" />

      {/* ---------------------------------------------------------- How it works (pinned) */}
      <section className={s.steps} data-steps>
        <div className={s.stepsStage} data-steps-stage>
          <div className={`wrap ${s.stepsGrid}`}>
            <div className={s.stepsCopy}>
              <h2 className={s.h2Light}>Four steps. No guesswork.</h2>
              <ol className={s.stepList}>
                {[
                  ["Set your plan", "Your treatments and start dates."],
                  ["Check in monthly", "Hairline density, hairline height, skin and breakage, read by YouCam."],
                  ["See the trend", "On track, holding, working, or see your prescriber."],
                  ["Stay stocked", "Reorders and fixes matched to each reading."],
                ].map(([t, d], i) => (
                  <li key={t} data-step={i}>
                    <span className={`data ${s.stepNum}`}>0{i + 1}</span>
                    <span className={s.stepText}>
                      <b>{t}</b>
                      <span>{d}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            <div className={s.pile} aria-hidden="true">
              {/* 01 — the two takes and a reading */}
              <div className={s.layer} data-layer style={{ rotate: "-5deg", translate: "-8% 4%" }}>
                <div className={s.photoCard}>
                  <StylePhoto photo={SCENE_PHOTOS.takeB} sizes="300px" position="50% 35%" />
                  <span className={s.stamp}>Take B</span>
                </div>
                <span className={s.reading}>
                  Density <b className="data">1.42</b> · takes agree
                </span>
              </div>
              {/* 02 — the trend */}
              <div className={s.layer} data-layer style={{ rotate: "4deg", translate: "12% -14%" }}>
                <div className={s.trendCard}>
                  <span className={s.trendTag}>Working</span>
                  <svg viewBox="0 0 220 110">
                    <rect x="0" y="41" width="220" height="22" fill="var(--lilac)" />
                    <line x1="0" x2="220" y1="52" y2="52" stroke="var(--crimson)" strokeDasharray="5 5" strokeWidth="1.5" />
                    <polyline points="10,52 60,66 110,56 160,36 210,18" fill="none" stroke="var(--ink)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                    {[
                      [10, 52],
                      [60, 66],
                      [110, 56],
                      [160, 36],
                      [210, 18],
                    ].map(([x, y]) => (
                      <circle key={x} cx={x} cy={y} r="6" fill="var(--saffron)" stroke="var(--ink)" strokeWidth="2.5" />
                    ))}
                  </svg>
                  <span className={s.trendFoot}>+0.24 since month 0</span>
                </div>
              </div>
              {/* 03 — the swap */}
              <div className={s.layer} data-layer style={{ rotate: "-3deg", translate: "-4% -30%" }}>
                <div className={s.swapCard}>
                  <b className={s.monthBig}>Month 3</b>
                  <b>On track. Too early for regrowth.</b>
                  <small className={s.monthNote}>This is the stretch when most people quit.</small>
                </div>
              </div>
              {/* 04 — the stylist card */}
              <div className={s.layer} data-layer style={{ rotate: "6deg", translate: "10% -48%" }}>
                <div className={s.miniTicket}>
                  <span>Your routine</span>
                  <b>9 days left</b>
                  <small>Minoxidil 5% foam · Reorder $44</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Wave from="var(--teal)" to="var(--paper)" flip />

      {/* ---------------------------------------------------------- Card rail: every reading */}
      <section className={s.rail} data-rail>
        <div className={`wrap ${s.railHead}`}>
          <h2 className={s.h2}>One check-in. Ten readings.</h2>
        </div>
        <p className={s.ghost} data-ghost aria-hidden="true">
          ten readings · ten readings
        </p>
        <div className={s.track} data-track>
          {READINGS.map((r, i) => (
            <Link key={r.name} href={r.href} className={s.cardSlot} data-low={i % 2 === 1}>
              <span className={`data ${s.cardNum}`}>{String(i + 1).padStart(2, "0")}</span>
              <span className={s.card} data-card={i % 2 ? "odd" : "even"}>
                <span className={s.cardPhoto}>
                  <StylePhoto photo={r.photo} sizes="(max-width: 760px) 70vw, 380px" position={r.position} />
                </span>
                <span className={s.cardApi}>{r.api}</span>
                <span className={s.cardName}>{r.name}</span>
              </span>
            </Link>
          ))}
          <Link href="/check" className={s.railEnd}>
            <span>Start tracking</span>
            <small>two minutes →</small>
          </Link>
        </div>
      </section>

      {/* ---------------------------------------------------------- For brands */}
      <section className={s.stylist}>
        <div className="wrap">
          <h2 className={s.h2Light} data-split>
            Retention they can see.
          </h2>
        </div>
        <div className={s.cloud} aria-label="What edge.wise does for treatment brands">
          <div className={s.cloudRow} data-drift="1">
            <span data-c="w">Proof at month 3</span>
            <span data-c="p">Fewer cancellations</span>
            <span data-c="w">On-time reorders</span>
          </div>
          <div className={s.cloudRow} data-drift="-1">
            <span data-c="p">Your shop inside</span>
            <span data-c="w">Clinic referrals</span>
            <span data-c="p">No medical claims</span>
          </div>
          <div className={s.cloudRow} data-drift="1">
            <span data-c="w">Embed in a day</span>
            <span data-c="p">Guarantee evidence</span>
            <span data-c="w">Skin side effects</span>
          </div>
        </div>
        <div className={`wrap ${s.stylistFoot}`}>
          <div>
            <p className={s.shout}>Keep them past month six!</p>
            <Link href="/brands" className="btn btn-sun">See the numbers</Link>
          </div>
          <div className={s.chatWrap} data-pop="8">
            <div className={s.chat}>
              <p className={s.roiHead}>A brand with 10,000 subscribers at $30 a month</p>
              <p className={s.roiRow}>
                <span>Keep 1 in 10 more past month six</span>
                <b className="data">+1,000</b>
              </p>
              <p className={s.roiRow}>
                <span>× 6 more months × $30</span>
                <b className="data">+$180,000</b>
              </p>
              <p className={s.roiRow}>
                <span>edge.wise at $1 a user a month, 6 months</span>
                <b className="data">−$60,000</b>
              </p>
              <p className={s.roiRow}>
                <span>
                  <b style={{ fontSize: "1rem" }}>Net, in six months</b>
                </span>
                <b className="data">+$120,000</b>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- Honesty + FAQ */}
      <section className={s.honest}>
        <div className="wrap">
          <h2 className={s.h2} data-split>
            What edge.wise won&rsquo;t do
          </h2>
          <div className={s.tickets}>
            {[
              ["Diagnose you", "Your prescriber does that."],
              ["Keep your photos", "They stay on your phone."],
              ["Cry wolf", "Two takes, two measures."],
              ["Sell you a cure", "Only what your plan uses."],
            ].map(([t, d], i) => (
              <div key={t} className={s.honestCard} data-pop={i % 2 ? 7 : -7} data-i={i}>
                <span className="data">0{i + 1}</span>
                <b>{t}</b>
                <p>{d}</p>
              </div>
            ))}
          </div>
          <div className={s.faq}>
            <Faq />
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- Finale */}
      <section className={s.finale}>
        <div className={s.stripes} aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
        <div className={`wrap ${s.finaleInner}`}>
          <h2 className={s.finaleTitle} data-split>
            Don&rsquo;t quit at month three.
          </h2>
          <div className={s.ctaRow}>
            <Link href="/check" className="btn btn-cream">Start tracking</Link>
            <Link href="/brands" className="btn btn-sun">For brands</Link>
          </div>
        </div>
      </section>
    </Motion>
  );
}
