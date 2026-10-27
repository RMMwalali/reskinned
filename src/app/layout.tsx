import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import styles from "./layout.module.css";

export const metadata: Metadata = {
  title: "Rangi — will your hair blend?",
  description:
    "Rangi measures your natural hair and tells you which wig, weave or braiding hair will blend, then shows it on you before you buy. Built on YouCam AI.",
};

export const viewport: Viewport = { themeColor: "#f6f4f8" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a href="#main" className="sr-only">Skip to content</a>
        <header className={styles.header}>
          <div className={`wrap ${styles.bar}`}>
            <Link href="/" className={styles.logo} aria-label="Rangi home">
              <span className={styles.logoMark} aria-hidden="true" />
              Rangi
            </Link>
            <nav className={styles.nav} aria-label="Main">
              <Link href="/vendors">For vendors</Link>
              <Link href="/method">How we measure</Link>
              <Link href="/scan" className="btn btn-primary">Scan my hair</Link>
            </nav>
          </div>
        </header>
        <main id="main">{children}</main>
        <footer className={styles.footer}>
          <div className={`wrap ${styles.footInner}`}>
            <p className={styles.footLogo}>Rangi</p>
            <p>
              Swahili for <em>colour</em>. Built in Kenya for the YouCam API Skin AI &amp; eCommerce Hackathon. Photos are processed for one scan and never stored.
            </p>
            <p className="data">
              YouCam APIs: Hair Type Detection · Hair Length Detection · Skin Tone Analysis · Hair Color
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
