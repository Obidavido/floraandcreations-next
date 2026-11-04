import Link from "next/link";
import { getProducts } from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("Celebrate life's special moments", "Fresh flowers, gift boxes, chocolates and wines beautifully arranged and delivered across Abuja.");

export default async function HomePage() {
  const products = await getProducts();
  return <>
    <section className="legacy-hero"><div className="container">
      <p className="eyebrow">Handcrafted in Abuja</p>
      <h1>Celebrate Life&apos;s Special Moment with Fresh Flowers</h1>
      <p className="lede">Bouquets, gift boxes, chocolates, wines and more beautifully arranged and delivered across Abuja the same day.</p>
      <Link className="button button-primary" href="/shop">Shop now</Link>
    </div></section>

    <section className="section container shop-home-section">
      <div className="section-header"><div><p className="eyebrow">Shop by Type</p><h2>Find something beautiful.</h2></div></div>
      <div className="shop-meta"><span>{products.length} products from our live catalogue</span><Link className="text-link" href="/shop">View all</Link></div>
      <div className="product-grid">{products.slice(0, 9).map((product) => <ProductCard key={product.id} product={product} />)}</div>
    </section>

    <section className="promise-strip"><div className="container promise-grid"><div><strong>Freshness guaranteed</strong><span>Arranged the same day</span></div><div><strong>Same-day delivery</strong><span>Across Abuja</span></div><div><strong>Store pickup</strong><span>Jahi Plaza, Abuja</span></div></div></section>
    <section className="section container"><div className="whatsapp-cta"><div><p className="eyebrow">Same-day orders</p><h2>Need it today? Order on WhatsApp.</h2><p>Chat with us directly for custom arrangements, urgent deliveries, or help picking the perfect bouquet.</p></div><div className="hero-actions"><a className="button button-primary" href="https://wa.me/2347031677165?text=Hi%21%20I%27d%20like%20to%20place%20a%20same-day%20order." target="_blank" rel="noreferrer">Chat with us</a><a className="button button-secondary" href="https://instagram.com/floracreations" target="_blank" rel="noreferrer">@floraandcreations</a></div></div></section>
  </>;
}
