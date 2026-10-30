import styles from "./Faq.module.css";

const QUESTIONS: [string, string][] = [
  [
    "Does edge.wise tell me if my treatment works?",
    "It tells you whether your hairline is changing, measured against where you started, and when results usually show for what you're using. Whether a treatment is right for you medically is your prescriber's call. If the trend keeps falling after the first months, it tells you to take the report to them.",
  ],
  [
    "Why monthly?",
    "Hair grows about a centimetre a month and treatments work over many months. Checking daily only shows noise. Once a month, same light, same pose, shows the trend.",
  ],
  [
    "Why two hairline photos?",
    "Photos vary with light and angle. Taking the same shot twice lets edge.wise measure how steady the reading is. If the two disagree, it says so and asks for a retake instead of raising a false alarm.",
  ],
  [
    "What happens to my photos?",
    "They're resized on your phone and sent to YouCam for that reading only. edge.wise keeps no copy on its servers. A small thumbnail stays on your phone for the side-by-side view, and you can delete everything any time. There are no accounts.",
  ],
  [
    "Who sells the products in the shop?",
    "In a real deployment, the brand or clinic that offers edge.wise to you. On this demo site every listing is a sample and no payment is taken. Prescription medicines never go in the cart: they're refilled through your prescriber.",
  ],
  [
    "What about braids and tight styles?",
    "Traction hair loss is the one kind you can stop by changing how you wear your hair. Choose \"Gentler styles\" in your plan, and edge.wise also tracks the tension of each style you wear and suggests gentler versions you can try on.",
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
