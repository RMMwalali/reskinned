"use client";

import { useState } from "react";
import { planStore } from "@/lib/plan";
import { cartStore, daysLeft, money, orderStore, productById, productsFor, type Order } from "@/lib/shop";
import ui from "../ui.module.css";
import s from "./treatment.module.css";

/** The routine shop: reorder what the plan uses, before it runs out. */
export function Routine() {
  const plan = planStore.use();
  const cart = cartStore.use();
  const orders = orderStore.use();
  const [open, setOpen] = useState(false);
  const [placed, setPlaced] = useState<Order | null>(null);
  const [asked, setAsked] = useState<Record<string, string>>({});

  if (!plan?.items.length) return null;
  const items = productsFor(plan.items);
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

  return (
    <section className={ui.panel}>
      <div className={s.timelineHead}>
        <div>
          <h2>Your routine</h2>
          <p className={ui.sub}>Reorder before you run out. A gap of a few weeks can undo months of progress.</p>
        </div>
        <span className={s.sample}>Sample shop</span>
      </div>

      <ul className={s.products}>
        {items.map((p) => {
          const left = daysLeft(p, plan.items, orders);
          const low = left !== null && left <= 21;
          return (
            <li key={p.id} className={s.product} data-low={low}>
              <span className={s.productName}>
                <b>{p.name}</b>
                <small>{p.detail}</small>
              </span>
              {left !== null ? <span className={s.runout}>{left <= 0 ? "Run out" : `Runs out in ${left} days`}</span> : <span />}
              <span className={`data ${s.price}`}>{money(p.price)}</span>
              {p.buy === "cart" ? (
                <button className="btn btn-primary" onClick={() => add(p.id)}>
                  {cart[p.id] ? `In cart · ${cart[p.id]}` : "Add"}
                </button>
              ) : (
                <button className="btn btn-ghost" disabled={Boolean(asked[p.id])} onClick={() => setAsked((a) => ({ ...a, [p.id]: p.buy }))}>
                  {asked[p.id] ? (p.buy === "refill" ? "Refill requested" : "Request sent") : p.buy === "refill" ? "Ask prescriber to refill" : "Book a session"}
                </button>
              )}
            </li>
          );
        })}
      </ul>
      <p className={ui.small}>
        Sample listings to show how a partner brand&rsquo;s shop works inside edge.wise. Prescription items go through your prescriber, never the cart. No real orders or payments are made.
      </p>

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
