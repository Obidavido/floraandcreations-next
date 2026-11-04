import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata("Admin", "Flora and Creations administration.", "/admin", { noIndex: true });
export default async function AdminSectionPage({ params }: { params: Promise<{ section: string[] }> }) { const section = (await params).section.join("/"); return <section className="section container"><div className="empty-state"><p className="eyebrow">Admin / {section}</p><h1>Protected admin route.</h1><p>Sign in through the existing admin authentication flow to continue.</p><Link className="button button-primary" href="/admin/login">Admin sign in</Link></div></section>; }
