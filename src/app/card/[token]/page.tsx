import { Suspense } from "react";
import Link from "next/link";
import { decodeCard, styleById } from "@/lib/edges";
import styles from "@/components/ui.module.css";

export const metadata = { title: "Stylist card — edge.wise" };

export default function CardPage({ params }: PageProps<"/card/[token]">) {
  return (
    <div className={styles.page} style={{ maxWidth: "calc(680px + 2 * var(--gutter))" }}>
      <Suspense fallback={<p>Loading card…</p>}>
        {params.then(({ token }) => (
          <Card token={token} />
        ))}
      </Suspense>
    </div>
  );
}

const STATUS = {
  steady: { tag: "Steady", line: "Hairline is holding. Keep it gentle." },
  watch: { tag: "Watch", line: "Hairline is under strain. Please go easy." },
  act: { tag: "Act now", line: "Hairline needs a break from tension." },
} as const;

function Card({ token }: { token: string }) {
  const c = decodeCard(token);
  if (!c) {
    return <p className={styles.error}>This stylist card link is broken. Ask your client to share it again from edge.wise.</p>;
  }
  const s = STATUS[c.status];
  return (
    <>
      <header className={styles.head}>
        <p className={styles.label}>Stylist card · {c.date}</p>
        <h1>{c.name ? `${c.name}'s edges` : "Your client's edges"}</h1>
      </header>
      <section className={styles.status} data-status={c.status}>
        <span className={styles.statusTag}>{s.tag}</span>
        <h2>{s.line}</h2>
        <p className={styles.sub}>
          Hairline density: {c.term.toLowerCase()}
          {c.change !== null ? ` (${c.change >= 0 ? "+" : ""}${c.change.toFixed(2)} vs their baseline)` : ""}. Recent tension load: {c.band}.
        </p>
        {c.demo ? <p className={styles.small}>Includes sample check-ins.</p> : null}
      </section>
      <section className={styles.panel}>
        <h2>Please</h2>
        <ul className={styles.list}>
          {c.rules.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </section>
      {c.avoid.length ? (
        <section className={styles.panel}>
          <h2>Avoid this time</h2>
          <ul className={styles.list}>
            {c.avoid.map((id) => (
              <li key={id}>{styleById(id).name}</li>
            ))}
          </ul>
        </section>
      ) : null}
      <section className={styles.panel}>
        <h2>For stylists</h2>
        <p className={styles.sub}>
          Dermatologists call stylists the front line for spotting hair loss. If you see broken hairs, recession or a shiny scalp at the hairline, suggest a looser style and a dermatologist. edge.wise is a cosmetic tracker and doesn&rsquo;t diagnose.
        </p>
        <Link href="/check" className="btn btn-primary" style={{ justifySelf: "start" }}>Run a check-in with your client</Link>
      </section>
    </>
  );
}
