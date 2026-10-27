import type { Metadata } from "next";
import { HAIR_CODES } from "@/lib/codes";
import { hexToLab } from "@/lib/colour";
import styles from "./method.module.css";

export const metadata: Metadata = { title: "How we measure — Rangi" };

const PIPELINE = [
  {
    api: "YouCam Hair Type Detection",
    input: "Front, right and left photos",
    output: "Curl pattern from 1 to 4c, e.g. “4a to 4b — Kinky Soft to Coily”",
    use: "Mapped to the closest commercial texture: Afro Kinky, Kinky Curly, Kinky Straight and so on. Your leave-out style (natural, stretched, relaxed) adjusts the mapping.",
    units: 2,
  },
  {
    api: "YouCam Hair Length Detection",
    input: "Front photo",
    output: "Length band, from “above the ears” to “long hair”",
    use: "Decides the install. Short leave-outs can't hide tracks, so Rangi recommends a closure or wig instead of a colour match you'd never need.",
    units: 2,
  },
  {
    api: "YouCam Skin Tone Analysis",
    input: "Front photo",
    output: "Hair colour class, plus face lighting quality",
    use: "An independent check on Rangi's colour reading. If YouCam and Rangi disagree, confidence drops and the result says so. Poor lighting lowers confidence too.",
    units: 20,
  },
  {
    api: "Rangi colour engine",
    input: "The pixels you tap",
    output: "Measured hex, uniformity, distance to every code",
    use: "YouCam's hair colour comes in 7 broad classes, too coarse to separate 1 from 1B. So Rangi measures the pixels itself: it drops the brightest and darkest 20% (shine and shadow), averages the rest in linear light, and ranks every code by CIEDE2000 distance.",
    units: 0,
  },
  {
    api: "YouCam Hair Color",
    input: "Front photo + matched hex",
    output: "Your photo with the code's colour on your own hair",
    use: "The visual proof. You judge the blend at the hairline yourself, instead of trusting a vendor's ring-light photo.",
    units: 1,
  },
];

const RULES = [
  ["Two codes within ΔE 1.5 of your sample", "Medium confidence. We name both codes and which to order."],
  ["Best code more than ΔE 8 away", "Lower confidence. Hair may be dyed or the light coloured."],
  ["Tapped area mixes tones (spread > 6)", "Lower confidence. We ask you to tap a flatter patch."],
  ["YouCam's colour class disagrees with Rangi", "Confidence drops two levels. We show both readings."],
  ["YouCam rates the lighting poorly", "Lower confidence. We ask for daylight."],
  ["Side photos missing", "No texture advice, rather than a guess."],
  ["Very dark sample (L* below 14)", "We warn that 1 and 1B differ mostly in warmth, which phone cameras flatten."],
];

export default function MethodPage() {
  const total = PIPELINE.reduce((s, p) => s + p.units, 0);
  return (
    <div className={`wrap ${styles.page}`}>
      <header className={styles.head}>
        <h1>How we measure</h1>
        <p>
          Every number Rangi shows comes from a measurement or a published formula. Here is exactly what runs, what each step decides, and where Rangi can be wrong.
        </p>
      </header>

      <section aria-labelledby="pipe">
        <h2 id="pipe">The pipeline</h2>
        <ol className={styles.pipeline}>
          {PIPELINE.map((p) => (
            <li key={p.api}>
              <div className={styles.pipeHead}>
                <h3>{p.api}</h3>
                <span className="data">{p.units ? `${p.units} unit${p.units > 1 ? "s" : ""}` : "on device"}</span>
              </div>
              <dl>
                <div><dt>In</dt><dd>{p.input}</dd></div>
                <div><dt>Out</dt><dd>{p.output}</dd></div>
                <div><dt>Decides</dt><dd>{p.use}</dd></div>
              </dl>
            </li>
          ))}
        </ol>
        <p className={`data ${styles.cost}`}>
          A full scan plus one try-on costs {total} YouCam units. Rangi checks the account balance before every scan and switches to a clearly labelled demo when the budget runs out.
        </p>
      </section>

      <section aria-labelledby="conf">
        <h2 id="conf">When Rangi is less sure</h2>
        <table className={styles.table}>
          <thead>
            <tr><th scope="col">Condition</th><th scope="col">What happens</th></tr>
          </thead>
          <tbody>
            {RULES.map(([c, w]) => (
              <tr key={c}><td>{c}</td><td>{w}</td></tr>
            ))}
          </tbody>
        </table>
      </section>

      <section aria-labelledby="codes">
        <h2 id="codes">The colour codes</h2>
        <p className={styles.sub}>
          There is no official standard for hair colour codes, so these are Rangi&rsquo;s reference estimates of how each code photographs indoors. Because codes vary by factory, vendor links can carry a colour measured from the vendor&rsquo;s own product photo instead.
        </p>
        <div className={styles.codes}>
          {HAIR_CODES.map((c) => {
            const lab = hexToLab(c.hex);
            return (
              <div key={c.code} className={styles.code}>
                <span className={styles.chip} style={{ background: c.hex }} aria-hidden="true" />
                <p><strong className="data">{c.code}</strong> {c.name}</p>
                <p className="data">{c.hex} · L* {lab.L.toFixed(1)}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="limits">
        <h2 id="limits">Known limits</h2>
        <ul className={styles.limits}>
          <li>Phone cameras auto-adjust white balance, which shifts colour. Daylight and a plain background help most.</li>
          <li>Curly and coily hair shrinks, so measured length can read shorter than your stretched length.</li>
          <li>YouCam Hair Type Detection reports a range (for example 4a to 4b), not a single type. Rangi keeps that range rather than inventing precision.</li>
          <li>The try-on recolours your hair. It shows colour blend at the hairline, not the texture or length of a bundle.</li>
          <li>Rangi&rsquo;s colour maths is unit-tested against published CIEDE2000 reference pairs (Sharma, Wu &amp; Dalal, 2005).</li>
        </ul>
      </section>

      <section aria-labelledby="privacy">
        <h2 id="privacy">Privacy</h2>
        <p className={styles.sub}>
          Photos are resized on your phone, sent to YouCam for one scan, and never written to Rangi&rsquo;s storage. There are no accounts. Vendor links contain only product details. Rangi measures colour and curl. It does not estimate race, ethnicity, age or identity.
        </p>
      </section>
    </div>
  );
}
