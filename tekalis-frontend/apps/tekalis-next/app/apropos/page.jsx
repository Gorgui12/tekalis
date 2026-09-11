export const metadata = {
  title: "À propos de Tekalis | Boutique Électronique Dakar Fann",
  description: "Boutique en ligne fiable du Sénégal, Tekalis livre vos produits électroniques à Dakar Fann. Payez à la livraison ou par Wave : garantie et livraison rapide.",
  keywords: ['à propos tekalis', 'boutique en ligne fiable Sénégal', 'acheter en ligne payer à la livraison Sénégal', 'paiement Wave Dakar'],
  alternates: { canonical: 'https://tekalis.com/apropos' },
  openGraph: {
    title: 'À propos de Tekalis | Boutique Électronique Dakar',
    description: 'Boutique en ligne fiable : produits électroniques à Dakar Fann, paiement à la livraison ou par Wave, garantie incluse.',
    url: 'https://tekalis.com/apropos',
    siteName: 'Tekalis Sénégal',
    locale: 'fr_SN',
  },
};

export default function AProposPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-6">À propos de Tekalis</h1>
      <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
        Tekalis est une boutique en ligne fiable, basée à Dakar Fann au Sénégal.
        Nous proposons une large gamme de produits électroniques, informatiques et high-tech
        avec des prix compétitifs et un service client réactif.
      </p>
      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
        Achetez en ligne et payez à la livraison ou par mobile money (Wave, Orange Money).
        Chaque produit bénéficie d&apos;une garantie et nous assurons une livraison rapide
        dans toute la région de Dakar.
      </p>
    </main>
  );
}