import ContactClient from "@/components/static/ContactClient";

export const metadata = {
  title: "Contact | Tekalis — Boutique Électronique Dakar Fann",
  description: "Contactez Tekalis à Dakar Fann : +221 78 634 69 46, contact@tekalis.com. Boutique de smartphones, laptops, TV à Fann, Rue 14. Réponse rapide, conseils d'experts.",
  keywords: ['contact tekalis', 'boutique électronique Dakar', 'joindre tekalis', 'adresse tekalis Fann'],
  alternates: { canonical: 'https://tekalis.com/contact' },
  openGraph: {
    title: 'Contact | Tekalis — Boutique Électronique Dakar Fann',
    description: 'Contactez Tekalis à Dakar Fann : +221 78 634 69 46. Fann, Rue 14, Dakar.',
    url: 'https://tekalis.com/contact',
    siteName: 'Tekalis Sénégal',
    locale: 'fr_SN',
  },
};

export default function ContactPage() { return <ContactClient />; }