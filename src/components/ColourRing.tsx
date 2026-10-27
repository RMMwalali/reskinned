import { HAIR_CODES, type HairCode } from "@/lib/codes";
import { hexToLab } from "@/lib/colour";
import styles from "./ColourRing.module.css";

// A fan of hair swatches pinned at one corner, like the ring vendors carry.
// Each swatch's label colour is chosen from its measured lightness so it stays legible.

type Props = { codes?: HairCode[]; highlight?: string; spread?: number; className?: string };

export function ColourRing({ codes = HAIR_CODES, highlight, spread = 110, className }: Props) {
  const n = codes.length;
  const step = spread / Math.max(1, n - 1);
  const start = -spread / 2;
  return (
    <div className={`${styles.ring} ${className ?? ""}`} role="img" aria-label={`Hair colour ring: ${codes.map((c) => c.code).join(", ")}`}>
      {codes.map((c, i) => {
        const light = hexToLab(c.hex).L > 55;
        const isHi = highlight && c.code === highlight;
        return (
          <div
            key={c.code}
            className={`${styles.swatch} ${isHi ? styles.hi : ""}`}
            style={{ "--angle": `${start + i * step}deg`, "--i": i, "--c": c.hex, color: light ? "var(--ebony)" : "var(--pearl)" } as React.CSSProperties}
          >
            <span className={`data ${styles.code}`}>{c.code}</span>
            <span className={`data ${styles.hex}`}>{c.hex}</span>
          </div>
        );
      })}
      <div className={styles.pin} aria-hidden="true" />
    </div>
  );
}
