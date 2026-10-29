import styles from "./ui.module.css";

/** Five-bar meter for hairline tension, 0–1. */
export function TensionMeter({ value, label = true }: { value: number; label?: boolean }) {
  const bars = Math.max(1, Math.round(value * 5));
  const level = value >= 0.6 ? "high" : value >= 0.35 ? "mid" : "low";
  const words = { high: "High tension", mid: "Medium tension", low: "Low tension" } as const;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <span className={styles.meter} data-level={level} role="img" aria-label={words[level]}>
        {[0, 1, 2, 3, 4].map((i) => (
          <i key={i} data-on={i < bars} />
        ))}
      </span>
      {label ? <small style={{ fontSize: "0.75rem", color: "var(--ink-3)" }}>{words[level]}</small> : null}
    </span>
  );
}
