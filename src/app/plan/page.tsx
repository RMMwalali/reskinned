import type { Metadata } from "next";
import { Planner } from "@/components/Planner";
import styles from "@/components/ui.module.css";

export const metadata: Metadata = { title: "Plan a style — edge.wise" };

export default function PlanPage() {
  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <h1>Plan your next style</h1>
        <p>Keep the look, lose the tension. Gentler versions of what you want, with the install rules dermatologists recommend, and a try-on.</p>
      </header>
      <Planner />
    </div>
  );
}
