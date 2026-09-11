import ContactClient from "@/components/static/ContactClient";

export const metadata = {
  title: "Contact | Tekalis — Boutique Électronique Dakar Fann",
  description: "Contactez Tekalis, boutique high-tech Sénégal, à Dakar Fann (Fann, Rue 14) : +221 78 634 69 46. Livraison rapide à Dakar, paiement Wave ou à la livraison.",
  keywords: ['contact tekalis', 'boutique high-tech Sénégal', 'électronique Fann Dakar', 'livraison rapide électronique Dakar'],
  alternates: { canonical: 'https://tekalis.com/contact' },
  openGraph: {
    title: 'Contact | Tekalis — Boutique Électronique Dakar Fann',
    description: 'Boutique high-tech à Dakar Fann : +221 78 634 69 46. Fann, Rue 14, livraison rapide au Sénégal.',
    url: 'https://tekalis.com/contact',
    siteName: 'Tekalis Sénégal',
    locale: 'fr_SN',
  },
};

export default function ContactPage() { return <ContactClient />; }