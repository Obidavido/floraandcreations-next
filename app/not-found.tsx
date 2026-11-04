import Link from "next/link";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("Page not found", "The Flora and Creations page you requested could not be found.", "/404", { noIndex: true });

export default function NotFound() { return <div className="section container"><div className="empty-state"><p className="eyebrow">404</p><h1>That arrangement has moved.</h1><p>Let us take you back to flowers and gifts that are ready to be discovered.</p><Link className="button button-primary" href="/shop">Browse the shop</Link></div></div>; }
