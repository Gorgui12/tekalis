import { permanentRedirect } from "next/navigation";
import PaymentSuccessClient from "@/components/payment/PaymentSuccessClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PaymentSuccessPage({ params }) {
  const { orderId } = await params;

  if (!orderId || typeof orderId !== "string") {
    permanentRedirect("/dashboard/orders");
  }

  return <PaymentSuccessClient orderId={orderId} />;
}