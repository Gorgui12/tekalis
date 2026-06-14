import OrderDetailsClient from "@/components/account/OrderDetailsClient";
export default function OrderDetailPage({ params }) {
  return <OrderDetailsClient orderId={params.id} />;
}