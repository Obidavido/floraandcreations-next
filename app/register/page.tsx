import { Suspense } from "react";
import { pageMetadata } from "@/lib/seo";
import { AuthForm } from "@/components/AuthForm";
export const metadata = pageMetadata("Create an account", "Create a Flora and Creations account to manage orders and saved addresses.", "/register", { noIndex: true });
export default function RegisterPage() { return <section className="section container"><div className="auth-card"><p className="eyebrow">A better way to order</p><h1>Create an account.</h1><Suspense fallback={<div className="form-card"><p>Loading registration…</p></div>}><AuthForm mode="register" /></Suspense></div></section>; }
