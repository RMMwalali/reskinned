import Link from "next/link";
import { Faq } from "@/components/Faq";
import { StylePhoto } from "@/components/StylePhoto";
import { Motion } from "@/components/topas/Motion";
import { buildCard, demoHistory, encodeCard, STYLES, type StyleId } from "@/lib/edges";
import { SCENE_PHOTOS, STYLE_PHOTOS } from "@/lib/photos";
import s from "@/components/topas/landing.module.css";

// A sample stylist card, so visitors can see what a braider receives.
const DEMO_CARD = encodeCard(buildCard(demoHistory(new Date("2026-10-29T00:00:00Z")), "Amara"));

const SHORT: Record<StyleId, string> = {
  out: "Out & natural",
  "loose-updo": "Loose updo",
  "glueless-wig": "Glueless wig",
  twists: "Twists",
  knotless: "Knotless",
  locs: "Locs",
  "sew-in": "Sew-in",
  "box-braids": "Box braids",
  "tight-ponytail": "Slick bun",
  cornrows: "Cornrows",
  "glued-wig": "Glued lace",
};

const level = (t: number) => (t >= 0.6 ? "high" : t >= 0.35 ? "mid" : "low");
const LEVEL_WORD = { low: "Low pull", mid: "Medium pull", high: "High pull" } as const;

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
              <figcaption>Take A · head down</figcaption>
            </figure>
            <p className={s.script} aria-hidden="true">two photos, two minutes!</p>
          </div>

          <div className={s.ticketWrap} data-intro>
            <div className={s.ticket}>
              <p className={s.kicker}>Hairline tracker · built on YouCam AI</p>
              <h1 className={s.heroTitle}>
                Catch it while it can <span>grow back.</span>
              </h1>
              <p className={s.lede}>
                Tight braids, glued wigs and slick buns can slowly pull out your edges. edge.wise tracks your hairline between installs and warns you while the damage is still reversible.
              </p>
              <div className={s.ctaRow}>
                <Link href="/check" className="btn btn-primary">Check my edges</Link>
                <Link href={`/card/${DEMO_CARD}`} className="btn btn-ghost">I&rsquo;m a stylist</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className={s.ribbons}>
        <Marquee tone="crimson" tilt={-3} words={["Keep your edges", "Catch it early", "Same look, less pull", "Tell your braider"]} />
        <Marquee tone="cream" tilt={2} dir={-1} words={["Hair Density Detection", "Hair Length Detection", "Hair Type Detection", "Hairstyle Try-On", "Built on YouCam AI"]} />
      </div>

      {/* ---------------------------------------------------------- Problem */}
      <section className={s.problem}>
        <div className="wrap">
          <p className={s.label}>The problem</p>
          <h2 className={s.h2} data-split>
            Nobody watches your edges.
          </h2>
          <p className={s.body}>
            Every install pulls at the same follicles for weeks. You don&rsquo;t feel it until the temples start to go. Caught early, dermatologists say traction hair loss can reverse. Left too long, it scars and it&rsquo;s permanent.
          </p>
          <div className={s.stats}>
            <div className={s.stat} data-tone="sun" data-pop="-8">
              <b className="data">47.6%</b>
              <span>of 5,594 US women surveyed reported hair loss</span>
            </div>
            <div className={s.stat} data-tone="crimson" data-pop="10">
              <b className="data">81%</b>
              <span>of them never saw a doctor about it</span>
            </div>
            <div className={s.stat} data-tone="teal" data-pop="-6">
              <b className="data">6–12 wk</b>
              <span>that one install pulls on the same roots</span>
            </div>
          </div>
          <p className={s.scriptInk} aria-hidden="true">early, it grows back. late, it doesn&rsquo;t.</p>
          <p className={s.source}>
            Survey: AAD 74th Annual Meeting with the Black Women&rsquo;s Health Study. <Link href="/method#sources">Sources</Link>
          </p>
        </div>
      </section>

      <Wave from="var(--paper)" to="var(--teal)" />

      {/* ---------------------------------------------------------- How it works (pinned) */}
      <section className={s.steps} data-steps>
        <div className={s.stepsStage} data-steps-stage>
          <div className={`wrap ${s.stepsGrid}`}>
            <div className={s.stepsCopy}>
              <p className={s.labelLight}>How edge.wise works</p>
              <h2 className={s.h2Light}>Four steps. No guesswork.</h2>
              <ol className={s.stepList}>
                {[
                  ["Check in", "Two hairline photos before every install, head tilted down. YouCam reads density from both and edge.wise checks they agree."],
                  ["Track", "Each reading is compared with your own baseline and the tension of every style you’ve worn. Steady, watch or act now."],
                  ["Plan", "Want box braids? Knotless, bigger and shorter does the same job with less pull. Try it on with YouCam."],
                  ["Share", "Send your braider a card: your status, what to avoid and how to install gently."],
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
                  Density <b className="data">2.31</b> · takes agree
                </span>
              </div>
              {/* 02 — the trend */}
              <div className={s.layer} data-layer style={{ rotate: "4deg", translate: "12% -14%" }}>
                <div className={s.trendCard}>
                  <span className={s.trendTag}>Watch</span>
                  <svg viewBox="0 0 220 110">
                    <rect x="0" y="24" width="220" height="22" fill="var(--lilac)" />
                    <line x1="0" x2="220" y1="35" y2="35" stroke="var(--crimson)" strokeDasharray="5 5" strokeWidth="1.5" />
                    <polyline points="10,34 60,38 110,52 160,70 210,60" fill="none" stroke="var(--ink)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                    {[
                      [10, 34],
                      [60, 38],
                      [110, 52],
                      [160, 70],
                      [210, 60],
                    ].map(([x, y]) => (
                      <circle key={x} cx={x} cy={y} r="6" fill="var(--saffron)" stroke="var(--ink)" strokeWidth="2.5" />
                    ))}
                  </svg>
                  <span className={s.trendFoot}>−0.24 since your baseline</span>
                </div>
              </div>
              {/* 03 — the swap */}
              <div className={s.layer} data-layer style={{ rotate: "-3deg", translate: "-4% -30%" }}>
                <div className={s.swapCard}>
                  <span className={s.swapPhoto}>
                    <StylePhoto photo={STYLE_PHOTOS["box-braids"]} sizes="140px" />
                  </span>
                  <span className={s.swapArrow}>→</span>
                  <span className={s.swapPhoto}>
                    <StylePhoto photo={STYLE_PHOTOS.knotless} sizes="140px" />
                  </span>
                  <b>Box braids → knotless, bigger, shorter</b>
                </div>
              </div>
              {/* 04 — the stylist card */}
              <div className={s.layer} data-layer style={{ rotate: "6deg", translate: "10% -48%" }}>
                <div className={s.miniTicket}>
                  <span>Amara&rsquo;s edges</span>
                  <b>Watch</b>
                  <small>Leave the hairline out · No glue · Out in 6 weeks</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Wave from="var(--teal)" to="var(--paper)" flip />

      {/* ---------------------------------------------------------- Card rail */}
      <section className={s.rail} data-rail>
        <div className={`wrap ${s.railHead}`}>
          <p className={s.label}>Plan a style</p>
          <h2 className={s.h2}>Same look. Less pull.</h2>
          <p className={s.railSub}>Eleven styles, ranked from the gentlest to the hardest on your edges. Pick one to plan it.</p>
        </div>
        <p className={s.ghost} data-ghost aria-hidden="true">
          less pull · less pull
        </p>
        <div className={s.track} data-track>
          {STYLES.map((st, i) => {
            const lv = level(st.tension);
            return (
              <Link key={st.id} href={`/plan?want=${st.id}`} className={s.cardSlot} data-low={i % 2 === 1}>
                <span className={`data ${s.cardNum}`}>{String(i + 1).padStart(2, "0")}</span>
                <span className={s.card} data-card={i % 2 ? "odd" : "even"}>
                  <span className={s.cardPhoto}>
                    <StylePhoto photo={STYLE_PHOTOS[st.id]} sizes="(max-width: 760px) 70vw, 380px" />
                  </span>
                  <span className={s.cardPull} data-level={lv}>
                    {LEVEL_WORD[lv]}
                  </span>
                  <span className={s.cardName}>{SHORT[st.id]}</span>
                </span>
              </Link>
            );
          })}
          <Link href="/plan" className={s.railEnd}>
            <span>Plan your next style</span>
            <small>with try-on →</small>
          </Link>
        </div>
      </section>

      {/* ---------------------------------------------------------- Stylist */}
      <section className={s.stylist}>
        <div className="wrap">
          <p className={s.labelSun}>For your braider</p>
          <h2 className={s.h2Light} data-split>
            Your stylist is the front line.
          </h2>
        </div>
        <div className={s.cloud} aria-label="What the stylist card asks for">
          <div className={s.cloudRow} data-drift="1">
            <span data-c="w">Edges out</span>
            <span data-c="p">No glue</span>
            <span data-c="w">Bigger parts</span>
            <span data-c="p">Lighter hair</span>
            <span data-c="w">Edges out</span>
          </div>
          <div className={s.cloudRow} data-drift="-1">
            <span data-c="p">If it hurts, loosen it</span>
            <span data-c="w">Out in 6 weeks</span>
            <span data-c="p">Shoulder length</span>
          </div>
          <div className={s.cloudRow} data-drift="1">
            <span data-c="w">No tight buns</span>
            <span data-c="p">Change the parting</span>
            <span data-c="w">Rest weeks</span>
            <span data-c="p">No glue</span>
          </div>
        </div>
        <div className={`wrap ${s.stylistFoot}`}>
          <div>
            <p className={s.shout}>Send the card!</p>
            <p className={s.stylistBody}>
              Dermatologists say stylists are often the first to see thinning. Before the appointment, send your braider a card with your hairline status and how to install gently. It carries no photos.
            </p>
            <Link href={`/card/${DEMO_CARD}`} className="btn btn-sun">See a stylist card</Link>
          </div>
          <div className={s.chatWrap} data-pop="8">
            <div className={s.chat}>
              <p className={s.them}>Hi! Can I book knotless for Saturday? Medium, mid-back.</p>
              <p className={s.me}>Booked. Can you send your edge.wise card first?</p>
              <p className={s.them}>
                <b>Got it. I&rsquo;ll keep the front loose.</b> Mid-back is heavy for your edges. Shoulder length?
              </p>
            </div>
            <p className={s.scriptSun} aria-hidden="true">she&rsquo;ll thank you</p>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- Honesty + FAQ */}
      <section className={s.honest}>
        <div className="wrap">
          <p className={s.label}>Straight talk</p>
          <h2 className={s.h2} data-split>
            What edge.wise won&rsquo;t do
          </h2>
          <div className={s.tickets}>
            {[
              ["Diagnose you", "It tracks change. When it matters, it sends you to a dermatologist."],
              ["Keep your photos", "Used for one check-in, then discarded. Your history stays on your phone."],
              ["Cry wolf", "Two takes per check-in. It tells you when a reading isn’t reliable."],
              ["Shame your style", "Protective styles are fine. It helps you wear them gently."],
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
            Keep your edges.
          </h2>
          <p className={s.scriptWhite}>two minutes before your next install</p>
          <div className={s.ctaRow}>
            <Link href="/check" className="btn btn-cream">Check my edges</Link>
            <Link href="/method" className="btn btn-sun">How it works</Link>
          </div>
        </div>
      </section>
    </Motion>
  );
}
