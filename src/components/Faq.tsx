import styles from "./Faq.module.css";

const QUESTIONS: [string, string][] = [
  [
    "Is this a diagnosis?",
    "No. edge.wise is a cosmetic tracker. It measures how your hairline changes and how much tension your styles put on it. It can't tell you why hair is thinning, so whenever the trend is steep or you report crown itching, it tells you to see a board-certified dermatologist.",
  ],
  [
    "Who is it for?",
    "Anyone whose styles pull at the hairline: braids, cornrows, weaves, wigs, locs, tight ponytails and slick buns. Traction hair loss is most studied in Black women, but dermatologists also see it in dancers, athletes, and anyone who wears the same tight style for long stretches.",
  ],
  [
    "Why two hairline photos?",
    "Photos vary with light and angle. Taking the same shot twice lets edge.wise measure how steady the reading is. If the two disagree, it says so and asks for a retake instead of raising a false alarm.",
  ],
  [
    "What happens to my photos?",
    "They're resized on your phone, sent to YouCam for that check-in only, and never stored. Your history (numbers and answers, no images) stays in your browser. There are no accounts.",
  ],
  [
    "Do I have to stop wearing protective styles?",
    "No. The planner keeps the look you want and lowers the tension: knotless instead of knotted, bigger and shorter braids, glueless instead of glued, edges left out, and shorter wear time.",
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
