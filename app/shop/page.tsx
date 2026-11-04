import { getProducts } from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("Shop flowers and gifts", "Explore bouquets, roses and thoughtful gifts from Flora and Creations.", "/shop");

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const products = await getProducts();
  const category = (await searchParams).category;
  const filtered = category ? products.filter((product) => product.category.toLowerCase() === category.toLowerCase() || product.slug.includes(category)) : products;
  return <><section className="page-hero"><div className="container"><p className="eyebrow">The shop</p><h1>Flowers for every feeling.</h1><p>Browse our collection of arrangements and gifts, prepared in Abuja with a little extra care.</p></div></section><section className="section container"><div className="section-header"><div><p className="eyebrow">{category ? `Showing ${category}` : "Our collection"}</p><h2>{filtered.length} arrangements</h2></div><span className="text-link">Delivery across Abuja</span></div><div className="product-grid">{filtered.map((product) => <ProductCard key={product.id} product={product} />)}</div></section></>;
}
