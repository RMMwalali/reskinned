import { Suspense } from "react";
import Link from "next/link";
import { ProductPage } from "@/components/ProductPage";
import { decodeProduct } from "@/lib/product-link";
import styles from "../../flow.module.css";

export const metadata = { title: "Will it blend? — Rangi" };

export default function BlendPage({ params }: PageProps<"/blend/[token]">) {
  return (
    <Suspense fallback={<p className="wrap">Loading product…</p>}>
      {params.then(({ token }) => (
        <BlendContent token={token} />
      ))}
    </Suspense>
  );
}

function BlendContent({ token }: { token: string }) {
  const product = decodeProduct(token);
  if (!product) {
    return (
      <div className={`wrap ${styles.page}`}>
        <p className={styles.invalid}>
          This blend link is broken or incomplete. Ask the vendor to send it again, or <Link href="/scan">scan without a product</Link>.
        </p>
      </div>
    );
  }
  return <ProductPage product={product} />;
}
