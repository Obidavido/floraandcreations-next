import Link from "next/link";
import { getCategories, getProducts } from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("Shop flowers and gifts", "Explore bouquets and thoughtful gifts from Flora and Creations, arranged and delivered across Abuja.", "/shop");

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  const category = (await searchParams).category;
  const filtered = category && category !== "all" ? products.filter((product) => product.category.toLowerCase() === category.toLowerCase() || product.slug.includes(category)) : products;
  return <>
    <section className="legacy-hero legacy-hero-compact"><div className="container"><p className="eyebrow">Handcrafted in Abuja</p><h1>Celebrate Life&apos;s Special Moment with Fresh Flowers</h1><p className="lede">Bouquets, gift boxes, chocolates, wines and more beautifully arranged and delivered across Abuja the same day.</p></div></section>
    <section className="section container shop-home-section"><div className="section-header"><div><p className="eyebrow">Shop by Type</p><h2>Find something beautiful.</h2></div></div><div className="category-pills"><Link className={`category-pill${!category || category === "all" ? " category-pill-active" : ""}`} href="/shop">All</Link>{categories.map((type) => <Link key={type.id} className={`category-pill${category === type.slug ? " category-pill-active" : ""}`} href={`/shop?category=${type.slug}`}>{type.name}</Link>)}</div><div className="shop-meta"><span>{filtered.length} live products</span><label>Sort <select defaultValue="newest" aria-label="Sort products"><option value="newest">Newest</option><option value="popular">Popularity</option><option value="low">Price — low to high</option><option value="high">Price — high to low</option></select></label></div><div className="product-grid">{filtered.map((product) => <ProductCard key={product.id} product={product} />)}</div></section>
    <section className="promise-strip"><div className="container promise-grid"><div><strong>Freshness guaranteed</strong><span>Arranged the same day</span></div><div><strong>Same-day delivery</strong><span>Across Abuja</span></div><div><strong>Store pickup</strong><span>Jahi Plaza, Abuja</span></div></div></section>
  </>;
}
