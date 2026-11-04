import { AdminCatalog } from "@/components/AdminCatalog";
import { AdminShell } from "@/components/AdminShell";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("Add product", "Create a product in the Flora and Creations catalog.", "/admin/products/new", { noIndex: true });

export default function NewProductPage() {
  return <section className="section container admin-management-section"><AdminShell title="Add product" description="Create a product, upload images and configure its categories."><AdminCatalog section="products" standalone="new" /></AdminShell></section>;
}
