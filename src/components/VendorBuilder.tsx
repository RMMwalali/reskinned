"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { HAIR_CODES, findCode } from "@/lib/codes";
import { sampleHair } from "@/lib/image-client";
import { rankCodes, TEXTURES, type Product, type Texture } from "@/lib/match";
import { encodeProduct } from "@/lib/product-link";
import styles from "./VendorBuilder.module.css";

export function VendorBuilder() {
  const [name, setName] = useState("Kinky Straight Bundles");
  const [vendor, setVendor] = useState("");
  const [code, setCode] = useState("1B");
  const [texture, setTexture] = useState<Texture>("Kinky Straight");
  const [inches, setInches] = useState("18");
  const [price, setPrice] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [photo, setPhoto] = useState<{ blob: Blob; url: string } | null>(null);
  const [measured, setMeasured] = useState<{ hex: string; spread: number; x: number; y: number } | null>(null);
  const [copied, setCopied] = useState(false);

  const phoneDigits = whatsapp.replace(/\D/g, "").replace(/^0(?=7|1)/, "254");

  const product: Product = useMemo(
    () => ({
      name: name.trim() || "Hair bundle",
      vendor: vendor.trim(),
      code,
      texture,
      measuredHex: measured?.hex,
      inches: Number(inches) || undefined,
      priceKes: Number(price) || undefined,
      whatsapp: /^\d{8,15}$/.test(phoneDigits) ? phoneDigits : undefined,
    }),
    [name, vendor, code, texture, measured, inches, price, phoneDigits],
  );

  const origin = useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => "",
  );
  const link = `${origin}/blend/${encodeProduct(product)}`;
  const nearest = measured ? rankCodes(measured.hex, HAIR_CODES)[0] : null;

  async function onTap(e: React.MouseEvent<HTMLButtonElement>) {
    if (!photo) return;
    const img = e.currentTarget.querySelector("img")!;
    const rect = img.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * img.naturalWidth;
    const y = ((e.clientY - rect.top) / rect.height) * img.naturalHeight;
    const r = Math.max(12, Math.round(img.naturalWidth / 40));
    const s = await sampleHair(photo.blob, x, y, r);
    setMeasured({ hex: s.hex, spread: s.spread, x: x / img.naturalWidth, y: y / img.naturalHeight });
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className={styles.grid}>
      <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
        <label>
          Product name
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} />
        </label>
        <label>
          Shop name
          <input value={vendor} onChange={(e) => setVendor(e.target.value)} placeholder="e.g. Wanjiru Hair Nairobi" maxLength={60} />
        </label>
        <div className={styles.two}>
          <label>
            Colour code
            <select value={code} onChange={(e) => setCode(e.target.value)}>
              {HAIR_CODES.map((c) => (
                <option key={c.code} value={c.code}>{c.code} · {c.name}</option>
              ))}
            </select>
          </label>
          <label>
            Texture
            <select value={texture} onChange={(e) => setTexture(e.target.value as Texture)}>
              {TEXTURES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
        </div>
        <div className={styles.two}>
          <label>
            Length (inches)
            <input inputMode="numeric" value={inches} onChange={(e) => setInches(e.target.value.replace(/\D/g, ""))} />
          </label>
          <label>
            Price (KES)
            <input inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))} placeholder="optional" />
          </label>
        </div>
        <label>
          Your WhatsApp number
          <input inputMode="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="07… or 2547…" />
          <span className={styles.hint}>Customers can send their match straight back to you. Optional.</span>
        </label>

        <fieldset className={styles.photoBox}>
          <legend>Measure the real colour (recommended)</legend>
          <p className={styles.hint}>Codes vary by factory. Photograph the bundle in daylight, then tap the hair. The link will use the measured colour, not just the label.</p>
          <label className="btn btn-ghost">
            {photo ? "Change photo" : "Add product photo"}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                if (photo) URL.revokeObjectURL(photo.url);
                setPhoto({ blob: f, url: URL.createObjectURL(f) });
                setMeasured(null);
              }}
            />
          </label>
          {photo ? (
            <button type="button" className={styles.tap} onClick={onTap} aria-label="Tap the hair in your product photo to measure its colour">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.url} alt="" />
              {measured ? <span className={styles.dot} style={{ left: `${measured.x * 100}%`, top: `${measured.y * 100}%`, background: measured.hex }} /> : null}
            </button>
          ) : null}
          {measured && nearest ? (
            <p className={`data ${styles.measure}`}>
              Measured {measured.hex} · photographs closest to {nearest.code}
              {nearest.code !== code ? ` (you labelled it ${code})` : " ✓ matches your label"}
            </p>
          ) : null}
        </fieldset>
      </form>

      <aside className={styles.out} aria-live="polite">
        <div className={styles.preview}>
          <div className={styles.swatch} style={{ background: measured?.hex ?? findCode(code)?.hex }} aria-hidden="true" />
          <div>
            <p><strong>{product.name}</strong></p>
            <p className="data">{code} · {texture}{product.inches ? ` · ${product.inches}"` : ""}{product.priceKes ? ` · KES ${product.priceKes.toLocaleString("en-KE")}` : ""}</p>
            <p className={styles.hint}>{measured ? "Colour: measured from your photo" : "Colour: code reference only"}</p>
          </div>
        </div>
        <label className={styles.linkLabel}>
          Your blend link
          <input readOnly value={link} onFocus={(e) => e.currentTarget.select()} className="data" />
        </label>
        <div className={styles.actions}>
          <button type="button" className="btn btn-primary" onClick={copy}>{copied ? "Copied" : "Copy link"}</button>
          <a className="btn btn-ghost" href={`https://wa.me/?text=${encodeURIComponent(`Check this hair blends with yours before you buy: ${link}`)}`} target="_blank" rel="noopener noreferrer">
            Share on WhatsApp
          </a>
          <a className="btn btn-ghost" href={link} target="_blank" rel="noopener noreferrer">Preview</a>
        </div>
        <p className={styles.hint}>The link holds only the product details above. No customer photos or data are ever stored.</p>
      </aside>
    </div>
  );
}
