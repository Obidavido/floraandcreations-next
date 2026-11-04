import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata("Admin sign in", "Sign in to the Flora and Creations administration area.", "/admin/login", { noIndex: true });
export default function AdminLoginPage() { return <>
  <header className="page-hero admin-page-hero">
    <div className="container">
      <p className="eyebrow">Flora &amp; Creations · Administration</p>
      <h1>Admin sign in.</h1>
      <p>Use an approved administrator or staff account to enter the private workspace.</p>
    </div>
  </header>
  <section className="section container admin-login-section">
    <div className="auth-card admin-login-gate">
      <div className="admin-login-gate-copy"><p className="eyebrow">Private workspace gate</p><h2>Team access only</h2><p>Choose your access level and confirm that you are an approved team member. Your account permissions remain the final authority.</p></div>
      <Suspense fallback={<div className="form-card"><p>Loading sign in…</p></div>}><AuthForm mode="admin" /></Suspense>
    </div>
  </section>
</>; }
