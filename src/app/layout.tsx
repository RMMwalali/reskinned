import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import styles from "./layout.module.css";

export const metadata: Metadata = {
  title: "Rangi — hair that blends",
  description:
    "Rangi measures your natural hair and tells you which wig, weave or braiding hair will blend, then shows it on you before you buy. Built on YouCam AI.",
};

export const viewport: Viewport = { themeColor: "#fafaf9" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a href="#main" className="sr-only">Skip to content</a>
        <header className={styles.header}>
          <div className={styles.bar}>
            <Link href="/" className={styles.logo} aria-label="Rangi home">
              <span className={styles.logoMark} aria-hidden="true">
                <i />
              </span>
              Rangi
            </Link>
            <nav className={styles.nav} aria-label="Main">
              <Link href="/scan">Find my match</Link>
              <Link href="/vendors">For vendors</Link>
              <Link href="/method">How we measure</Link>
            </nav>
            <div className={styles.right}>
              <Link href="/vendors" className={styles.textLink}>I sell hair</Link>
              <Link href="/scan" className="btn btn-primary">Scan my hair</Link>
            </div>
          </div>
        </header>
        <main id="main">{children}</main>
        <footer className={styles.footer}>
          <div className={`wrap ${styles.footGrid}`}>
            <div className={styles.footBrand}>
              <p className={styles.footLogo}>Rangi</p>
              <p>Swahili for <em>colour</em>. Hair that blends, measured on you.</p>
            </div>
            <nav aria-label="Footer" className={styles.footLinks}>
              <p className={styles.footHead}>Product</p>
              <Link href="/scan">Find my match</Link>
              <Link href="/vendors">Blend links for vendors</Link>
            </nav>
            <nav aria-label="About" className={styles.footLinks}>
              <p className={styles.footHead}>About</p>
              <Link href="/method">How we measure</Link>
              <Link href="/method#privacy">Privacy</Link>
            </nav>
            <p className={styles.footNote}>
              Built in Nairobi for the YouCam API Skin AI &amp; eCommerce Hackathon, on YouCam Hair Type Detection, Hair Length Detection, Skin Tone Analysis and Hair Color.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
