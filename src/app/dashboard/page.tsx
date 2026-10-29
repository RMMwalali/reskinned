import type { Metadata } from "next";
import { Dashboard } from "@/components/Dashboard";
import styles from "@/components/ui.module.css";

export const metadata: Metadata = { title: "My edges — edge.wise" };

export default function DashboardPage() {
  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <h1>My edges</h1>
        <p>Your hairline over time, the tension your styles have put on it, and what to do next.</p>
      </header>
      <Dashboard />
    </div>
  );
}
