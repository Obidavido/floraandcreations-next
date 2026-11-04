import Link from "next/link";
import { getProducts } from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("Shop flowers and gifts", "Explore bouquets and thoughtful gifts from Flora and Creations, arranged and delivered across Abuja.", "/shop");

const shopTypes = ["All", "Bouquets", "Arrangements", "Wreaths", "Plants"];
const giftAddOns = [["Fruit Wine", "₦5,000"], ["Gift Card", "₦1,000"], ["Teddy Bear", "₦8,000"], ["Chocolates", "₦4,000"], ["Cookies", "₦3,000"], ["Cake", "₦12,000"], ["Vase Upgrade", "₦2,000"]];

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const products = await getProducts();
  const category = (await searchParams).category;
  const filtered = category && category !== "all" ? products.filter((product) => product.category.toLowerCase() === category.toLowerCase() || product.slug.includes(category)) : products;
  return <>
    <section className="legacy-hero legacy-hero-compact"><div className="container"><p className="eyebrow">Handcrafted in Abuja</p><h1>Celebrate Life&apos;s Special Moment with Fresh Flowers</h1><p className="lede">Bouquets, gift boxes, chocolates, wines and more beautifully arranged and delivered across Abuja the same day.</p></div></section>
    <section className="section container shop-home-section"><div className="section-header"><div><p className="eyebrow">Shop by Type</p><h2>Find something beautiful.</h2></div></div><div className="category-pills">{shopTypes.map((type) => <Link key={type} className={`category-pill${(category || "all") === type.toLowerCase() ? " category-pill-active" : ""}`} href={type === "All" ? "/shop" : `/shop?category=${type.toLowerCase()}`}>{type}</Link>)}</div><div className="shop-meta"><span>Showing {filtered.length} of 13 products</span><label>Sort <select defaultValue="newest" aria-label="Sort products"><option value="newest">Newest</option><option value="popular">Popularity</option><option value="low">Price — low to high</option><option value="high">Price — high to low</option></select></label></div><div className="product-grid">{filtered.map((product) => <ProductCard key={product.id} product={product} />)}</div><div className="pager"><Link className="text-link" href="#">Prev</Link><span>1</span><Link className="text-link" href="#">2</Link><Link className="text-link" href="#">Next</Link></div></section>
    <section className="section container"><div className="gift-panel"><div className="section-header"><div><p className="eyebrow">Complete the gift</p><h2>A little something extra makes it unforgettable.</h2></div></div><div className="gift-grid">{giftAddOns.map(([name, price]) => <div className="gift-card" key={name}><strong>{name}</strong><span>{price}</span></div>)}</div></div></section>
    <section className="promise-strip"><div className="container promise-grid"><div><strong>Freshness guaranteed</strong><span>Arranged the same day</span></div><div><strong>Same-day delivery</strong><span>Across Abuja</span></div><div><strong>Store pickup</strong><span>Jahi Plaza, Abuja</span></div></div></section>
  </>;
}
