import OrderDetailsClient from "@/components/account/OrderDetailsClient";

export default async function OrderDetailPage({ params }) {
  const { id } = await params;
  return <OrderDetailsClient orderId={id} />;
}
