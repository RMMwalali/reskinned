import Link from "next/link";
import { ColourRing } from "@/components/ColourRing";
import { Faq } from "@/components/Faq";
import { MatchCard } from "@/components/MatchCard";
import { ShadeExplorer } from "@/components/ShadeExplorer";
import { DEMO_YOUCAM } from "@/lib/demo";
import { matchHair } from "@/lib/match";
import styles from "./page.module.css";

// A worked example, computed by the same engine the real scan uses.
const example = matchHair({ ...DEMO_YOUCAM, sample: { hex: "#271D18", spread: 3.1, n: 412 }, leaveOut: "natural" });
example.confidence.level = "medium";
example.confidence.reasons.unshift("Example result built from demo values.");

export default function Home() {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroArt}>
          <span className={`tag ${styles.heroTag}`}>New · Hair match</span>
          <ColourRing className={styles.heroRing} highlight="1B" />
        </div>
        <div className={styles.heroText}>
          <h1>
            Will it <em>blend?</em>
          </h1>
          <p className={styles.lede}>
            Rangi measures your natural hair (colour, curl and length) and tells you which wig, weave or braiding hair will match it. Then it shows the colour on you, before you send the money.
          </p>
          <div className={styles.ctas}>
            <Link href="/scan" className="btn btn-primary">Find my match</Link>
            <Link href="/vendors" className="btn btn-ghost">I sell hair</Link>
          </div>
          <ul className={styles.checks}>
            <li>3 photos, about 40 seconds</li>
            <li>Photos never stored</li>
            <li>Built for 4C to straight</li>
          </ul>
        </div>
      </section>

      <section className={`wrap ${styles.problem}`}>
        <h2>You&rsquo;re buying hair from a photo.</h2>
        <div className={styles.problemGrid}>
          <p>
            Most hair in Kenya is bought from a vendor&rsquo;s picture on WhatsApp or Instagram. You guess between <b>1</b>, <b>1B</b> and <b>2</b>, between kinky straight and afro kinky, and find out when it arrives.
          </p>
          <p>
            The codes don&rsquo;t help much. There&rsquo;s no standard, so one factory&rsquo;s <b>1B</b> is another&rsquo;s <b>2</b>. And a leave-out is exactly where a mismatch shows.
          </p>
        </div>
      </section>

      <section className={`wrap ${styles.explore}`} aria-labelledby="explore-title">
        <h2 id="explore-title">Every code, side by side.</h2>
        <ShadeExplorer />
      </section>

      <section className={styles.band} aria-labelledby="how-title">
        <div className="wrap">
          <h2 id="how-title">Three photos. One answer.</h2>
          <ol className={styles.steps}>
            <li>
              <span className={styles.num}>1</span>
              <h3>Scan</h3>
              <p>Front, left and right, hair down. Rangi checks your light first.</p>
              <p className={styles.api}>YouCam Hair Type + Hair Length Detection</p>
            </li>
            <li>
              <span className={styles.num}>2</span>
              <h3>Measure</h3>
              <p>Tap your hair. Rangi reads those pixels, drops shine and shadow, and finds the nearest code.</p>
              <p className={styles.api}>Rangi colour engine + YouCam Skin Tone Analysis</p>
            </li>
            <li>
              <span className={styles.num}>3</span>
              <h3>See it on you</h3>
              <p>Your match is painted onto your own hair, so you judge the blend yourself.</p>
              <p className={styles.api}>YouCam Hair Color</p>
            </li>
          </ol>
          <Link href="/scan" className="btn btn-primary">Find my match</Link>
        </div>
      </section>

      <section className={`wrap ${styles.example}`} aria-labelledby="example-title">
        <div className={styles.exampleText}>
          <h2 id="example-title">An answer you can check.</h2>
          <p>
            Every result shows the measurement behind it: your hair&rsquo;s colour, its distance to each code, YouCam&rsquo;s independent reading, and why Rangi is or isn&rsquo;t sure.
          </p>
          <p>When two codes are too close to call, Rangi says so. It never rounds a guess up to a fact.</p>
          <Link href="/method">How we measure</Link>
        </div>
        <MatchCard match={example} demo />
      </section>

      <section className={styles.vendors} aria-labelledby="vendor-title">
        <div className={`wrap ${styles.vendorsInner}`}>
          <div>
            <h2 id="vendor-title">Sell hair that blends.</h2>
            <p>
              Photograph a bundle, tap the hair to measure it, and get a product page with a <em>Will it blend?</em> button. Send it on WhatsApp before a customer pays. She scans, sees the verdict for your exact bundle, and sends her match straight back.
            </p>
            <Link href="/vendors" className="btn btn-primary">Make a blend link</Link>
          </div>
          <div className={styles.chat} aria-label="Example WhatsApp conversation">
            <p className={styles.them}>Hi, is the kinky straight 1B still available? 18 inch</p>
            <p className={styles.me}>
              Yes! Check it blends with your hair first:
              <span className={styles.link}>rangi.app/blend/…</span>
            </p>
            <p className={styles.them}>
              <strong>My Rangi result:</strong> This will blend. Score 91/100, colour 1B, texture match.
            </p>
          </div>
        </div>
      </section>

      <section className={`wrap ${styles.faq}`}>
        <Faq />
      </section>

      <section className={`wrap ${styles.honest}`} aria-labelledby="honest-title">
        <h2 id="honest-title">What Rangi won&rsquo;t do</h2>
        <ul>
          <li>Store your photos. They&rsquo;re used for one scan and discarded.</li>
          <li>Guess your race, ethnicity or identity. It measures colour and curl, nothing else.</li>
          <li>Hide uncertainty. Dim light, dyed ends or a split reading lower the confidence, and the result says why.</li>
          <li>Pretend codes are standard. Vendor links can carry the bundle&rsquo;s measured colour, not just the label.</li>
        </ul>
      </section>
    </>
  );
}
