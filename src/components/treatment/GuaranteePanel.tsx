"use client";

import { useMemo } from "react";
import { useHistory } from "@/lib/history";
import { claimReady, guaranteeWindows } from "@/lib/guarantee";
import { planStore, thumbStore } from "@/lib/plan";
import ui from "../ui.module.css";
import s from "./treatment.module.css";

const STATE = { done: "Done", open: "Open now", upcoming: "Upcoming", missed: "Missed" } as const;
const fmt = (d: string) => new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short" });

/** Photo windows for a brand's results guarantee, filled by the monthly check-ins. */
export function GuaranteePanel() {
  const list = useHistory();
  const plan = planStore.use();
  const thumbs = thumbStore.use();
  const start = plan?.items.map((i) => i.start).sort()[0];
  const w = useMemo(() => (start ? guaranteeWindows(list, start) : null), [list, start]);
  if (!w || !start) return null;
  const ready = claimReady(w);

  function download() {
    const used = new Set(w!.map((x) => x.checkIn));
    const pack = {
      kind: "edge.wise results-guarantee evidence",
      started: start,
      windows: w!.map((x) => ({ days: `${x.from}–${x.to}`, state: x.state })),
      checkIns: list
        .filter((c) => used.has(c.id))
        .map((c) => ({ date: c.date, density: c.density, spread: c.spread, term: c.term, sample: Boolean(c.demo), photo: thumbs[c.id] ?? null })),
      note: "Density from YouCam Hair Density Detection, two takes per check-in. Cosmetic measurement, not a diagnosis.",
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(pack, null, 2)], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "edgewise-guarantee-evidence.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className={ui.panel}>
      <div className={s.timelineHead}>
        <div>
          <h2>Guarantee photos</h2>
          <p className={ui.sub}>Some brands refund you if there&rsquo;s no growth after six months, but only with consistent photos taken at set times. Your monthly check-ins cover them.</p>
        </div>
        {ready ? <span className={s.sample}>Ready</span> : null}
      </div>
      <ol className={s.windows}>
        {w.map((x, i) => (
          <li key={x.from} data-state={x.state}>
            <span className="data">0{i + 1}</span>
            <b>Days {x.from}–{x.to}</b>
            <small>
              {fmt(x.opens)} – {fmt(x.closes)}
            </small>
            <em>{STATE[x.state]}</em>
          </li>
        ))}
      </ol>
      <div className={ui.row}>
        <button className="btn btn-ghost" disabled={!ready} onClick={download}>
          {ready ? "Download evidence pack" : "Evidence pack: after window 3"}
        </button>
      </div>
    </section>
  );
}
