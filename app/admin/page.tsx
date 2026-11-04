import { AdminAccess } from "@/components/AdminAccess";
import { AdminShell } from "@/components/AdminShell";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata("Admin", "Flora and Creations administration.", "/admin", { noIndex: true });
export default function AdminPage() { return <section className="section container admin-management-section" aria-label="Admin workspace access">
  <AdminShell title="Dashboard overview" description="Store performance and operational overview.">
    <AdminAccess />
  </AdminShell>
</section>; }
