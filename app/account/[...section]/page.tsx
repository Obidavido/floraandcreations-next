import { AccountSectionView } from "@/components/AccountSectionView";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata("Account", "Manage your Flora and Creations account.", "/account", { noIndex: true });
export default async function AccountSectionPage({ params }: { params: Promise<{ section: string[] }> }) { const { section } = await params; return <section className="section container"><AccountSectionView section={section} /></section>; }
