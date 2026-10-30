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
  // Line drawing of skin in cross-section: one hair growing from its root,
  // the follicle wrapped around it, a gland beside it and fat below.
  const ink = "#731b24";
  const line = { fill: "none", stroke: ink, strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" } as const;
  return (
    <svg viewBox="0 0 48 48" width="50" height="50" aria-hidden="true">
      <defs>
        <clipPath id="mark-clip">
          <circle cx="24" cy="24" r="22.5" />
        </clipPath>
      </defs>
      <g clipPath="url(#mark-clip)">
        <rect width="48" height="48" fill="#fffaf0" />
        <rect y="15" width="48" height="33" fill="#f9dfe2" />
        {/* skin surface and the wavy lower edge of the top layer, dipping along the follicle */}
        <path d="M0 15 H48" {...line} />
        <path d="M0 21 C4 20 7 25 11 24 S16 19 19.4 20.5 M28.6 20.5 C32 19 34 25 38 24 S44 20 48 21" {...line} />
        {/* follicle: a sheath around the lower shaft, ending in the bulb */}
        <path d="M19.4 20.5 V34.5 C19.4 41.4 28.6 41.4 28.6 34.5 V20.5" {...line} />
        {/* the hair, tapering from root to tip */}
        <path d="M24.4 2.5 C23.6 13 22.6 25 22.2 34.6 C22 38.6 26 38.6 25.8 34.6 C25.4 25 24.9 13 24.4 2.5 Z" fill={ink} />
        {/* papilla feeding the root */}
        <path d="M22.6 39.6 C23.4 38.2 24.6 38.2 25.4 39.6 M24 39 V43.5" {...line} strokeWidth={1.2} />
        {/* oil gland */}
        <path d="M19.4 25.5 C16.6 25 15.4 27.6 16.8 29 C18 30.2 19.4 28.8 19.4 27.6" {...line} strokeWidth={1.3} />
        {/* dermis */}
        <circle cx="9" cy="31" r="1.6" {...line} strokeWidth={1.1} />
        <circle cx="36.5" cy="30" r="2" {...line} strokeWidth={1.1} />
        <circle cx="41" cy="34.5" r="1" {...line} strokeWidth={1.1} />
        {/* fat layer */}
        <path d="M0 38 C8 37 14 39 19 38.4 M29 38.4 C34 39 40 37 48 38" {...line} />
        <g {...line} strokeWidth={1.1}>
          <ellipse cx="7" cy="42" rx="3.2" ry="1.7" />
          <ellipse cx="14.5" cy="43" rx="3" ry="1.6" />
          <ellipse cx="33.5" cy="43" rx="3" ry="1.6" />
          <ellipse cx="41" cy="42" rx="3.2" ry="1.7" />
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
