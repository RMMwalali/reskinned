"use client";

import { useState } from "react";
import s from "./brands.module.css";

const fmt = (n: number) => (n < 0 ? "−" : "") + "$" + Math.round(Math.abs(n)).toLocaleString("en-US");

function Field({ label, value, set, min, max, step, unit }: { label: string; value: number; set: (n: number) => void; min: number; max: number; step: number; unit?: string }) {
  return (
    <label className={s.field}>
      <span>
        {label}
        <b className="data">
          {unit === "$" ? `$${value}` : value.toLocaleString("en-US")}
          {unit && unit !== "$" ? unit : ""}
        </b>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => set(Number(e.target.value))} />
    </label>
  );
}

/** Revenue kept by holding more subscribers past month six. */
export function RoiCalculator() {
  const [subs, setSubs] = useState(10000);
  const [price, setPrice] = useState(30);
  const [lift, setLift] = useState(10);
  const [fee, setFee] = useState(1);

  const kept = Math.round(subs * (lift / 100));
  const gained = kept * 6 * price;
  const cost = subs * fee * 6;
  const net = gained - cost;

  return (
    <section className={s.calc}>
      <div className={s.calcInputs}>
        <Field label="Active subscribers" value={subs} set={setSubs} min={1000} max={200000} step={1000} />
        <Field label="Monthly price" value={price} set={setPrice} min={10} max={120} step={5} unit="$" />
        <Field label="More kept past month six" value={lift} set={setLift} min={1} max={30} step={1} unit="%" />
        <Field label="edge.wise per user, per month" value={fee} set={setFee} min={0.5} max={5} step={0.5} unit="$" />
      </div>
      <div className={s.calcOut} aria-live="polite">
        <p>
          <span>Subscribers kept</span>
          <b className="data">+{kept.toLocaleString("en-US")}</b>
        </p>
        <p>
          <span>Revenue over 6 more months</span>
          <b className="data">{fmt(gained)}</b>
        </p>
        <p>
          <span>edge.wise for 6 months</span>
          <b className="data">{fmt(-cost)}</b>
        </p>
        <p className={s.net}>
          <span>Net</span>
          <b className="data">{fmt(net)}</b>
        </p>
      </div>
    </section>
  );
}
