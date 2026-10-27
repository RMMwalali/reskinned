"use client";

import { useState } from "react";
import Link from "next/link";
import { findCode } from "@/lib/codes";
import { TEXTURES, type Texture } from "@/lib/match";
import { HairBundle } from "./HairBundle";
import { ShadeGrid } from "./ShadeGrid";
import styles from "./ShadeExplorer.module.css";

const SHOWN: Texture[] = ["Silky Straight", "Kinky Straight", "Body Wave", "Kinky Curly", "Afro Kinky"];

export function ShadeExplorer() {
  const [code, setCode] = useState("1B");
  const [texture, setTexture] = useState<Texture>("Kinky Straight");
  const c = findCode(code)!;
  return (
    <div className={styles.explorer}>
      <div className={styles.art}>
        <HairBundle hex={c.hex} texture={texture} />
      </div>
      <div className={styles.controls}>
        <div className={styles.head}>
          <p className="label">Colour</p>
          <p className={styles.picked}>
            <strong className="data">{c.code}</strong> {c.name} <span className="data">{c.hex}</span>
          </p>
        </div>
        <ShadeGrid selected={code} onSelect={setCode} caption="Choose a colour code" />
        <p className="label" style={{ marginTop: "var(--s-3)" }}>Texture</p>
        <div className={styles.pills} role="group" aria-label="Choose a texture">
          {TEXTURES.filter((t) => SHOWN.includes(t)).map((t) => (
            <button key={t} type="button" aria-pressed={t === texture} className={styles.pill} onClick={() => setTexture(t)}>
              {t}
            </button>
          ))}
        </div>
        <p className={styles.note}>These are reference colours. Your camera, light and the factory all shift them. That&rsquo;s why Rangi measures your hair instead.</p>
        <Link href="/scan" className="btn btn-primary">Find my code</Link>
      </div>
    </div>
  );
}
