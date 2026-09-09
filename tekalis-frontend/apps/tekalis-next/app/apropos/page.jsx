export const metadata = {
  title: "À propos de Tekalis | Boutique Électronique Dakar Fann",
  description: "Tekalis est votre boutique d'électronique et high-tech à Dakar Fann, Sénégal. Smartphones, laptops, TV, électroménager. Garantie constructeur et livraison rapide.",
  keywords: ['à propos tekalis', 'boutique électronique Dakar', 'qui est tekalis', 'projet tekalis Sénégal'],
  alternates: { canonical: 'https://tekalis.com/apropos' },
  openGraph: {
    title: 'À propos de Tekalis | Boutique Électronique Dakar',
    description: 'Tekalis, votre boutique d\'électronique à Dakar Fann, Sénégal.',
    url: 'https://tekalis.com/apropos',
    siteName: 'Tekalis Sénégal',
    locale: 'fr_SN',
  },
};

export default function AProposPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-6">À propos de Tekalis</h1>
      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
        Tekalis est votre boutique d&apos;lectronique de confiance basée à Dakar, Sénégal.
        Nous proposons une large gamme de produits électroniques, informatiques et high-tech
        avec des prix compétitifs et un service client réactif.
      </p>
    </main>
  );
}