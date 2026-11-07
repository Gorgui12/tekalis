import GuestOrderConfirmationClient from "@/components/order/GuestOrderConfirmationClient";
import { buildPrivateMetadata } from "@/lib/seo/metadata";

// Confirmation de commande invité : URL personnelle, jamais indexée.
export const metadata = buildPrivateMetadata(
  "/commande",
  "Commande confirmée",
  "Confirmation de votre commande Tekalis."
);

export default async function GuestOrderPage({ params, searchParams }) {
  const { id } = await params;
  const { token } = await searchParams;

  return <GuestOrderConfirmationClient orderId={id} token={token} />;
}
