"use client";

import { useMemo } from "react";
import { useHistory } from "@/lib/history";
import { planStore } from "@/lib/plan";
import { SKIN_ACTIONS, SKIN_LABEL, skinTrend } from "@/lib/skin";
import ui from "../ui.module.css";
import s from "./treatment.module.css";

/** Skin side-effect check from YouCam Skin AI, with a shoppable fix. */
export function SkinPanel() {
  const list = useHistory();
  const plan = planStore.use();
  const t = useMemo(() => skinTrend(list, plan), [list, plan]);
  if (!t) return null;

  return (
    <section className={ui.panel}>
      <div className={s.timelineHead}>
        <h2>Skin check</h2>
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

    </section>
  );
}
