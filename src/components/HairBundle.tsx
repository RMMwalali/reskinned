import { hexToRgb, rgbToHex } from "@/lib/colour";
import type { Texture } from "@/lib/match";

// An original illustration of a hair bundle (weft + strands), drawn in the
// product's measured colour. The wave amplitude follows the texture, so
// silky reads straight and afro kinky reads tightly coiled.

const WAVE: Record<Texture, { amp: number; freq: number }> = {
  "Silky Straight": { amp: 0, freq: 1 },
  "Yaki Straight": { amp: 0.6, freq: 9 },
  "Kinky Straight": { amp: 1.4, freq: 11 },
  "Body Wave": { amp: 7, freq: 2.2 },
  "Deep Wave": { amp: 6, freq: 4 },
  "Kinky Curly": { amp: 4, freq: 8 },
  "Afro Kinky Curly": { amp: 3.2, freq: 12 },
  "Afro Kinky": { amp: 2.4, freq: 16 },
};

function shade(hex: string, k: number): string {
  const { r, g, b } = hexToRgb(hex);
  const f = (v: number) => (k >= 0 ? v + (255 - v) * k : v * (1 + k));
  return rgbToHex({ r: f(r), g: f(g), b: f(b) });
}

export function HairBundle({ hex, texture, label }: { hex: string; texture: Texture; label?: string }) {
  const { amp, freq } = WAVE[texture];
  const strands = 26;
  const top = 70;
  const bottom = 430;
  const paths: { d: string; c: string; w: number }[] = [];
  for (let i = 0; i < strands; i++) {
    const x0 = 92 + (i / (strands - 1)) * 216;
    const phase = (i * 1.7) % (Math.PI * 2);
    const sway = (i - strands / 2) * 0.9; // slight fan-out toward the ends
    let d = `M${x0.toFixed(1)} ${top}`;
    for (let y = top + 6; y <= bottom - (i % 5) * 9; y += 6) {
      const t = (y - top) / (bottom - top);
      const x = x0 + sway * t + Math.sin(t * freq * Math.PI * 2 + phase) * amp * (0.6 + t);
      d += ` L${x.toFixed(1)} ${y}`;
    }
    const tone = i % 3 === 0 ? shade(hex, 0.16) : i % 3 === 1 ? hex : shade(hex, -0.22);
    paths.push({ d, c: tone, w: 9 + (i % 4) });
  }
  return (
    <svg viewBox="0 0 400 480" role="img" aria-label={label ?? `Hair bundle, ${texture}, colour ${hex}`} style={{ width: "100%", height: "auto", display: "block" }}>
      <g strokeLinecap="round" fill="none">
        {paths.map((p, i) => (
          <path key={i} d={p.d} stroke={p.c} strokeWidth={p.w} />
        ))}
      </g>
      {/* Weft band */}
      <rect x="78" y="56" width="244" height="26" rx="13" fill={shade(hex, -0.35)} />
      <rect x="78" y="56" width="244" height="8" rx="4" fill={shade(hex, 0.2)} opacity="0.5" />
    </svg>
  );
}
