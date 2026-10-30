import type { Metadata } from "next";
import { NOISE, STYLES } from "@/lib/edges";
import { TREATMENTS } from "@/lib/treatments";
import { ALL_CREDITS } from "@/lib/photos";
import { TensionMeter } from "@/components/TensionMeter";
import styles from "@/components/ui.module.css";

export const metadata: Metadata = { title: "How it works — edge.wise" };

const PIPELINE = [
  ["YouCam Hair Density Detection ×2", "Two hairline photos, head tilted down", "Hairline density 0–3 per take. edge.wise averages them and uses the gap between them to judge reliability.", "1 unit each"],
  ["YouCam Hair Length Detection", "Front photo (optional)", "Length band. Longer, heavier installs pull harder on the root.", "2 units"],
  ["YouCam Hair Type Detection", "Front + both sides (optional)", "Curl pattern, 1 to 4c, recorded with each check-in.", "2 units"],
  ["edge.wise trend engine", "Your check-in history", "Baseline (median of your first readings), change vs baseline, consecutive declines.", "on device"],
  ["edge.wise treatment model", "Your treatments and start dates", "Where you are against the usual results window: early, holding, working, or time to see your prescriber.", "on device"],
  ["edge.wise tension model", "Styles worn, weeks, extensions, relaxer, symptoms", "Tension load over 6 months, with recent styles weighted more.", "on device"],
  ["YouCam Hairstyle Generator", "Front photo + a gentler style", "You, wearing the lower-tension alternative.", "2 units"],
];

const RULES = [
  ["Down 0.5 or more from your baseline", "Act now, and see a dermatologist"],
  ["Down 0.3 or more, two check-ins in a row", "Act now"],
  ["Down 0.2 or more", "Watch"],
  [`Within ±${NOISE} of baseline`, "Steady: normal photo-to-photo variation"],
  ["YouCam rates density extremely low", "Act now, and see a dermatologist"],
  ["Tension load high (8+)", "Watch. Act if density is also falling"],
  ["Pain, stinging, bumps or tenting after install", "Watch, and loosen the style now"],
  ["Itching or tingling on the crown", "See a dermatologist: can signal a scarring type of hair loss"],
  ["The two takes disagree by more than 0.3", "Reading flagged as unreliable; retake"],
];

