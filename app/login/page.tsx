import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata("Sign in", "Sign in to manage your Flora and Creations orders.", "/login", { noIndex: true });
export default function LoginPage() { return <section className="section container"><div className="auth-card"><p className="eyebrow">Welcome back</p><h1>Sign in.</h1><form className="form-card"><label>Email<input name="email" type="email" required /></label><label>Password<input name="password" type="password" required /></label><button className="button button-primary" type="submit">Sign in</button><Link className="text-link" href="/register">New here? Create an account</Link></form></div></section>; }
