import { pageMetadata } from "@/lib/seo";
import { AccountView } from "@/components/AccountView";
import { AccountShell } from "@/components/AccountShell";
export const metadata = pageMetadata("Your account", "Manage your Flora and Creations account.", "/account", { noIndex: true });
export default function AccountPage() { return <section className="section container account-management-section"><AccountShell title="Your account" description="Manage your orders, delivery details, wishlist and profile."><AccountView /></AccountShell></section>; }
