import Link from "next/link";
import Image from "next/image";
import { getCategories, getProducts } from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";
import { pageMetadata } from "@/lib/seo";
import { FaBirthdayCake, FaCandyCane, FaCookieBite, FaGift, FaMagic, FaPaw, FaRegGem, FaWineBottle } from "react-icons/fa";
import type { IconType } from "react-icons";

export const metadata = pageMetadata("Celebrate life's special moments", "Fresh flowers, gift boxes, chocolates and wines beautifully arranged and delivered across Abuja.");

export default async function HomePage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  const visibleProducts = products.slice(0, 9);
  const extras: Array<[string, string, IconType]> = [
    ["Fruit Wine", "₦5,000", FaWineBottle],
    ["Gift Card", "₦1,000", FaGift],
    ["Teddy Bear", "₦8,000", FaPaw],
    ["Chocolates", "₦4,000", FaCandyCane],
    ["Cookies", "₦3,000", FaCookieBite],
    ["Cake", "₦12,000", FaBirthdayCake],
    ["Vase Upgrade", "₦2,000", FaRegGem]
  ];
  return <>
    <section className="original-hero-section"><div className="container">
      <div className="original-status-pills"><span>● Open Now</span><span>Abuja Delivery</span><span>Mon–Sat · 9:00 – 18:00</span></div>
      <div className="original-hero">
        <Image src="/images/original-hero-bouquet.webp" alt="Fresh Flora and Creations bouquet" fill priority sizes="(max-width: 800px) 100vw, 1180px" className="original-hero-image" />
        <div className="original-hero-overlay" aria-hidden="true" />
        <div className="original-hero-copy"><p className="original-hero-kicker">✦ Handcrafted in Abuja</p><h1>Celebrate Life&apos;s Special Moment with Fresh Flowers</h1><p>Bouquets, gift boxes, chocolates, wines and more beautifully arranged and delivered across Abuja the same day.</p><Link className="button original-hero-button" href="/shop">Shop now</Link><div className="hero-dots" aria-hidden="true"><span className="active" /><span /><span /><span /></div></div>
      </div>
    </div></section>

    <section className="section container shop-home-section">
      <div className="section-header"><div><p className="eyebrow">Shop by Type</p><h2>Find something beautiful.</h2></div></div>
      <div className="category-pills"><Link className="category-pill category-pill-active" href="/">All</Link>{categories.map((category) => <Link key={category.id} className="category-pill" href={`/shop?category=${category.slug}`}>{category.name}</Link>)}</div>
      <div className="shop-meta"><span>Showing {visibleProducts.length} of {products.length} products</span><label>Sort <select defaultValue="newest" aria-label="Sort products"><option value="newest">Newest</option><option value="popular">Popularity</option><option value="low">Price — low to high</option><option value="high">Price — high to low</option></select></label></div>
      <div className="product-grid">{visibleProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div>
      <div className="pager"><Link className="text-link" href="/shop">Prev</Link><span>1</span><Link className="text-link" href="/shop">2</Link><Link className="text-link" href="/shop">Next</Link></div>
    </section>

    <section className="section container"><div className="gift-panel"><div className="section-header"><div><p className="eyebrow">Complete the gift</p><h2>A little something extra makes it unforgettable.</h2></div></div><div className="gift-grid">{extras.map(([name, price, Icon]) => <div className="gift-card" key={name}><span className="gift-icon" aria-hidden="true"><Icon /></span><div className="gift-card-copy"><strong>{name}</strong><span>{price}</span></div><span className="gift-card-arrow" aria-hidden="true"><FaMagic /></span></div>)}</div></div>
    </section>

    <section className="promise-strip"><div className="container promise-grid"><div><strong>Freshness guaranteed</strong><span>Arranged the same day</span></div><div><strong>Same-day delivery</strong><span>Across Abuja</span></div><div><strong>Store pickup</strong><span>Jahi Plaza, Abuja</span></div></div></section>
    <section className="section container"><div className="whatsapp-cta"><div><p className="eyebrow">Same-day orders</p><h2>Need it today? Order on WhatsApp.</h2><p>Chat with us directly for custom arrangements, urgent deliveries, or help picking the perfect bouquet.</p></div><div className="hero-actions"><a className="button button-primary" href="https://wa.me/2347031677165?text=Hi%21%20I%27d%20like%20to%20place%20a%20same-day%20order." target="_blank" rel="noreferrer">Chat with us</a><a className="button button-secondary" href="https://instagram.com/floracreations" target="_blank" rel="noreferrer">@floraandcreations</a></div></div></section>
  </>;
}
