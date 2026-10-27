import { findCode } from "@/lib/codes";
import type { BlendVerdict, MatchResult, Product } from "@/lib/match";
import styles from "./VerdictCard.module.css";

export function VerdictCard({ product, verdict, match }: { product: Product; verdict: BlendVerdict; match: MatchResult }) {
  const productHex = product.measuredHex ?? findCode(product.code)?.hex ?? "#222";
  const waText = encodeURIComponent(
    `Hi ${product.vendor || ""}, I checked "${product.name}" on Rangi.\n` +
      `Verdict: ${verdict.headline} (score ${verdict.score}/100)\n` +
      `My match: colour ${match.colour.best.code}` +
      (match.texture ? `, texture ${match.texture.primary}` : "") +
      (match.install ? `, install ${match.install.install}` : "") +
      `.\nConfidence: ${match.confidence.level}.`,
  );

  return (
    <article className={`${styles.card} ${styles[verdict.verdict]}`} aria-label="Will it blend verdict">
      <div className={styles.top}>
        <div className={styles.swatches} aria-hidden="true">
          <span style={{ background: match.colour.sampleHex }} title="Your hair" />
          <span style={{ background: productHex }} title="This product" />
        </div>
        <div>
          <p className={styles.product}>
            {product.name}
            {product.vendor ? <span> · {product.vendor}</span> : null}
          </p>
          <h2 className={styles.headline}>{verdict.headline}</h2>
        </div>
        <p className={`data ${styles.score}`} aria-label={`Blend score ${verdict.score} out of 100`}>
          {verdict.score}
          <small>/100</small>
        </p>
      </div>
      <ul className={styles.lines}>
        {verdict.lines.map((l) => (
          <li key={l}>{l}</li>
        ))}
      </ul>
      <p className={`data ${styles.meta}`}>
        {product.code} · {product.texture}
        {product.inches ? ` · ${product.inches}"` : ""}
        {product.priceKes ? ` · KES ${product.priceKes.toLocaleString("en-KE")}` : ""}
      </p>
      {product.whatsapp ? (
        <a className="btn btn-primary" href={`https://wa.me/${product.whatsapp}?text=${waText}`} target="_blank" rel="noopener noreferrer">
          Send my match to {product.vendor || "the vendor"} on WhatsApp
        </a>
      ) : null}
    </article>
  );
}
