import Link from "next/link";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("Admin section", "Flora and Creations administration.", "/admin", { noIndex: true });

const sectionTitles: Record<string, string> = {
  products: "Products & variants",
  orders: "Orders",
  categories: "Categories",
  "add-ons": "Gift add-ons",
  "delivery-zones": "Delivery zones",
  customers: "Customers",
  staff: "Staff access",
  "activity-logs": "Activity logs",
  settings: "Store settings",
  "stats/summary": "Dashboard summary"
};

export default async function AdminSectionPage({ params }: { params: Promise<{ section: string[] }> }) {
  const section = (await params).section.join("/");
  const title = sectionTitles[section];

  return <>
    <header className="page-hero admin-page-hero">
      <div className="container">
        <p className="eyebrow">Flora &amp; Creations · Administration</p>
        <h1>{title || "Admin section"}.</h1>
        <p>{title ? "This route belongs to the store administration workspace." : "This address does not match a recognized administration section."}</p>
      </div>
    </header>
    <section className="section container admin-section" aria-label="Admin section status">
      <div className="admin-section-notice">
        <p className="eyebrow">Workspace status</p>
        <h2>{title ? "Management screen not available yet." : "Section not found."}</h2>
        <p className="detail-copy">{title
          ? "The backend provides protected API endpoints for this area, but the storefront does not yet include its management interface. The API continues to enforce admin and staff permissions."
          : "Return to the administration overview to see the dashboard summary and your current access status."}</p>
        <div className="hero-actions">
          <Link className="button button-primary" href="/admin">Back to admin overview</Link>
          <Link className="button button-secondary" href="/">Visit storefront</Link>
        </div>
      </div>
    </section>
  </>;
}
