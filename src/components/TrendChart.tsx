import { NOISE, type Trend } from "@/lib/edges";

// Hairline density over time, with the baseline and the noise band around it.
export function TrendChart({ trend }: { trend: Trend }) {
  const pts = trend.points;
  const W = 640;
  const H = 240;
  const pad = { l: 44, r: 18, t: 18, b: 34 };
  const vals = pts.map((p) => p.density).concat(trend.baseline ?? []);
  const lo = Math.max(0, Math.min(...vals) - 0.35);
  const hi = Math.min(3, Math.max(...vals) + 0.35);
  const t0 = new Date(pts[0].date).getTime();
  const t1 = new Date(pts[pts.length - 1].date).getTime();
  const span = Math.max(1, t1 - t0);
  const x = (d: string) => (pts.length === 1 ? (pad.l + W - pad.r) / 2 : pad.l + ((new Date(d).getTime() - t0) / span) * (W - pad.l - pad.r));
  const y = (v: number) => pad.t + (1 - (v - lo) / (hi - lo)) * (H - pad.t - pad.b);
  const fmt = (d: string) => new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short" });
  const ticks = [lo, (lo + hi) / 2, hi];
  const path = pts.map((p, i) => `${i ? "L" : "M"}${x(p.date).toFixed(1)} ${y(p.density).toFixed(1)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Hairline density over ${pts.length} check-ins, latest ${trend.latest.toFixed(2)}${trend.baseline !== null ? `, baseline ${trend.baseline.toFixed(2)}` : ""}`} style={{ width: "100%", height: "auto", display: "block" }}>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="var(--line)" />
          <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="var(--ink-3)">{t.toFixed(1)}</text>
        </g>
      ))}
      {trend.baseline !== null ? (
        <g>
          <rect x={pad.l} width={W - pad.l - pad.r} y={y(trend.baseline + NOISE)} height={y(trend.baseline - NOISE) - y(trend.baseline + NOISE)} fill="var(--lilac)" />
          <line x1={pad.l} x2={W - pad.r} y1={y(trend.baseline)} y2={y(trend.baseline)} stroke="var(--accent)" strokeDasharray="5 5" />
          <text x={W - pad.r} y={y(trend.baseline) - 6} textAnchor="end" fontSize="11" fill="var(--accent)">your baseline</text>
        </g>
      ) : null}
      <path d={path} fill="none" stroke="var(--ink)" strokeWidth="2.5" strokeLinejoin="round" />
      {pts.map((p) => (
        <g key={p.date}>
          <circle cx={x(p.date)} cy={y(p.density)} r="6" fill={p.demo ? "var(--white)" : "var(--ink)"} stroke="var(--ink)" strokeWidth="2" />
          <text x={x(p.date)} y={H - 10} textAnchor="middle" fontSize="11" fill="var(--ink-3)">{fmt(p.date)}</text>
        </g>
      ))}
    </svg>
  );
}
