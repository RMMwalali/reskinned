import * as THREE from "three";

// Procedural textures drawn on canvas at runtime. No image files, no network.

const FONT = "'Hanken Grotesk Variable', system-ui, sans-serif";

function tex(c: HTMLCanvasElement) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d")!] as const;
}

/** Soft radial glow used behind the focal object. */
export function glowTexture(): THREE.CanvasTexture {
  const [c, g] = canvas(256, 256);
  const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.35, "rgba(255,255,255,0.55)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  return tex(c);
}

/** Hairline photo card (head tilted down), with a take label and a light check. */
export function photoCardTexture(label: string, take: number): THREE.CanvasTexture {
  const w = 520;
  const h = 700;
  const [c, g] = canvas(w, h);
  const bg = g.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, "#ffffff");
  bg.addColorStop(1, "#f1eef6");
  g.fillStyle = bg;
  g.fillRect(0, 0, w, h);
  const px = 26, py = 26, pw = w - 52, ph = h - 150;
  const well = g.createLinearGradient(0, py, 0, py + ph);
  well.addColorStop(0, "#e9e5ef");
  well.addColorStop(1, "#d9d3e2");
  g.fillStyle = well;
  g.beginPath();
  g.roundRect(px, py, pw, ph, 22);
  g.fill();
  g.save();
  g.beginPath();
  g.roundRect(px, py, pw, ph, 22);
  g.clip();
  // Head tilted down: forehead large in frame, hairline arc across the top third.
  const cx = w / 2 + (take === 2 ? 8 : -6);
  const cy = py + ph * 0.62;
  g.fillStyle = "#b8acd0";
  g.beginPath();
  g.ellipse(w / 2, py + ph + 70, 220, 150, 0, Math.PI, 0);
  g.fill();
  g.fillStyle = "#8a5a3e";
  g.beginPath();
  g.ellipse(cx, cy, 150, 190, 0, 0, Math.PI * 2);
  g.fill();
  // Hair mass above the hairline
  let seed = 31 + take * 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  g.fillStyle = "#231914";
  g.beginPath();
  g.ellipse(cx, cy - 150, 200, 120, 0, Math.PI, 0);
  g.fill();
  for (let i = 0; i < 90; i++) {
    const a = Math.PI + rand() * Math.PI;
    const x = cx + Math.cos(a) * (170 + rand() * 40);
    const y = cy - 150 + Math.sin(a) * (100 + rand() * 30);
    g.beginPath();
    g.arc(x, y, 18 + rand() * 18, 0, Math.PI * 2);
    g.fill();
  }
  // Hairline: fine strands along the edge, sparser at the temples
  g.strokeStyle = "#231914";
  g.lineCap = "round";
  for (let i = 0; i < 160; i++) {
    const u = rand() * 2 - 1;
    if (Math.abs(u) > 0.62 && rand() < 0.55) continue;
    const ang = Math.PI * 1.5 + u * 1.1;
    const x = cx + Math.cos(ang) * 150;
    const y = cy - 150 + 70 + Math.sin(ang) * -10 - (1 - u * u) * 26;
    g.lineWidth = 1.2 + rand() * 1.4;
    g.beginPath();
    g.moveTo(x, y + 10);
    g.quadraticCurveTo(x + (rand() - 0.5) * 8, y - 6, x + (rand() - 0.5) * 10, y - 20);
    g.stroke();
  }
  // Scan arc highlight on the hairline
  g.strokeStyle = "rgba(91,63,176,0.9)";
  g.lineWidth = 5;
  g.setLineDash([12, 10]);
  g.beginPath();
  g.ellipse(cx, cy - 72, 165, 70, 0, Math.PI * 1.05, Math.PI * 1.95);
  g.stroke();
  g.setLineDash([]);
  g.restore();
  // Label row
  g.fillStyle = "#17151b";
  g.font = `600 34px ${FONT}`;
  g.textBaseline = "middle";
  g.fillText(label, 34, h - 66);
  g.fillStyle = "#e3f2ea";
  g.beginPath();
  g.roundRect(w - 196, h - 90, 164, 48, 24);
  g.fill();
  g.fillStyle = "#1e7a4e";
  g.font = `600 24px ${FONT}`;
  g.fillText("✓ Light even", w - 178, h - 66);
  return tex(c);
}

/** Face of the density gauge. */
export function gaugeTexture(): THREE.CanvasTexture {
  const [c, g] = canvas(512, 512);
  g.textAlign = "center";
  g.fillStyle = "#17151b";
  g.font = `400 150px 'Fraunces Variable', Georgia, serif`;
  g.fillText("2.31", 256, 280);
  g.font = `500 34px ${FONT}`;
  g.fillStyle = "#6b6773";
  g.fillText("hairline density / 3", 256, 340);
  return tex(c);
}

/** A small text label for 3D bars and chart points. */
export function labelTexture(text: string, sub?: string, colour = "#17151b"): THREE.CanvasTexture {
  const [c, g] = canvas(512, 160);
  g.textAlign = "center";
  g.fillStyle = colour;
  g.font = `600 52px ${FONT}`;
  g.fillText(text, 256, sub ? 70 : 96);
  if (sub) {
    g.fillStyle = "#6b6773";
    g.font = `500 36px ${FONT}`;
    g.fillText(sub, 256, 124);
  }
  return tex(c);
}
