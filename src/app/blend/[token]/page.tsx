import { Suspense } from "react";
import Link from "next/link";
import { ScanFlow } from "@/components/ScanFlow";
import { findCode } from "@/lib/codes";
import { decodeProduct } from "@/lib/product-link";
import styles from "../../flow.module.css";

export const metadata = { title: "Will it blend? — Rangi" };

export default function BlendPage({ params }: PageProps<"/blend/[token]">) {
  return (
    <div className={`wrap ${styles.page}`}>
      <Suspense fallback={<p>Loading product…</p>}>
        {params.then(({ token }) => (
          <BlendContent token={token} />
        ))}
      </Suspense>
    </div>
  );
}

function BlendContent({ token }: { token: string }) {
  const product = decodeProduct(token);
  if (!product) {
    return (
      <p className={styles.invalid}>
        This blend link is broken or incomplete. Ask the vendor to send it again, or <Link href="/scan">scan without a product</Link>.
      </p>
    );
  }
  const hex = product.measuredHex ?? findCode(product.code)?.hex ?? "#222";
  return (
    <>
      <header className={styles.head}>
        <h1>Will it blend?</h1>
        <p>{product.vendor ? `${product.vendor} sent you this link` : "A vendor sent you this link"} to check the hair matches yours before you pay.</p>
      </header>
      <div className={styles.product}>
        <div className={styles.productSwatch} style={{ background: hex }} aria-hidden="true" />
        <div>
          <p><strong>{product.name}</strong></p>
          <p className={`data ${styles.productMeta}`}>
            Code {product.code} · {product.texture}
            {product.inches ? ` · ${product.inches}"` : ""}
            {product.priceKes ? ` · KES ${product.priceKes.toLocaleString("en-KE")}` : ""}
            {product.measuredHex ? ` · colour measured from vendor photo (${product.measuredHex})` : " · colour from code reference"}
          </p>
        </div>
      </div>
      <ScanFlow product={product} />
    </>
  );
}
