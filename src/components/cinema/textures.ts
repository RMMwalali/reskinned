import * as THREE from "three";
import { hexToLab } from "@/lib/colour";

// Procedural textures drawn on canvas. No image files, no network.

function shade(hex: string, k: number): string {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(k >= 0 ? v + (255 - v) * k : v * (1 + k)));
  return `rgb(${ch[0]},${ch[1]},${ch[2]})`;
}

/** Face of a hair swatch card: the code colour, fine strands, and its label. */
export function swatchTexture(hex: string, code: string, name: string): THREE.CanvasTexture {
  const w = 256;
  const h = 1024;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  g.fillStyle = hex;
  g.fillRect(0, 0, w, h);
  // Strands: thin vertical streaks with gentle drift, lighter and darker than the base.
  let seed = code.split("").reduce((s, ch) => s + ch.charCodeAt(0), 7);
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 260; i++) {
    const x = rand() * w;
    const drift = (rand() - 0.5) * 18;
    g.strokeStyle = shade(hex, rand() > 0.5 ? 0.08 + rand() * 0.14 : -0.1 - rand() * 0.2);
    g.globalAlpha = 0.35 + rand() * 0.4;
    g.lineWidth = 0.6 + rand() * 1.6;
    g.beginPath();
    g.moveTo(x, 150);
    g.bezierCurveTo(x + drift, h * 0.4, x - drift, h * 0.7, x + drift * 0.5, h);
    g.stroke();
  }
  g.globalAlpha = 1;
  // Sheen band, like light catching hair.
  const sheen = g.createLinearGradient(0, h * 0.25, 0, h * 0.5);
  sheen.addColorStop(0, "rgba(255,255,255,0)");
  sheen.addColorStop(0.5, "rgba(255,255,255,0.14)");
  sheen.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = sheen;
  g.fillRect(0, h * 0.25, w, h * 0.25);
  // Label tab.
  const light = hexToLab(hex).L > 55;
  g.fillStyle = light ? "rgba(23,21,27,0.86)" : "rgba(255,255,255,0.92)";
  g.font = "600 64px 'Hanken Grotesk Variable', system-ui, sans-serif";
  g.textAlign = "center";
  g.fillText(code, w / 2, 96);
  g.font = "500 20px 'Hanken Grotesk Variable', system-ui, sans-serif";
  g.globalAlpha = 0.7;
  g.fillText(name.toUpperCase(), w / 2, 128);
  g.fillText(hex, w / 2, h - 40);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/** Circular caption that orbits the colour orb. */
export function ringTexture(text: string): THREE.CanvasTexture {
  const s = 1024;
  const c = document.createElement("canvas");
  c.width = s;
  c.height = s;
  const g = c.getContext("2d")!;
  g.translate(s / 2, s / 2);
  g.fillStyle = "rgba(23,21,27,0.72)";
  g.font = "500 38px 'Hanken Grotesk Variable', system-ui, sans-serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  const r = s / 2 - 46;
  const chars = text.split("");
  const step = (Math.PI * 2) / chars.length;
  chars.forEach((ch, i) => {
    g.save();
    g.rotate(i * step);
    g.translate(0, -r);
    g.fillText(ch, 0, 0);
    g.restore();
  });
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/** A frosted photo card showing one capture angle (front, right, left). */
export function photoCardTexture(view: "front" | "right" | "left", label: string): THREE.CanvasTexture {
  const w = 520;
  const h = 700;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  // Card
  const bg = g.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, "#ffffff");
  bg.addColorStop(1, "#f1eef6");
  g.fillStyle = bg;
  g.fillRect(0, 0, w, h);
  // Photo well
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
  const cx = w / 2 + (view === "right" ? 26 : view === "left" ? -26 : 0);
  const cy = py + ph * 0.42;
  // Shoulders
  g.fillStyle = "#b8acd0";
  g.beginPath();
  g.ellipse(w / 2, py + ph + 40, 190, 150, 0, Math.PI, 0);
  g.fill();
  // Neck
  g.fillStyle = "#7d4f36";
  g.fillRect(cx - 34, cy + 70, 68, 110);
  // Hair: a soft coily cloud
  let seed = view.length * 97 + 13;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  g.fillStyle = "#241a15";
  for (let i = 0; i < 70; i++) {
    const a = rand() * Math.PI * 2;
    const rr = 95 + rand() * 45;
    const x = cx + Math.cos(a) * rr * (view === "front" ? 1 : 0.9) - (view === "right" ? 22 : view === "left" ? -22 : 0) * (Math.cos(a) < 0 ? 1 : 0.3);
    const y = cy - 20 + Math.sin(a) * rr * 0.92;
    if (y > cy + 70) continue;
    g.beginPath();
    g.arc(x, y, 30 + rand() * 26, 0, Math.PI * 2);
    g.fill();
  }
  // Face
  g.fillStyle = "#8a5a3e";
  g.beginPath();
  g.ellipse(cx + (view === "front" ? 0 : view === "right" ? 18 : -18), cy + 18, view === "front" ? 72 : 60, 92, 0, 0, Math.PI * 2);
  g.fill();
  if (view === "front") {
    g.fillStyle = "#2a1d17";
    g.beginPath();
    g.arc(cx - 26, cy + 8, 6, 0, Math.PI * 2);
    g.arc(cx + 26, cy + 8, 6, 0, Math.PI * 2);
    g.fill();
  }
  g.restore();
  // Framing guides
  g.strokeStyle = "rgba(255,255,255,0.95)";
  g.lineWidth = 5;
  g.lineCap = "round";
  const m = 52;
  [[px + m, py + m, 1, 1], [px + pw - m, py + m, -1, 1], [px + m, py + ph - m, 1, -1], [px + pw - m, py + ph - m, -1, -1]].forEach(([x, y, dx, dy]) => {
    g.beginPath();
    g.moveTo(x, y + 34 * dy);
    g.lineTo(x, y);
    g.lineTo(x + 34 * dx, y);
    g.stroke();
  });
  // Label row
  g.fillStyle = "#17151b";
  g.font = "600 34px 'Hanken Grotesk Variable', system-ui, sans-serif";
  g.textBaseline = "middle";
  g.fillText(label, 34, h - 66);
  g.fillStyle = "#e3f2ea";
  g.beginPath();
  g.roundRect(w - 196, h - 90, 164, 48, 24);
  g.fill();
  g.fillStyle = "#1e7a4e";
  g.font = "600 24px 'Hanken Grotesk Variable', system-ui, sans-serif";
  g.fillText("✓ Light even", w - 178, h - 66);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/** Soft radial glow used behind the focal object. */
export function glowTexture(): THREE.CanvasTexture {
  const s = 256;
  const c = document.createElement("canvas");
  c.width = s;
  c.height = s;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.35, "rgba(255,255,255,0.55)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, s, s);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Round soft dot for particles. */
export function dotTexture(): THREE.CanvasTexture {
  const s = 64;
  const c = document.createElement("canvas");
  c.width = s;
  c.height = s;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.5, "rgba(255,255,255,0.8)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, s, s);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
