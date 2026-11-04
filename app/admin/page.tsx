import { AdminAccess } from "@/components/AdminAccess";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata("Admin", "Flora and Creations administration.", "/admin", { noIndex: true });
export default function AdminPage() { return <>
  <header className="page-hero admin-page-hero">
    <div className="container">
      <p className="eyebrow">Flora &amp; Creations · Administration</p>
      <h1>Store administration.</h1>
      <p>A private workspace for authorized administrators and staff.</p>
    </div>
  </header>
  <section className="section container admin-section" aria-label="Admin workspace access">
    <AdminAccess />
  </section>
</>; }
