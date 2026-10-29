import Link from "next/link";
import { CinemaStage } from "@/components/cinema/CinemaStage";
import { HeroPill } from "@/components/cinema/HeroPill";
import { BundleChip, MeasureChip } from "@/components/cinema/LiveChip";
import { ScrollWords } from "@/components/cinema/ScrollWords";
import { Faq } from "@/components/Faq";
import styles from "@/components/cinema/cinema.module.css";

export default function Home() {
  return (
    <div data-fullbleed className={styles.page}>
      <CinemaStage />

      {/* 0 — Hero: the colour ring */}
      <section data-scene="0" className={styles.hero}>
        <div className={`wrap ${styles.heroInner}`}>
          <div className={styles.copy}>
            <h1>
              Hair that
              <br />
              blends.
            </h1>
            <p className={styles.lede}>
              Rangi measures your natural hair and tells you which wig, weave or braiding hair will match it, then shows it on you before you send the money.
            </p>
            <HeroPill />
          </div>
        </div>
        <div className={`wrap ${styles.strip}`}>
          <span>Built on YouCam AI</span>
          <ul>
            <li>Hair Type Detection</li>
            <li>Hair Length Detection</li>
            <li>Skin Tone Analysis</li>
            <li>Hair Color</li>
          </ul>
        </div>
      </section>

      {/* 1 — The problem, read word by word while the bundle changes */}
      <section data-scene="1" className={styles.pinned} style={{ height: "300svh" }}>
        <div className={styles.panelBg} aria-hidden="true" />
        <div className={styles.sticky}>
          <div className={`wrap ${styles.split} ${styles.textRight}`}>
            <div className={styles.copy}>
              <h2>To you, the leave-out is the product.</h2>
              <ScrollWords
                scene={1}
                className={styles.big}
                text="You buy hair from a photo on WhatsApp. You guess between 1, 1B and 2, between kinky straight and afro kinky, and find out when it arrives. Codes have no standard, so one factory's 1B is another's 2. And a mismatch shows exactly where your hair meets the bundle: [[at the hairline.]]"
              />
            </div>
          </div>
          <div className={styles.chipSlot}>
            <BundleChip scene={1} />
          </div>
        </div>
      </section>

      {/* 2 — Three photos */}
      <section data-scene="2" className={styles.pinned} style={{ height: "190svh" }}>
        <div className={styles.sticky}>
          <div className={`wrap ${styles.split}`}>
            <div className={styles.copy}>
              <p className={styles.step}>01 · Scan</p>
              <h2>Three photos.</h2>
              <p className={styles.body}>
                Front, right and left, hair down. Rangi checks your light before anything is sent. Then YouCam reads your curl pattern from all three angles, from straight through to 4C, and how long your hair is.
              </p>
              <p className={styles.api}>YouCam Hair Type Detection · Hair Length Detection</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3 — Measure */}
      <section data-scene="3" className={styles.pinned} style={{ height: "250svh" }}>
        <div className={styles.sticky}>
          <div className={`wrap ${styles.split} ${styles.narrowCopy}`}>
            <div className={styles.copy}>
              <p className={styles.step}>02 · Measure</p>
              <h2>Measured, not guessed.</h2>
              <p className={styles.body}>
                Tap your hair. Rangi reads those pixels, drops the shine and the shadow, and compares what&rsquo;s left with every colour code using CIEDE2000, the standard for how different two colours look. YouCam checks the answer independently.
              </p>
              <MeasureChip scene={3} />
              <p className={styles.api}>Rangi colour engine · YouCam Skin Tone Analysis</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4 — Try it on */}
      <section data-scene="4" className={styles.pinned} style={{ height: "210svh" }}>
        <div className={styles.sticky}>
          <div className={`wrap ${styles.split}`}>
            <div className={styles.copy}>
              <p className={styles.step}>03 · See it on you</p>
              <h2>Your code, on your hair.</h2>
              <p className={styles.body}>
                Your match is painted onto your own photo, next to the runner-up, so you judge the line yourself. When two codes are too close to call, Rangi tells you both, and which to order first.
              </p>
              <p className={styles.api}>YouCam Hair Color</p>
              <Link href="/scan" className="btn btn-primary">Find my match</Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5 — Vendors, honesty, questions */}
      <section data-scene="5" className={styles.vendorScene}>
        <div className={styles.panelBg} aria-hidden="true" />
        <div className={`wrap ${styles.split} ${styles.vendorGrid}`}>
          <div className={styles.copy}>
            <p className={styles.step}>For vendors</p>
            <h2>Sell hair that blends.</h2>
            <p className={styles.body}>
              Photograph a bundle, tap the hair to measure it, and get a product page with a <em>Will it blend?</em> button. Send it before a customer pays. She scans, sees the verdict for your exact bundle, and sends her match straight back to you.
            </p>
            <Link href="/vendors" className="btn btn-primary">Make a blend link</Link>
          </div>
          <div className={styles.chat} aria-label="Example WhatsApp conversation">
            <div className={`${styles.bubble} ${styles.them}`}>Hi, is the kinky straight 1B still available? 18 inch</div>
            <div className={`${styles.bubble} ${styles.me}`}>
              Yes! Check it blends with your hair first
              <span className={styles.linkCard}>
                <i style={{ background: "#221A16" }} />
                <span>
                  <b>Kinky Straight Bundles</b>
                  <small className="data">1B · 18&quot; · KES 4,500</small>
                </span>
                <em>Will it blend?</em>
              </span>
            </div>
            <div className={`${styles.bubble} ${styles.result}`}>
              <b>This will blend.</b>
              <span className="data">91/100 · colour ΔE 2.4 · texture match</span>
            </div>
          </div>
        </div>

        <div className={`wrap ${styles.honest}`}>
          <h2>What Rangi won&rsquo;t do</h2>
          <ul>
            <li><b>Store your photos.</b> They&rsquo;re used for one scan, then discarded.</li>
            <li><b>Guess who you are.</b> It measures colour and curl. Never race, ethnicity or identity.</li>
            <li><b>Hide uncertainty.</b> Dim light or a split reading lowers the confidence, and the result says why.</li>
            <li><b>Trust the label.</b> Vendor links can carry the bundle&rsquo;s measured colour, not just its code.</li>
          </ul>
        </div>

        <div className={`wrap ${styles.faqCard}`}>
          <Faq />
        </div>
      </section>

      {/* 6 — Finale */}
      <section data-scene="6" className={styles.cta}>
        <div className={`wrap ${styles.ctaInner}`}>
          <h2>Will it blend?</h2>
          <p className={styles.lede}>Find out before you send the money.</p>
          <div className={styles.ctaButtons}>
            <Link href="/scan" className="btn btn-primary">Scan my hair</Link>
            <Link href="/method" className="btn btn-ghost">How we measure</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
