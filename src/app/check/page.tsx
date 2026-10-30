import type { Metadata } from "next";
import { CheckInFlow } from "@/components/CheckInFlow";
import styles from "@/components/ui.module.css";

export const metadata: Metadata = { title: "Monthly check-in — edge.wise" };

export default function CheckPage() {
  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <h1>Monthly check-in</h1>
        <p>Once a month, same light, same pose. edge.wise compares today&rsquo;s hairline with where you started.</p>
      </header>
      <CheckInFlow />
    </div>
  );
}
