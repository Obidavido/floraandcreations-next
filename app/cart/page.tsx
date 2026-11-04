import { pageMetadata } from "@/lib/seo";
import { CartView } from "@/components/CartView";
export const metadata = pageMetadata("Your cart", "Review your Flora and Creations arrangements before checkout.", "/cart", { noIndex: true });
export default function CartPage() { return <section className="section container"><CartView /></section>; }
