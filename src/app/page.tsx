import Link from "next/link";
import { ColourRing } from "@/components/ColourRing";
import { MatchCard } from "@/components/MatchCard";
import { DEMO_YOUCAM } from "@/lib/demo";
import { matchHair } from "@/lib/match";
import styles from "./page.module.css";

// A worked example, computed by the same engine the real scan uses.
const example = matchHair({ ...DEMO_YOUCAM, sample: { hex: "#271D18", spread: 3.1, n: 412 }, leaveOut: "natural" });

export default function Home() {
  return (
    <>
      <section className={`wrap ${styles.hero}`}>
        <div className={styles.heroText}>
          <h1>Will it blend?</h1>
          <p className={styles.lede}>
            Rangi measures your natural hair (colour, curl pattern and length) and tells you which wig, weave or braiding hair will match it. Then it shows you the colour on your own photo, before you send the money.
          </p>
          <div className={styles.ctas}>
            <Link href="/scan" className="btn btn-primary">Scan my hair</Link>
            <Link href="/vendors" className="btn btn-ghost">I sell hair</Link>
          </div>
          <p className={`data ${styles.spec}`}>3 photos · ~40 seconds · nothing stored</p>
        </div>
        <ColourRing className={styles.heroRing} highlight="1B" />
      </section>

      <section className={`wrap ${styles.problem}`}>
        <h2>You&rsquo;re buying hair from a photo.</h2>
        <div className={styles.problemGrid}>
          <p>
            Most hair in Kenya is bought from a vendor&rsquo;s picture on WhatsApp or Instagram. You guess between <span className="data">1</span>, <span className="data">1B</span> and <span className="data">2</span>, between kinky straight and afro kinky, and find out when it arrives.
          </p>
          <p>
            The codes don&rsquo;t help much. There&rsquo;s no standard, so one factory&rsquo;s <span className="data">1B</span> is another&rsquo;s <span className="data">2</span>. And a leave-out is where a mismatch shows: the line where your hair meets the bundle.
          </p>
        </div>
      </section>

      <section className={`wrap ${styles.how}`} aria-labelledby="how-title">
        <h2 id="how-title">Three photos. Three measurements. One answer.</h2>
        <ol className={styles.steps}>
          <li>
            <span className={`data ${styles.num}`}>1</span>
            <h3>Scan</h3>
            <p>Front, left and right, with your hair down. Rangi checks the light before anything is analysed.</p>
            <p className={`data ${styles.api}`}>YouCam Hair Type Detection · Hair Length Detection</p>
          </li>
          <li>
            <span className={`data ${styles.num}`}>2</span>
            <h3>Measure</h3>
            <p>Tap your hair. Rangi reads those pixels, drops shine and shadow, and compares them with every colour code by CIEDE2000 colour distance.</p>
            <p className={`data ${styles.api}`}>Rangi colour engine · cross-checked by YouCam Skin Tone Analysis</p>
          </li>
          <li>
            <span className={`data ${styles.num}`}>3</span>
            <h3>See it on you</h3>
            <p>Your matched code is painted onto your own hair, so you judge the blend with your eyes, not a vendor&rsquo;s ring light.</p>
            <p className={`data ${styles.api}`}>YouCam Hair Color</p>
          </li>
        </ol>
      </section>

      <section className={`wrap ${styles.example}`} aria-labelledby="example-title">
        <div className={styles.exampleText}>
          <h2 id="example-title">An answer you can check.</h2>
          <p>
            Every recommendation shows the measurement behind it: your sample&rsquo;s colour, its distance to each code, YouCam&rsquo;s independent reading, and why Rangi is or isn&rsquo;t sure.
          </p>
          <p>When two codes are too close to call, Rangi says so. It never rounds a guess up to a fact.</p>
          <Link href="/method">How we measure →</Link>
        </div>
        <MatchCard match={example} demo />
      </section>

      <section className={styles.vendors} aria-labelledby="vendor-title">
        <div className={`wrap ${styles.vendorsInner}`}>
          <div>
            <h2 id="vendor-title">For vendors: one link, fewer returns.</h2>
            <p>
              Photograph a bundle, tap the hair to measure it, and get a <em>Will it blend?</em> link. Paste it in WhatsApp before a customer pays. She scans, sees the verdict for <em>your</em> product, and sends her match straight back to you.
            </p>
            <Link href="/vendors" className="btn btn-primary">Make a blend link</Link>
          </div>
          <div className={styles.chat} aria-label="Example WhatsApp conversation">
            <p className={styles.them}>Hi, is the kinky straight 1B still available? 18 inch</p>
            <p className={styles.me}>
              Yes! Check it blends with your hair first:
              <span className={`data ${styles.link}`}>rangi.app/blend/…</span>
            </p>
            <p className={styles.them}>
              <strong>Rangi:</strong> This will blend. Colour ΔE 2.4 · texture match · score 91
            </p>
          </div>
        </div>
      </section>

      <section className={`wrap ${styles.honest}`} aria-labelledby="honest-title">
        <h2 id="honest-title">What Rangi won&rsquo;t do</h2>
        <ul>
          <li>Store your photos. They are used for one scan and discarded.</li>
          <li>Guess your race, ethnicity or identity. It measures colour and curl, nothing else.</li>
          <li>Hide uncertainty. Dim light, dyed ends or a split reading lower the confidence, and the result says why.</li>
          <li>Pretend codes are standard. Vendor links use the vendor&rsquo;s measured product photo, not just the label.</li>
        </ul>
      </section>
    </>
  );
}
