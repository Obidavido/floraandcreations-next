import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata("Admin", "Flora and Creations administration.", "/admin", { noIndex: true });
export default function AdminPage() { return <><div className="admin-bar"><div className="container">Private administration area</div></div><section className="section container"><div className="empty-state"><p className="eyebrow">Admin dashboard</p><h1>Sign in to manage the shop.</h1><p>Products, orders, categories, delivery zones, customers, staff and settings remain protected behind the existing API.</p><Link className="button button-primary" href="/admin/login">Admin sign in</Link></div></section></>; }
