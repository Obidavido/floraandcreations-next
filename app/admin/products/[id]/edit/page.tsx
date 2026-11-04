import { AdminCatalog } from "@/components/AdminCatalog";
import { AdminShell } from "@/components/AdminShell";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("Edit product", "Update a Flora and Creations catalog product.", "/admin/products", { noIndex: true });

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <section className="section container admin-management-section"><AdminShell title="Edit product" description="Update product details, images, variants and visibility."><AdminCatalog section="products" standalone={id} /></AdminShell></section>;
}
