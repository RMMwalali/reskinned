import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import styles from "./layout.module.css";

export const metadata: Metadata = {
  title: "edge.wise — protect your edges",
  description:
    "edge.wise tracks your hairline between installs and catches styling-related thinning while it can still be reversed. Safer styles, try-on, and a card for your stylist. Built on YouCam AI.",
};

export const viewport: Viewport = { themeColor: "#fafaf9" };

function Mark() {
  // A hairline arc with a soft fringe of strands.
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M4 15c1.6-5 4.6-7.5 8-7.5s6.4 2.5 8 7.5" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 12.2v2.2M12 10.7v2.5M16 12.2v2.2" stroke="#fff" strokeOpacity=".7" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a href="#main" className="sr-only">Skip to content</a>
        <header className={styles.header}>
          <div className={styles.bar}>
            <Link href="/" className={styles.logo} aria-label="edge.wise home">
              <span className={styles.logoMark}>
                <Mark />
              </span>
              edge.wise
            </Link>
            <nav className={styles.nav} aria-label="Main">
              <Link href="/dashboard">My edges</Link>
              <Link href="/plan">Plan a style</Link>
              <Link href="/method">How it works</Link>
            </nav>
            <div className={styles.right}>
              <Link href="/dashboard" className={styles.textLink}>My edges</Link>
              <Link href="/check" className="btn btn-primary">Check my edges</Link>
            </div>
          </div>
        </header>
        <main id="main">{children}</main>
        <footer className={styles.footer}>
          <div className={`wrap ${styles.footGrid}`}>
            <div className={styles.footBrand}>
              <p className={styles.footLogo}>edge.wise</p>
              <p>Catch styling-related hairline loss while it can still grow back.</p>
            </div>
            <nav aria-label="Footer" className={styles.footLinks}>
              <p className={styles.footHead}>Product</p>
              <Link href="/check">Check my edges</Link>
              <Link href="/dashboard">My edges</Link>
              <Link href="/plan">Plan a style</Link>
            </nav>
            <nav aria-label="About" className={styles.footLinks}>
              <p className={styles.footHead}>About</p>
              <Link href="/method">How it works</Link>
              <Link href="/method#sources">Sources</Link>
              <Link href="/method#privacy">Privacy</Link>
            </nav>
            <p className={styles.footNote}>
              edge.wise is a cosmetic tracking tool, not a medical device, and it doesn&rsquo;t diagnose. If you notice hair loss, see a board-certified dermatologist. Built for the YouCam API Skin AI &amp; eCommerce Hackathon.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
