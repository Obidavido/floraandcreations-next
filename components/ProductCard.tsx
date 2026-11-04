import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatNaira } from "@/lib/api";
import { AddToCartButton } from "@/components/AddToCartButton";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="product-card">
      <Link href={`/products/${product.slug}`} className="product-image-link">
        <Image src={product.image} alt={product.name} width={640} height={640} className="product-image" />
      </Link>
      <div className="product-info">
        <div>
          <p className="product-category">{product.category}</p>
          <h3><Link href={`/products/${product.slug}`}>{product.name}</Link></h3>
        </div>
        <p className="price">{formatNaira(product.price)}</p>
      </div>
      <AddToCartButton product={product} />
      <Link className="text-link" href={`/products/${product.slug}`}>View arrangement <span aria-hidden="true">↗</span></Link>
    </article>
  );
}
