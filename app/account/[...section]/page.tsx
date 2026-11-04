import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata("Account", "Manage your Flora and Creations account.", "/account", { noIndex: true });
export default async function AccountSectionPage({ params }: { params: Promise<{ section: string[] }> }) { const section = (await params).section.join("/"); return <section className="section container"><div className="empty-state"><p className="eyebrow">Account / {section}</p><h1>Sign in to continue.</h1><p>This customer area is protected and connects to the existing Flora and Creations account API.</p><Link className="button button-primary" href={`/login?redirect=%2Faccount%2F${section}`}>Sign in</Link></div></section>; }
