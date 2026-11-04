import Image from "next/image";
import Link from "next/link";
import { getCategories, getProducts } from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("Bouquets & Gifts, Abuja", "Handcrafted bouquets, gift boxes, chocolates, wines and more — delivered across Abuja.");

export default async function HomePage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  return <>
    <section className="hero"><div className="container hero-grid"><div>
      <p className="eyebrow">Flowers, gifts & little joys</p>
      <h1>Say it with something in bloom.</h1>
      <p className="lede">Handcrafted bouquets and considered gifts for birthdays, anniversaries, weddings and the moments that deserve a little more feeling.</p>
      <div className="hero-actions"><Link className="button button-primary" href="/shop">Shop the collection</Link><Link className="button button-secondary" href="/contact">Make an enquiry</Link></div>
    </div><div className="hero-media"><Image src="/hero-bouquet.webp" alt="A colourful Flora and Creations bouquet" width={1080} height={1080} priority /></div></div></section>
    <section className="promise-strip"><div className="container promise-grid"><div><strong>Same-day delivery</strong><span>Across Abuja for eligible orders</span></div><div><strong>Arranged with care</strong><span>Fresh, thoughtful and beautifully finished</span></div><div><strong>Easy to order</strong><span>We are here when you need a hand</span></div></div></section>
    <section className="section container"><div className="section-header"><div><p className="eyebrow">The collection</p><h2>Choose a little beauty.</h2></div><p>From romantic roses to joyful mixed flowers, discover arrangements made for your people and your moments.</p></div><div className="category-pills">{categories.map((category) => <Link key={category.id} className="category-pill" href={`/shop?category=${category.slug}`}>{category.name}</Link>)}</div></section>
    <section className="section container"><div className="section-header"><div><p className="eyebrow">Most loved</p><h2>Made to be remembered.</h2></div><Link className="text-link" href="/shop">View all arrangements ↗</Link></div><div className="product-grid">{products.filter((product) => product.featured).slice(0, 6).map((product) => <ProductCard key={product.id} product={product} />)}</div></section>
    <section className="section container"><div className="soft-panel"><div className="section-header"><div><p className="eyebrow">For the big days</p><h2>Planning a wedding or event?</h2></div><Link className="button button-primary" href="/contact">Talk to our team</Link></div><p className="lede">Tell us the date, palette and feeling you have in mind. We will help you shape florals that feel like you.</p></div></section>
  </>;
}
