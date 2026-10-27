import { HAIR_CODES, type HairCode } from "@/lib/codes";
import styles from "./ShadeGrid.module.css";

// Round swatches grouped by colour family. `selected` is the shade in focus,
// `match` marks the shopper's measured match, `available` greys out (with a
// slash) the codes a listing doesn't stock.

const FAMILIES: { key: HairCode["family"]; label: string }[] = [
  { key: "black", label: "Black" },
  { key: "brown", label: "Brown" },
  { key: "auburn", label: "Auburn" },
  { key: "blonde", label: "Blonde" },
  { key: "fashion", label: "Fashion" },
];

type Props = {
  selected?: string;
  match?: string;
  available?: string[];
  onSelect?: (code: string) => void;
  caption?: string;
};

export function ShadeGrid({ selected, match, available, onSelect, caption }: Props) {
  return (
    <div className={styles.grid} role="group" aria-label={caption ?? "Hair colour codes"}>
      {FAMILIES.map((f) => {
        const codes = HAIR_CODES.filter((c) => c.family === f.key);
        if (!codes.length) return null;
        return (
          <div key={f.key} className={styles.family}>
            <p className="label">{f.label}</p>
            <div className={styles.swatches}>
              {codes.map((c) => {
                const stocked = !available || available.includes(c.code);
                const state = [
                  c.code === selected ? styles.selected : "",
                  c.code === match ? styles.match : "",
                  stocked ? "" : styles.unavailable,
                ].join(" ");
                const title = `${c.code} · ${c.name}${c.code === match ? " · your match" : ""}${stocked ? "" : " · not in this listing"}`;
                return onSelect ? (
                  <button
                    key={c.code}
                    type="button"
                    className={`${styles.swatch} ${state}`}
                    style={{ "--c": c.hex } as React.CSSProperties}
                    aria-pressed={c.code === selected}
                    aria-label={title}
                    title={title}
                    onClick={() => onSelect(c.code)}
                  />
                ) : (
                  <span key={c.code} className={`${styles.swatch} ${state}`} style={{ "--c": c.hex } as React.CSSProperties} title={title} aria-label={title} role="img" />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
