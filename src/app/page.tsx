import Link from "next/link";
import { CinemaStage } from "@/components/cinema/CinemaStage";
import { HeroPill } from "@/components/cinema/HeroPill";
import { ReadingChip, TensionChip } from "@/components/cinema/LiveChip";
import { ScrollWords } from "@/components/cinema/ScrollWords";
import { Faq } from "@/components/Faq";
import { StylePhoto } from "@/components/StylePhoto";
import { buildCard, demoHistory, encodeCard } from "@/lib/edges";
import { SCENE_PHOTOS } from "@/lib/photos";
import styles from "@/components/cinema/cinema.module.css";

// A sample stylist card for the hero's "I'm a stylist" tab.
const DEMO_CARD = encodeCard(buildCard(demoHistory(new Date("2026-10-29T00:00:00Z")), "Amara"));

export default function Home() {
  return (
    <div data-fullbleed className={styles.page}>
      <CinemaStage />

      {/* 0 — Hero */}
      <section data-scene="0" className={styles.hero}>
        <div className={`wrap ${styles.heroInner}`}>
          <div className={styles.copy}>
            <h1>
              Catch it while
              <br />
              it can grow back.
            </h1>
            <p className={styles.lede}>
              Tight braids, glued wigs and slick buns can slowly pull out your edges. edge.wise tracks your hairline between installs and warns you while the damage is still reversible.
            </p>
            <HeroPill demoCard={DEMO_CARD} />
          </div>
        </div>
        <div className={`wrap ${styles.strip}`}>
          <span>Built on YouCam AI</span>
          <ul>
            <li>Hair Density Detection</li>
            <li>Hair Length Detection</li>
            <li>Hair Type Detection</li>
            <li>Hairstyle Try-On</li>
          </ul>
        </div>
      </section>

      {/* 1 — The problem */}
      <section data-scene="1" className={styles.pinned} style={{ height: "300svh" }}>
        <div className={styles.panelBg} aria-hidden="true" />
        <div className={styles.sticky}>
          <div className={`wrap ${styles.split} ${styles.textRight}`}>
            <div className={styles.copy}>
              <h2>Nobody watches your edges.</h2>
              <ScrollWords
                scene={1}
                className={styles.big}
                text="Every install pulls at the same follicles for six, eight, twelve weeks. You don't feel it until the temples start to go. Early, dermatologists say it can reverse. Late, it's permanent. In a US survey of 5,594 women, 47.6% reported hair loss, and [[81% had never seen a doctor about it.]]"
              />
            </div>
          </div>
          <div className={styles.chipSlot}>
            <TensionChip scene={1} />
          </div>
        </div>
      </section>

      {/* 2 — Check in */}
      <section data-scene="2" className={styles.pinned} style={{ height: "220svh" }}>
        <div className={styles.sticky}>
          <div className={`wrap ${styles.split}`}>
            <div className={styles.copy}>
              <p className={styles.step}>01 · Check in</p>
              <h2>Two photos before every install.</h2>
              <p className={styles.body}>
                Head tilted down, whole hairline in frame. YouCam reads your hairline density from both takes. edge.wise checks they agree, so one bad photo never sets off an alarm.
              </p>
              <ReadingChip scene={2} />
              <p className={styles.api}>YouCam Hair Density · Hair Length · Hair Type Detection</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3 — Track */}
      <section data-scene="3" className={styles.pinned} style={{ height: "240svh" }}>
        <div className={styles.sticky}>
          <div className={`wrap ${styles.split}`}>
            <div className={styles.copy}>
              <p className={styles.step}>02 · Track</p>
              <h2>See the dip before anyone else does.</h2>
              <p className={styles.body}>
                Each check-in is compared with your own baseline, not a stranger&rsquo;s. edge.wise weighs the tension of every style you&rsquo;ve worn and how long it stayed in, and tells you plainly: steady, watch, or act now.
              </p>
              <p className={styles.api}>Your trend · tension load · dermatologist referral when it matters</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4 — Plan */}
      <section data-scene="4" className={styles.pinned} style={{ height: "220svh" }}>
        <div className={styles.sticky}>
          <div className={`wrap ${styles.split}`}>
            <div className={styles.copy}>
              <p className={styles.step}>03 · Plan</p>
              <h2>Same look. Less pull.</h2>
              <p className={styles.body}>
                Want box braids? Knotless, bigger and shorter does the same job with far less tension on your edges. edge.wise ranks gentler options and shows them on you with YouCam&rsquo;s hairstyle try-on.
              </p>
              <p className={styles.api}>Rules from the American Academy of Dermatology</p>
              <Link href="/plan" className="btn btn-primary">Plan a style</Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5 — Stylist, honesty, questions */}
      <section data-scene="5" className={styles.vendorScene}>
        <div className={styles.panelBg} aria-hidden="true" />
        <div className={`wrap ${styles.split} ${styles.vendorGrid}`}>
          <div className={styles.copy}>
            <p className={styles.step}>04 · Share</p>
            <h2>Your stylist is the front line.</h2>
            <p className={styles.body}>
              That&rsquo;s what dermatologists say. So send your braider a card before the appointment: your hairline status, what to avoid, and how to install gently. Stylists who protect edges keep clients for life.
            </p>
            <Link href={`/card/${DEMO_CARD}`} className="btn btn-primary">See a stylist card</Link>
          </div>
          <div className={styles.chat} aria-label="Example conversation with a stylist">
            <span className={styles.chatPhoto}>
              <StylePhoto photo={SCENE_PHOTOS.braiding} sizes="(max-width: 760px) 90vw, 440px" position="50% 35%" />
            </span>
            <div className={`${styles.bubble} ${styles.them}`}>Hi! Can I book knotless for Saturday? Medium, mid-back.</div>
            <div className={`${styles.bubble} ${styles.me}`}>
              Booked. Can you send your edge.wise card first?
              <span className={styles.linkCard}>
                <i style={{ background: "var(--amber)" }} />
                <span>
                  <b>Amara&rsquo;s edges · Watch</b>
                  <small>Leave the hairline out · no glue · out in 6 weeks</small>
                </span>
                <em>Open card</em>
              </span>
            </div>
            <div className={`${styles.bubble} ${styles.result}`}>
              <b>Got it. I&rsquo;ll keep the front loose.</b>
              <span>Mid-back is heavy for your edges. Shoulder length?</span>
            </div>
          </div>
        </div>

        <div className={`wrap ${styles.honest}`}>
          <h2>What edge.wise won&rsquo;t do</h2>
          <ul>
            <li><b>Diagnose you.</b> It tracks change. When it matters, it sends you to a dermatologist.</li>
            <li><b>Keep your photos.</b> They&rsquo;re used for one check-in, then discarded. History stays on your phone.</li>
            <li><b>Cry wolf.</b> Two takes per check-in, and it says when a reading isn&rsquo;t reliable.</li>
            <li><b>Shame your style.</b> Protective styles are fine. It just helps you wear them gently.</li>
          </ul>
        </div>

        <div className={`wrap ${styles.faqCard}`}>
          <Faq />
        </div>
      </section>

      {/* 6 — Finale */}
      <section data-scene="6" className={styles.cta}>
        <div className={`wrap ${styles.ctaInner}`}>
          <h2>Keep your edges.</h2>
          <p className={styles.lede}>Two minutes before your next install.</p>
          <div className={styles.ctaButtons}>
            <Link href="/check" className="btn btn-primary">Check my edges</Link>
            <Link href="/method" className="btn btn-ghost">How it works</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
