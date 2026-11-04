import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata("Checkout", "Complete your Flora and Creations order.", "/checkout", { noIndex: true });
export default function CheckoutPage() { return <section className="section container"><div className="empty-state"><p className="eyebrow">Checkout</p><h1>Nothing to checkout yet.</h1><p>Add an arrangement to your cart to continue to delivery and payment.</p><Link className="button button-primary" href="/shop">Choose an arrangement</Link></div></section>; }
