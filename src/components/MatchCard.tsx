import type { MatchResult } from "@/lib/match";
import { ShadeGrid } from "./ShadeGrid";
import styles from "./MatchCard.module.css";

const LEVEL_COPY = { high: "High confidence", medium: "Medium confidence", low: "Low confidence" } as const;

export function MatchCard({ match, demo }: { match: MatchResult; demo?: boolean }) {
  const { colour, texture, install, confidence } = match;
  return (
    <article className={styles.card} aria-label="Your hair match">
      <div className={styles.spine} aria-hidden="true">
        <span style={{ background: colour.sampleHex }} />
        <span style={{ background: colour.best.hex }} />
        <span style={{ background: colour.runnerUp.hex }} />
      </div>

      <div className={styles.body}>
        <header className={styles.head}>
          <p className={styles.kicker}>Your match{demo ? <span className="tag">Demo values</span> : null}</p>
          <span className={`${styles.conf} ${styles[confidence.level]}`}>{LEVEL_COPY[confidence.level]}</span>
        </header>

        <div className={styles.row}>
          <div>
            <p className={styles.label}>Colour</p>
            <p className={styles.big}>
              <span className="data">{colour.best.code}</span> {colour.best.name}
            </p>
            <p className={styles.note}>{colour.note}</p>
            <div className={styles.grid}>
              <ShadeGrid selected={colour.best.code} match={colour.best.code} caption="Where your match sits among the codes" />
            </div>
          </div>
          <dl className={`data ${styles.readout}`}>
            <div><dt>Your sample</dt><dd><i style={{ background: colour.sampleHex }} />{colour.sampleHex}</dd></div>
            <div><dt>{colour.best.code}</dt><dd><i style={{ background: colour.best.hex }} />ΔE {colour.best.deltaE.toFixed(1)}</dd></div>
            <div><dt>{colour.runnerUp.code}</dt><dd><i style={{ background: colour.runnerUp.hex }} />ΔE {colour.runnerUp.deltaE.toFixed(1)}</dd></div>
            {colour.apiHairColorName ? (
              <div><dt>YouCam says</dt><dd>{colour.apiHairColorName} {colour.apiAgrees ? "✓ agrees" : "✗ disagrees"}</dd></div>
            ) : null}
          </dl>
        </div>

        <div className={styles.row}>
          <div>
            <p className={styles.label}>Texture</p>
            {texture ? (
              <>
                <p className={styles.big}>{texture.primary}</p>
                <p className={styles.note}>
                  {texture.why}
                  {texture.alt ? ` ${texture.alt} also works.` : ""}
                </p>
              </>
            ) : (
              <p className={styles.note}>Not measured. Add left and right photos to check your curl pattern.</p>
            )}
          </div>
        </div>

        {install ? (
          <div className={styles.row}>
            <div>
              <p className={styles.label}>Best install</p>
              <p className={styles.big}>{install.install}</p>
              <p className={styles.note}>{install.detail}</p>
            </div>
          </div>
        ) : null}

        <div className={styles.why}>
          <p className={styles.label}>Why this confidence</p>
          <ul>
            {confidence.reasons.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}
