import type { Metadata } from "next";
import { VendorBuilder } from "@/components/VendorBuilder";
import styles from "../flow.module.css";

export const metadata: Metadata = { title: "Blend links for hair vendors — Rangi" };

export default function VendorsPage() {
  return (
    <div className={`wrap ${styles.page}`} style={{ maxWidth: "calc(1160px + 2 * var(--gutter))" }}>
      <header className={styles.head}>
        <h1>Sell hair that blends</h1>
        <p>
          Make a <em>Will it blend?</em> link for any product. Send it before the customer pays. She scans her hair, sees a verdict for your exact bundle, and sends her match back to you on WhatsApp.
        </p>
      </header>
      <VendorBuilder />
    </div>
  );
}
