"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { prepareImage, type Prepared } from "@/lib/image-client";
import { cartStore, money, productById } from "@/lib/shop";
import { PoseGuide } from "../PoseGuide";
import ui from "../ui.module.css";
import s from "./treatment.module.css";

type Kind = "volume" | "bangs" | "color";
type Tpl = { id: string; title: string; thumb?: string };

const KINDS: { kind: Kind; label: string; products: string[] }[] = [
  { kind: "volume", label: "Volume", products: ["hair-fibers", "topper"] },
  { kind: "bangs", label: "Fringe", products: ["fringe-cut"] },
  { kind: "color", label: "Colour", products: ["colour"] },
];

type State = { s: "idle" } | { s: "loading" } | { s: "done"; url: string } | { s: "demo"; msg: string } | { s: "error"; msg: string };

/** Try styling that hides thinning while treatment works (YouCam Hair Volume, Bangs, Hair Color). */
export function FullerLook() {
  const [photo, setPhoto] = useState<Prepared | null>(null);
  const [kind, setKind] = useState<Kind>("volume");
  const [tpls, setTpls] = useState<Record<string, Tpl[] | "error">>({});
  const [state, setState] = useState<State>({ s: "idle" });
  const cart = cartStore.use();
  const k = KINDS.find((x) => x.kind === kind)!;
  const list = tpls[kind];

  useEffect(() => {
    if (tpls[kind]) return;
    let live = true;
    fetch(`/api/look?kind=${kind}`)
      .then((r) => r.json())
      .then((j: { templates?: Tpl[] }) => live && setTpls((t) => ({ ...t, [kind]: j.templates ?? [] })))
      .catch(() => live && setTpls((t) => ({ ...t, [kind]: "error" })));
    return () => {
      live = false;
    };
  }, [kind, tpls]);

  async function run(option: string) {
    if (!photo) return;
    setState({ s: "loading" });
    const fd = new FormData();
    fd.set("photo", photo.blob, "front.jpg");
    fd.set("kind", kind);
    fd.set("option", option);
    try {
      const r = await fetch("/api/look", { method: "POST", body: fd });
      const j = (await r.json()) as { url?: string; mode?: string; demoReason?: string; error?: string };
      if (j.url) setState({ s: "done", url: j.url });
      else if (j.mode === "demo") setState({ s: "demo", msg: j.demoReason ?? "Demo mode." });
      else setState({ s: "error", msg: j.error ?? "That didn't work. Try another photo." });
    } catch {
      setState({ s: "error", msg: "That didn't work. Try again." });
    }
  }

  return (
    <div className={s.stack}>
      <section className={ui.panel}>
        <div className={s.look}>
          <label className={ui.drop} data-filled={Boolean(photo)}>
            {state.s === "done" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={state.url} alt="Your try-on result" />
            ) : photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo.url} alt="Your front photo" />
            ) : (
              <PoseGuide kind="front" />
            )}
            <input
              type="file"
              accept="image/*"
              capture="user"
              className="sr-only"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                setPhoto(await prepareImage(f));
                setState({ s: "idle" });
              }}
            />
            <span className={ui.dropLabel}>{photo ? "New photo" : "Add a front photo"}</span>
            {state.s === "done" ? <span className={s.illus}>Illustration</span> : null}
          </label>

          <div className={s.lookSide}>
            <div className={s.tabs} role="tablist" aria-label="Look">
              {KINDS.map((x) => (
                <button key={x.kind} role="tab" aria-selected={x.kind === kind} className={s.tab} onClick={() => (setKind(x.kind), setState({ s: "idle" }))}>
                  {x.label}
                </button>
              ))}
            </div>

            <div className={s.tpls}>
              {list === "error" ? <p className={ui.error} style={{ gridColumn: "1 / -1" }}>Couldn&rsquo;t load looks.</p> : null}
              {Array.isArray(list) && !list.length ? <p className={ui.notice} style={{ gridColumn: "1 / -1" }}>Looks appear here with a live YouCam key.</p> : null}
              {Array.isArray(list)
                ? list.slice(0, 9).map((t) => (
                    <button key={t.id} className={s.tpl} disabled={!photo || state.s === "loading"} onClick={() => run(t.id)} title={t.title}>
                      {t.thumb ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={t.thumb} alt="" />
                      ) : null}
                      <span>{t.title}</span>
                    </button>
                  ))
                : null}
            </div>
            {state.s === "loading" ? <p className={ui.small} role="status">Rendering…</p> : null}
            {state.s === "demo" || state.s === "error" ? <p className={state.s === "error" ? ui.error : ui.notice}>{state.msg}</p> : null}

            <ul className={s.products}>
              {k.products.map((id) => {
                const p = productById(id);
                return (
                  <li key={id} className={s.product}>
                    <span className={s.productName}>
                      <b>{p.name}</b>
                      <small>{p.detail}</small>
                    </span>
                    <span />
                    <span className={`data ${s.price}`}>{money(p.price)}</span>
                    <button className={p.buy === "cart" ? "btn btn-primary" : "btn btn-ghost"} onClick={() => cartStore.update((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }))}>
                      {cart[id] ? "Added" : p.buy === "cart" ? "Add" : "Book"}
                    </button>
                  </li>
                );
              })}
            </ul>
            {Object.keys(cart).length ? (
              <Link href="/dashboard" className={s.link}>
                Go to cart
              </Link>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
