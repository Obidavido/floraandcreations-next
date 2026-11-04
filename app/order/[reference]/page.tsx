import { OrderTrackingView } from "@/components/OrderTrackingView";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("Track your order", "Track a Flora and Creations order by reference.", "/order/track", { noIndex: true });

export default async function OrderPage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  return <OrderTrackingView reference={reference} />;
}
