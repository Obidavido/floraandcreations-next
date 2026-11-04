import { CheckoutView } from "@/components/CheckoutView";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata("Checkout", "Review your Flora and Creations order.", "/checkout", { noIndex: true });
export default function CheckoutPage() {
  return <section className="section container"><CheckoutView /></section>;
}