export default function MethodPage() {
  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <h1>How it works</h1>
        <p>Every status edge.wise shows comes from a measurement or a published rule. Here is exactly what runs, what decides what, and where it can be wrong.</p>
      </header>

      <section className={styles.panel}>
        <h2>The pipeline</h2>
        <div style={{ display: "grid", gap: 10 }}>
          {PIPELINE.map(([api, input, out, cost]) => (
            <article key={api} style={{ display: "grid", gap: 4, padding: "var(--s-4)", borderRadius: 16, border: "1px solid var(--line)", borderLeft: "4px solid var(--accent)" }}>
              <div className={styles.row} style={{ justifyContent: "space-between" }}>
                <strong>{api}</strong>
                <span className={styles.small}>{cost}</span>
              </div>
              <span className={styles.small}>In: {input}</span>
              <span style={{ color: "var(--ink-2)" }}>{out}</span>
            </article>
          ))}
        </div>
        <p className={styles.small}>A full check-in costs at most 7 YouCam units. The server checks the balance first and switches to a clearly labelled demo reading if it runs out.</p>
      </section>

      <section className={styles.panel}>
        <h2>The rules</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid var(--line)" }} className={styles.label}>If</th>
              <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid var(--line)" }} className={styles.label}>Then</th>
            </tr>
          </thead>
          <tbody>
            {RULES.map(([i, t]) => (
              <tr key={i}>
                <td style={{ padding: 10, borderBottom: "1px solid var(--line)", fontWeight: 600, width: "50%" }}>{i}</td>
                <td style={{ padding: 10, borderBottom: "1px solid var(--line)", color: "var(--ink-2)" }}>{t}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className={styles.panel}>
        <h2>Treatment timelines</h2>
        <p className={styles.sub}>When results usually become visible, which decides whether a flat reading means &ldquo;too early&rdquo; or &ldquo;holding&rdquo;. A fall of 0.2 or more after month 3 sends you to your prescriber.</p>
        <div style={{ display: "grid", gap: 8 }}>
          {TREATMENTS.map((t) => (
            <div key={t.id} style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: 4, paddingBottom: 8, borderBottom: "1px solid var(--line)" }}>
              <span>
                <strong>{t.name}</strong>
                <br />
                <span className={styles.small}>{t.source}</span>
              </span>
              <span className="data" style={{ fontWeight: 700, fontSize: "1.2rem" }}>
                {t.results[0] === t.results[1] ? `${t.results[0]} mo` : `${t.results[0]}–${t.results[1]} mo`}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.panel}>
        <h2>Style tension</h2>
        <p className={styles.sub}>Ranked from the American Academy of Dermatology&rsquo;s guidance and a Johns Hopkins review of hair-care practices. Extensions add weight; relaxed hair and painful installs multiply it.</p>
        <div style={{ display: "grid", gap: 8 }}>
          {STYLES.map((s) => (
            <div key={s.id} style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: 4, paddingBottom: 8, borderBottom: "1px solid var(--line)" }}>
              <span>
                <strong>{s.name}</strong>
                <br />
                <span className={styles.small}>{s.why}</span>
              </span>
              <TensionMeter value={s.tension} />
            </div>
          ))}
        </div>
      </section>

      <section className={styles.panel}>
        <h2>Known limits</h2>
        <ul className={styles.list}>
          <li>edge.wise is a cosmetic tracker, not a medical device. It never names a condition as yours, and it doesn&rsquo;t judge whether a treatment works for you medically; your prescriber does.</li>
          <li>YouCam&rsquo;s density score is coarse (0 to 3). Month-to-month changes are small, so edge.wise looks at the trend across months, not single readings.</li>
          <li>The ±{NOISE} noise band is an assumption until calibrated against repeated real scans. The two-take check exists because of this.</li>
          <li>YouCam&rsquo;s density reading depends on light, angle and how the hair is worn. Compare like with like: same light, hair pushed back.</li>
          <li>Tension weights are a ranking built from published guidance, not a measured force. They decide advice, never a diagnosis.</li>
          <li>Hairstyle try-on shows the look of a style, not how tightly it&rsquo;s installed.</li>
        </ul>
      </section>

      <section className={styles.panel} id="sources">
        <h2>Sources</h2>
        <ul className={styles.list}>
          <li>
            American Academy of Dermatology, <a href="https://www.aad.org/public/diseases/hair-loss/causes/hairstyles" target="_blank" rel="noopener noreferrer">Hairstyles that pull can cause hair loss</a>
          </li>
          <li>
            AAD 74th Annual Meeting survey with the Black Women&rsquo;s Health Study (n = 5,594): 47.6% reported hair loss, 81.4% never saw a doctor. <a href="https://www.sciencedaily.com/releases/2016/03/160304093239.htm" target="_blank" rel="noopener noreferrer">ScienceDaily summary</a>
          </li>
          <li>
            Johns Hopkins review of hair-care practices and traction alopecia, <em>Journal of the American Academy of Dermatology</em>. <a href="https://hub.jhu.edu/2016/05/05/risky-hairstyles-traction-alopecia" target="_blank" rel="noopener noreferrer">JHU Hub summary</a>
          </li>
          <li>
            The Standard (Kenya), <a href="https://www.standardmedia.co.ke/evewoman/living/article/2001523478/struggle-of-traction-alopecia-among-kenyan-women" target="_blank" rel="noopener noreferrer">Struggle of traction alopecia among Kenyan women</a>
          </li>
          <li>
            American Academy of Dermatology, <a href="https://www.aad.org/public/diseases/hair-loss/treatment/diagnosis-treat" target="_blank" rel="noopener noreferrer">Hair loss: diagnosis and treatment</a> (treatment timelines)
          </li>
          <li>
            Compliance to topical minoxidil and reasons for discontinuation among patients with androgenetic alopecia, <em>Dermatology and Therapy</em> 2023 (n = 400; 86.3% discontinued). <a href="https://link.springer.com/article/10.1007/s13555-023-00919-x" target="_blank" rel="noopener noreferrer">Article</a>
          </li>
          <li>
            Hims &amp; Hers, <a href="https://www.sec.gov/Archives/edgar/data/1773751/000177375125000152/finalq12025shareholderle.htm" target="_blank" rel="noopener noreferrer">Q1 2025 shareholder letter</a> (hair-loss subscriber growth)
          </li>
          <li>
            Perfect Corp, <a href="https://docs.perfectcorp.com/reference/ai_hair_density_detection" target="_blank" rel="noopener noreferrer">AI Hair Density Detection API</a>
          </li>
        </ul>
      </section>

      <section className={styles.panel} id="credits">
        <h2>Photo credits</h2>
        <p className={styles.sub}>
          Style and example photos are from <a href="https://www.pexels.com" target="_blank" rel="noopener noreferrer">Pexels</a>, used under the Pexels License. They show hairstyles only. Nobody pictured is shown as having hair loss.
        </p>
        <ul className={styles.list} style={{ columns: 2, columnGap: "var(--s-6)" }}>
          {ALL_CREDITS.map((p) => (
            <li key={p.id} style={{ breakInside: "avoid" }}>
              <a href={`https://www.pexels.com/photo/${p.id}/`} target="_blank" rel="noopener noreferrer">{p.alt}</a>, by {p.by}
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.panel} id="privacy">
        <h2>Privacy</h2>
        <p className={styles.sub}>
          Photos are resized on your phone, sent to YouCam for one check-in, and never written to edge.wise&rsquo;s servers. Your history, plan, and small hairline thumbnails for the side-by-side view live only in your browser, and you can delete them any time. Stylist cards carry only your status and install rules, never photos. There are no accounts and no tracking.
        </p>
      </section>
    </div>
  );
}
