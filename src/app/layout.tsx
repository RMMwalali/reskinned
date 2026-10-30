import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import styles from "./layout.module.css";

export const metadata: Metadata = {
  title: "edge.wise — know if your hair treatment is working",
  description:
    "Hair-loss treatments take months to show results, and most people quit before then. edge.wise measures your hairline against your own baseline every month, so you can see whether it's working, and keeps your routine stocked. Built on YouCam AI.",
};

export const viewport: Viewport = { themeColor: "#b21236" };

function Mark() {
  // A single hair growing from the skin, shown in cross-section: the shaft
  // rises from its root (the bulb) through the skin surface.
  return (
    <svg viewBox="0 0 48 48" width="50" height="50" aria-hidden="true">
      <defs>
        <clipPath id="mark-clip">
          <circle cx="24" cy="24" r="22" />
        </clipPath>
      </defs>
      <g clipPath="url(#mark-clip)">
        <g transform="translate(0 -3)">
        {/* skin, below the surface line */}
        <path d="M0 27 C8 24 15 29 24 27 S40 24 48 27 V52 H0 Z" fill="#f6b3c2" />
        <path d="M0 27 C8 24 15 29 24 27 S40 24 48 27" fill="none" stroke="#fffdf7" strokeWidth="1.6" />
        <path d="M0 33 C10 31 16 35 24 33 S40 31 48 33" fill="none" stroke="#e98fa4" strokeWidth="1" />
        {/* follicle sheath */}
        <path d="M20.2 27.6 V36 M27.8 27.6 V36" stroke="#b21236" strokeWidth="1.3" strokeLinecap="round" />
        {/* root: the bulb, with the papilla underneath */}
        <path d="M18.6 38.6 C18.6 33.8 29.4 33.8 29.4 38.6 C29.4 43.6 18.6 43.6 18.6 38.6 Z" fill="#feb914" />
        <ellipse cx="24" cy="42.4" rx="2.4" ry="1.7" fill="#b21236" />
        {/* the shaft, growing up through the skin */}
        <path d="M24 37 C24 30 23.2 22 24.6 15.5 C25.6 11 28.4 7.6 32.4 6" fill="none" stroke="#feb914" strokeWidth="2.8" strokeLinecap="round" />
        {/* growth marks */}
        <path d="M35.6 9.4 l3.2 -1.4 M35.2 13.4 l3.4 0.6" stroke="#fffdf7" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      </g>
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
              <span className={styles.logoText}>edge.wise</span>
            </Link>
            <Link href="/check" className={styles.badge}>
              <i aria-hidden="true" /> Free · two minutes a month
            </Link>
            <nav className={styles.nav} aria-label="Main">
              <Link href="/dashboard">My progress</Link>
              <Link href="/fuller">Look fuller</Link>
              <Link href="/brands">For brands</Link>
              <Link href="/method">How it works</Link>
            </nav>
            <div className={styles.right}>
              <Link href="/dashboard" className={styles.textLink}>My progress</Link>
              <Link href="/check" className="btn btn-cream">Check in</Link>
            </div>
          </div>
        </header>
        <main id="main">{children}</main>
        <footer className={styles.footer}>
          <div className={styles.footStripes} aria-hidden="true">
            <i /><i /><i /><i /><i />
          </div>
          <div className={`wrap ${styles.footGrid}`}>
            <div className={styles.footBrand}>
              <p className={styles.footLogo}>edge.wise</p>
              <p>Know if your hair treatment is working, before you give up on it.</p>
            </div>
            <nav aria-label="Footer" className={styles.footLinks}>
              <p className={styles.footHead}>Product</p>
              <Link href="/check">Check in</Link>
              <Link href="/dashboard">My progress</Link>
              <Link href="/fuller">Look fuller now</Link>
              <Link href="/plan">Plan a gentler style</Link>
              <Link href="/brands">For brands</Link>
            </nav>
            <nav aria-label="About" className={styles.footLinks}>
              <p className={styles.footHead}>About</p>
              <Link href="/method">How it works</Link>
              <Link href="/method#sources">Sources</Link>
              <Link href="/method#privacy">Privacy</Link>
            </nav>
            <p className={styles.footNote}>
              edge.wise is a cosmetic tracking tool, not a medical device. It doesn&rsquo;t diagnose or judge whether a treatment works for you medically; your prescriber does. If you notice hair loss, see a board-certified dermatologist. Built for the YouCam API Skin AI &amp; eCommerce Hackathon.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
