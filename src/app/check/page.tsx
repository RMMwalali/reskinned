import type { Metadata } from "next";
import { CheckInFlow } from "@/components/CheckInFlow";
import styles from "@/components/ui.module.css";

export const metadata: Metadata = { title: "Check my edges — edge.wise" };

export default function CheckPage() {
  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <h1>Check my edges</h1>
        <p>Before every new install. edge.wise compares today&rsquo;s hairline with your last check-ins and the tension your styles have put on it.</p>
      </header>
      <CheckInFlow />
    </div>
  );
}
