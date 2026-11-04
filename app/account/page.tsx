import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata("Your account", "Manage your Flora and Creations account.", "/account", { noIndex: true });
export default function AccountPage() { return <section className="section container"><div className="empty-state"><p className="eyebrow">Your account</p><h1>Sign in to continue.</h1><p>Manage orders, wishlist, saved addresses and settings from your customer account.</p><Link className="button button-primary" href="/login?redirect=%2Faccount">Sign in</Link></div></section>; }
