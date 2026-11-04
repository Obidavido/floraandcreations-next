import { AccountSectionView } from "@/components/AccountSectionView";
import { AccountShell } from "@/components/AccountShell";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata("Account", "Manage your Flora and Creations account.", "/account", { noIndex: true });
export default async function AccountSectionPage({ params }: { params: Promise<{ section: string[] }> }) { const { section } = await params; return <section className="section container account-management-section"><AccountShell title="Your account" description="Manage your orders, delivery details, wishlist and profile."><AccountSectionView section={section} /></AccountShell></section>; }
