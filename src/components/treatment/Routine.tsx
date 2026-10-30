"use client";

import { useState } from "react";
import { useHistory } from "@/lib/history";
import { planStore } from "@/lib/plan";
import { cartStore, daysLeft, money, orderStore, productById, productsFor, type Order, type Product } from "@/lib/shop";
import { picks } from "@/lib/signals";
import ui from "../ui.module.css";
import s from "./treatment.module.css";

/** The routine shop: reorder what the plan uses, before it runs out. */
export function Routine() {
  const plan = planStore.use();
  const list = useHistory();
  const cart = cartStore.use();
  const orders = orderStore.use();
  const [open, setOpen] = useState(false);
  const [placed, setPlaced] = useState<Order | null>(null);
  const [asked, setAsked] = useState<Record<string, string>>({});

  if (!plan?.items.length) return null;
  const forYou = picks(list, plan);
  const picked = new Set(forYou.flatMap((x) => x.products));
  const items = productsFor(plan.items).filter((p) => !picked.has(p.id));
  const lines = Object.entries(cart).filter(([, q]) => q > 0);
  const total = lines.reduce((t, [id, q]) => t + productById(id).price * q, 0);
  const count = lines.reduce((t, [, q]) => t + q, 0);
  const add = (id: string) => cartStore.update((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
  const setQty = (id: string, q: number) =>
    cartStore.update((c) => {
      const n = { ...c };
      if (q <= 0) delete n[id];
      else n[id] = q;
      return n;
    });

  function checkout() {
    const order: Order = { id: `EW-${String(1041 + orders.length * 7)}`, date: new Date().toISOString(), lines: lines.map(([id, qty]) => ({ id, qty })), total };
    orderStore.update((o) => [...o, order]);
    cartStore.set({});
    setPlaced(order);
  }

  const row = (p: Product) => {
    const left = daysLeft(p, plan.items, orders);
    const low = left !== null && left <= 21;
    return (
      <li key={p.id} className={s.product} data-low={low}>
        <span className={s.productName}>
          <b>{p.name}</b>
          <small>{p.detail}</small>
        </span>
        {left !== null ? <span className={s.runout}>{left <= 0 ? "Run out" : `${left} days left`}</span> : <span />}
        <span className={`data ${s.price}`}>{money(p.price)}</span>
        {p.buy === "cart" ? (
          <button className="btn btn-primary" onClick={() => add(p.id)}>
            {cart[p.id] ? `In cart · ${cart[p.id]}` : "Add"}
          </button>
        ) : (
          <button className="btn btn-ghost" disabled={Boolean(asked[p.id])} onClick={() => setAsked((a) => ({ ...a, [p.id]: p.buy }))}>
            {asked[p.id] ? "Requested" : p.buy === "refill" ? "Refill via prescriber" : "Book"}
          </button>
        )}
      </li>
    );
  };

  return (
    <section className={ui.panel}>
      <div className={s.timelineHead}>
        <h2>Your routine</h2>
        <span className={s.sample}>Sample shop</span>
      </div>

      {forYou.length ? (
        <div className={s.picks}>
          {forYou.map((x) => (
            <div key={x.reason} className={s.pick}>
              <p>
                <span className={s.pickSource}>{x.source}</span> {x.reason}
              </p>
              <ul className={s.products}>{x.products.map((id) => row(productById(id)))}</ul>
            </div>
          ))}
        </div>
      ) : null}

      <ul className={s.products}>{items.map(row)}</ul>

      {count > 0 || placed ? (
        <button className={s.cartFab} onClick={() => setOpen(true)} aria-label={`Open cart, ${count} items`}>
          Cart <b className="data">{count}</b> <span className="data">{money(total)}</span>
        </button>
      ) : null}

      {open ? (
        <div className={s.drawerBack} onClick={() => setOpen(false)}>
          <aside className={s.drawer} role="dialog" aria-modal="true" aria-label="Cart" onClick={(e) => e.stopPropagation()}>
            <div className={s.timelineHead}>
              <h2>{placed && !count ? "Order placed" : "Your cart"}</h2>
              <button className={s.link} onClick={() => setOpen(false)}>
                Close
              </button>
            </div>
            {placed && !count ? (
              <div className={s.placed}>
                <b className="data">{placed.id}</b>
                <p>
                  Sample order for {money(placed.total)}. No payment was taken. Your run-out reminders now count from today.
                </p>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setPlaced(null);
                    setOpen(false);
                  }}
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <ul className={s.lines}>
                  {lines.map(([id, q]) => {
                    const p = productById(id);
                    return (
                      <li key={id}>
                        <span>
                          <b>{p.name}</b>
                          <small>{p.detail}</small>
                        </span>
                        <span className={ui.stepper}>
                          <button aria-label={`One less ${p.name}`} onClick={() => setQty(id, q - 1)}>−</button>
                          <output className="data">{q}</output>
                          <button aria-label={`One more ${p.name}`} onClick={() => setQty(id, q + 1)}>+</button>
                        </span>
                        <span className="data">{money(p.price * q)}</span>
                      </li>
                    );
                  })}
                </ul>
                <p className={s.total}>
                  Total <b className="data">{money(total)}</b>
                </p>
                <button className="btn btn-primary" disabled={!count} onClick={checkout}>
                  Place sample order
                </button>
                <p className={ui.small}>Demo checkout: nothing is charged or shipped.</p>
              </>
            )}
          </aside>
        </div>
      ) : null}
    </section>
  );
}
