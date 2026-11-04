import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata("Track your order", "Track a Flora and Creations order by reference.", "/order/track", { noIndex: true });
export default async function OrderPage({ params }: { params: Promise<{ reference: string }> }) { const { reference } = await params; return <section className="section container"><div className="empty-state"><p className="eyebrow">Order {reference}</p><h1>Order details are private.</h1><p>When your order is placed, this page will show its current status and delivery information.</p><Link className="button button-primary" href="/contact">Contact the team</Link></div></section>; }
