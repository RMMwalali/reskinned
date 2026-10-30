"use client";

import { useMemo } from "react";
import { useHistory } from "@/lib/history";
import { planStore } from "@/lib/plan";
import { cartStore, money, productById } from "@/lib/shop";
import { SKIN_ACTIONS, SKIN_LABEL, skinTrend } from "@/lib/skin";
import ui from "../ui.module.css";
import s from "./treatment.module.css";

/** Skin side-effect check from YouCam Skin AI, with a shoppable fix. */
export function SkinPanel() {
  const list = useHistory();
  const plan = planStore.use();
  const cart = cartStore.use();
  const t = useMemo(() => skinTrend(list, plan), [list, plan]);
  if (!t) return null;

  return (
    <section className={ui.panel}>
      <div className={s.timelineHead}>
        <div>
          <h2>Skin check</h2>
          <p className={ui.sub}>YouCam Skin AI scores your front photo each month. Higher is healthier. Some treatments irritate the skin along the hairline; this is where you&rsquo;d see it first.</p>
        </div>
        <span className={s.sample}>Skin AI</span>
      </div>

      <div className={s.skinGrid}>
        {SKIN_ACTIONS.map((k) => {
          const now = t.latest[k];
          if (now === undefined) return null;
          const was = t.first[k];
          const d = t.change[k] ?? 0;
          const bad = t.worse.includes(k);
          return (
            <div key={k} className={s.skinRow} data-bad={bad}>
              <span className={s.skinName}>{SKIN_LABEL[k]}</span>
              <span className={s.skinBar} aria-hidden="true">
                {was !== undefined ? <i className={s.skinWas} style={{ left: `${was}%` }} /> : null}
                <b style={{ width: `${now}%` }} />
              </span>
              <span className={`data ${s.skinNum}`}>
                {now}
                {d ? <small>{d > 0 ? ` +${d}` : ` ${d}`}</small> : null}
              </span>
            </div>
          );
        })}
      </div>
      <p className={ui.small}>The tick marks your first skin reading. A fall of 10 points or more is flagged.</p>

      {t.advice.map((a) => (
        <div key={a.title} className={s.advice}>
          <b>{a.title}</b>
          <p>{a.body}</p>
          {a.products.length ? (
            <div className={ui.row}>
              {a.products.map((id) => {
                const p = productById(id);
                return (
                  <button key={id} className="btn btn-primary" onClick={() => cartStore.update((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }))}>
                    {cart[id] ? `${p.name} · in cart` : `Add ${p.name} · ${money(p.price)}`}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      ))}
      {!t.advice.length && t.worse.length === 0 ? <p className={ui.small}>No change worth flagging since your first skin reading.</p> : null}
    </section>
  );
}
