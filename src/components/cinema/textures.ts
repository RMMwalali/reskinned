import * as THREE from "three";

// Textures drawn on canvas at runtime. Photos load from our own origin (through
// Next's image optimiser) so WebGL can use them.

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

/**
 * A photo card: real hairline photo in a rounded well, a dashed scan arc over
 * the hairline, and a label row. Returns immediately with a placeholder and
 * redraws when the photo arrives.
 */
export function photoCardTexture(label: string, reading: string, src: string, focusY = 0.3): THREE.CanvasTexture {
  const w = 600;
  const h = 800;
  const [c, g] = canvas(w, h);
  const px = 24, py = 24, pw = w - 48, ph = h - 150;
  const t = tex(c);

  const frame = (img?: HTMLImageElement) => {
    g.clearRect(0, 0, w, h);
    g.fillStyle = "#ffffff";
    g.fillRect(0, 0, w, h);
    g.save();
    g.beginPath();
    g.roundRect(px, py, pw, ph, 24);
    g.clip();
    if (img) {
      // Cover-crop, biased toward the hairline.
      const s = Math.max(pw / img.width, ph / img.height);
      const dw = img.width * s;
      const dh = img.height * s;
      g.drawImage(img, px + (pw - dw) / 2, py + (ph - dh) * focusY, dw, dh);
    } else {
      const well = g.createLinearGradient(0, py, 0, py + ph);
      well.addColorStop(0, "#ebe7f0");
      well.addColorStop(1, "#dcd6e4");
      g.fillStyle = well;
      g.fillRect(px, py, pw, ph);
    }
    // Scan arc over the hairline
    g.strokeStyle = "rgba(255,255,255,0.95)";
    g.lineWidth = 4;
    g.setLineDash([14, 10]);
    g.beginPath();
    g.ellipse(w / 2, py + ph * 0.36, pw * 0.34, ph * 0.16, 0, Math.PI * 1.08, Math.PI * 1.92);
    g.stroke();
    g.setLineDash([]);
    g.restore();
    // Label row
    g.fillStyle = "#17151b";
    g.font = `600 36px ${FONT}`;
    g.textBaseline = "middle";
    g.fillText(label, 34, h - 72);
    g.fillStyle = "#6b6773";
    g.font = `500 26px ${FONT}`;
    g.fillText(reading, 34, h - 34);
    g.fillStyle = "#e3f2ea";
    g.beginPath();
    g.roundRect(w - 214, h - 96, 180, 50, 25);
    g.fill();
    g.fillStyle = "#1e7a4e";
    g.font = `600 25px ${FONT}`;
    g.fillText("✓ Light even", w - 194, h - 71);
    t.needsUpdate = true;
  };

  frame();
  const img = new Image();
  img.decoding = "async";
  img.onload = () => frame(img);
  img.src = src;
  return t;
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
