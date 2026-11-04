import { AdminManagementView } from "@/components/AdminManagementView";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("Admin section", "Flora and Creations administration.", "/admin", { noIndex: true });

export default async function AdminSectionPage({ params }: { params: Promise<{ section: string[] }> }) {
  const { section } = await params;
  return <AdminManagementView section={section.join("/")} />;
}
