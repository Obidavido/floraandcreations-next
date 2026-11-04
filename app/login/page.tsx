import { Suspense } from "react";
import { pageMetadata } from "@/lib/seo";
import { AuthForm } from "@/components/AuthForm";
export const metadata = pageMetadata("Sign in", "Sign in to manage your Flora and Creations orders.", "/login", { noIndex: true });
export default function LoginPage() { return <section className="section container"><div className="auth-card"><p className="eyebrow">Welcome back</p><h1>Sign in.</h1><Suspense fallback={<div className="form-card"><p>Loading sign in…</p></div>}><AuthForm mode="login" /></Suspense></div></section>; }
