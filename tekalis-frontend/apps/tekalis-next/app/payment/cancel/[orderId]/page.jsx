import { permanentRedirect } from "next/navigation";
import PaymentCancelClient from "@/components/payment/PaymentCancelClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PaymentCancelPage({ params }) {
  const { orderId } = await params;

  if (!orderId || typeof orderId !== "string") {
    permanentRedirect("/dashboard/orders");
  }

  return <PaymentCancelClient orderId={orderId} />;
}