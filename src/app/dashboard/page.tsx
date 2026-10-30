import type { Metadata } from "next";
import { Dashboard } from "@/components/Dashboard";
import styles from "@/components/ui.module.css";

export const metadata: Metadata = { title: "My progress — edge.wise" };

export default function DashboardPage() {
  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <h1>My progress</h1>
        <p>Your hairline measured against where you started, month by month, and whether your treatment is doing its job.</p>
      </header>
      <Dashboard />
    </div>
  );
}
