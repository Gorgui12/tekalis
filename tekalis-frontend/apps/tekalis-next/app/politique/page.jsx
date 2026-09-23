import PolitiqueClient from "@/components/static/PolitiqueClient";

export const metadata = {
  title: "Confidentialité | Tekalis",
  description:
    "Politique de confidentialité de Tekalis — collecte, utilisation et protection de vos données personnelles lors de vos commandes sur tekalis.com.",
  alternates: { canonical: "https://tekalis.com/politique" },
  openGraph: {
    title: "Confidentialité | Tekalis",
    description: "Comment Tekalis collecte, utilise et protège vos données personnelles.",
    url: "https://tekalis.com/politique",
    siteName: "Tekalis Sénégal",
    locale: "fr_SN",
  },
};

export default function PolitiquePage() { return <PolitiqueClient />; }