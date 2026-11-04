import { CheckoutView } from "@/components/CheckoutView";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("Checkout", "Complete your Flora and Creations order.", "/checkout", { noIndex: true });

export default function CheckoutPage() {
  return <CheckoutView />;
}
