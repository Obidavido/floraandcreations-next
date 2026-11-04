import { pageMetadata } from "@/lib/seo";
import { AccountView } from "@/components/AccountView";
export const metadata = pageMetadata("Your account", "Manage your Flora and Creations account.", "/account", { noIndex: true });
export default function AccountPage() { return <section className="section container"><AccountView /></section>; }
