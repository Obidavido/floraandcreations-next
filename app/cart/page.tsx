import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata("Your cart", "Review your Flora and Creations arrangements before checkout.", "/cart", { noIndex: true });
export default function CartPage() { return <section className="section container"><div className="empty-state"><p className="eyebrow">Your cart</p><h1>Nothing here yet.</h1><p>Find something beautiful and we will keep it ready for checkout.</p><Link className="button button-primary" href="/shop">Browse the shop</Link></div></section>; }
