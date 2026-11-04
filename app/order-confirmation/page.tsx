import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata("Order confirmation", "Check the status of your Flora and Creations order.", "/order-confirmation", { noIndex: true });
export default function OrderConfirmationPage() { return <section className="section container"><div className="empty-state"><p className="eyebrow">Order confirmation</p><h1>We are ready when you are.</h1><p>Your order reference and payment instructions will appear here after checkout.</p><Link className="button button-primary" href="/shop">Continue shopping</Link></div></section>; }
