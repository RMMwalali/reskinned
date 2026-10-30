import styles from "./Faq.module.css";

const QUESTIONS: [string, string][] = [
  [
    "Why monthly?",
    "Treatments work over months. Daily checks show only noise; monthly checks show the trend.",
  ],
  [
    "Why two hairline photos?",
    "Light and angle vary. If the two takes disagree, edge.wise asks for a retake instead of raising a false alarm.",
  ],
  [
    "Who sells the products in the shop?",
    "The brand or clinic that offers edge.wise to you. On this demo, listings are samples and nothing is charged. Prescriptions go through your prescriber.",
  ],
  [
    "What about braids and tight styles?",
    "Choose \"Gentler styles\" in your plan. edge.wise then tracks style tension and suggests gentler looks to try on.",
  ],
];

export function Faq() {
  return (
    <div className={styles.faq}>
      <h2>Questions</h2>
      <div className={styles.list}>
        {QUESTIONS.map(([q, a]) => (
          <details key={q} className={styles.item}>
            <summary>{q}</summary>
            <p>{a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
