import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/AddToCartButton";
import { ProductCard } from "@/components/ProductCard";
import { getProduct, getProducts, formatNaira, referenceProducts } from "@/lib/api";
import { SITE_ORIGIN } from "@/lib/types";

export const dynamicParams = false;

export function generateStaticParams() {
  return referenceProducts.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const product = await getProduct((await params).slug);
  if (!product) return { title: "Product not found", robots: { index: false, follow: false } };
  return { title: product.name, description: product.description, alternates: { canonical: `${SITE_ORIGIN}/products/${product.slug}` }, openGraph: { type: "website", title: product.name, description: product.description, images: [product.image] }, twitter: { card: "summary_large_image", title: product.name, description: product.description, images: [product.image] } };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const product = await getProduct((await params).slug);
  if (!product) notFound();
  const related = (await getProducts()).filter((item) => item.slug !== product.slug).slice(0, 3);
  const jsonLd = { "@context": "https://schema.org", "@type": "Product", name: product.name, description: product.description, image: [`${SITE_ORIGIN}${product.image}`], offers: { "@type": "Offer", priceCurrency: "NGN", price: product.price, availability: "https://schema.org/InStock", url: `${SITE_ORIGIN}/products/${product.slug}` } };
  return <><section className="section container"><div className="detail-grid"><div><Image className="detail-image" src={product.image} alt={product.name} width={1080} height={1080} priority /></div><div><p className="eyebrow">{product.category}</p><h1>{product.name}</h1><p className="detail-price">{formatNaira(product.price)}</p><p className="detail-copy">{product.description}</p><div className="addon-box"><strong>Make it yours</strong><p>Add a personal note or select a thoughtful gift add-on during checkout.</p></div><AddToCartButton product={product} /><Link className="text-link" href="/contact" style={{ marginLeft: 18 }}>Need help choosing?</Link></div></div></section><section className="section container"><div className="section-header"><div><p className="eyebrow">You may also like</p><h2>More to love.</h2></div></div><div className="product-grid">{related.map((item) => <ProductCard key={item.id} product={item} />)}</div></section><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /></>;
}
