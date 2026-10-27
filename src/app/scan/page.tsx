import type { Metadata } from "next";
import { ScanFlow } from "@/components/ScanFlow";
import styles from "../flow.module.css";

export const metadata: Metadata = { title: "Scan my hair — Rangi" };

export default function ScanPage() {
  return (
    <div className={`wrap ${styles.page}`}>
      <header className={styles.head}>
        <h1>Find hair that blends</h1>
        <p>Three photos and one tap. Rangi tells you your colour code, texture and the install that will hide the join best.</p>
      </header>
      <ScanFlow />
    </div>
  );
}
