import styles from "./Faq.module.css";

const QUESTIONS: [string, string][] = [
  [
    "Does Rangi work on 4C hair?",
    "Yes. YouCam's Hair Type Detection reads curl patterns from 1 through 4c, and Rangi maps them to commercial textures from silky straight to afro kinky. Coily hair shrinks, so Rangi reminds you that measured length can read shorter than your stretched length.",
  ],
  [
    "Why don't you just trust the colour code?",
    "There's no industry standard for codes. One factory's 1B can look like another's 2. Vendors can photograph the real bundle so Rangi compares measured colour, not just the label.",
  ],
  [
    "What happens to my photos?",
    "They're resized on your phone, sent to YouCam for one scan, and never stored by Rangi. There are no accounts.",
  ],
  [
    "How accurate is it?",
    "Every result shows a confidence level and the reasons behind it. Dim or yellow light, dyed ends, or a colour sitting between two codes all lower it, and Rangi says so instead of guessing.",
  ],
  [
    "What if I'm between two codes?",
    "Rangi tells you both, which to order first, and how far apart they are. The try-on lets you see each one on your own hair.",
  ],
];

export function Faq({ title = "F.A.Q." }: { title?: string }) {
  return (
    <div className={styles.faq}>
      <h2>{title}</h2>
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
