import Link from 'next/link';
import { PRIX_GUIDES, SITE_URL } from '@/lib/utils/prixGuides';

export const metadata = {
  title: 'Guides des prix des téléphones au Sénégal — FCFA | Tekalis',
  description:
    'Les prix des iPhone et Samsung au Sénégal et à Dakar, mis à jour avec les modèles en stock. iPhone 12, 13, Galaxy S24 Ultra, A25, A55, S23 FE : prix en FCFA, garantie, livraison 24-48h.',
  keywords: [
    'prix téléphone dakar', 'prix téléphone sénégal', 'prix iphone dakar en fcfa',
    'prix samsung en fcfa', 'guide prix téléphone sénégal', 'téléphone prix fcfa dakar',
  ],
  alternates: { canonical: `${SITE_URL}/prix` },
  openGraph: {
    type: 'website',
    title: 'Guides des prix des téléphones au Sénégal — FCFA | Tekalis',
    description: "Prix des iPhone et Samsung à Dakar et au Sénégal, mis à jour avec les modèles en stock.",
    url: `${SITE_URL}/prix`,
    siteName: 'Tekalis Sénégal',
    locale: 'fr_SN',
  },
};

export default function PrixIndexPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Guides des prix des téléphones au Sénégal',
    description: 'Prix des iPhone et Samsung en FCFA à Dakar et au Sénégal, mis à jour avec les modèles en stock.',
    url: `${SITE_URL}/prix`,
  };

  return (
    <div className="min-h-screen bg-surface-50 py-8 mt-4 md:mt-8">
      <div className="container mx-auto px-4">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

        {/* Héro */}
        <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-card p-6 md:p-10 mb-8 border border-surface-100">
          <p className="text-sm text-surface-500 dark:text-surface-400 mb-2 font-semibold">
            Guides de prix mis à jour · Dakar · Sénégal
          </p>
          <h1 className="text-2xl md:text-4xl font-bold font-display text-surface-900 dark:text-white mb-4">
            Combien coûtent les iPhone et Samsung à Dakar&nbsp;?
          </h1>
          <p className="text-surface-600 dark:text-surface-300 leading-relaxed max-w-3xl">
            Vous cherchez le prix d&apos;un téléphone en FCFA au Sénégal&nbsp;? Choisissez un modèle
            ci-dessous pour voir les prix du jour des articles{" "}
            <strong>en stock chez Tekalis</strong>, avec livraison 24-48h à Dakar et partout au
            Sénégal, garantie constructeur et paiement à la livraison, Wave ou Orange Money.
          </p>
        </div>

        {/* Liste des guides */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PRIX_GUIDES.map((guide) => (
            <Link
              key={guide.slug}
              href={`/prix/${guide.slug}`}
              className="group bg-white dark:bg-surface-800 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 p-6 border border-surface-100 dark:border-surface-700 flex flex-col"
            >
              <h2 className="text-lg font-bold font-display text-surface-900 dark:text-white mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition">
                {guide.h1}
              </h2>
              <p className="text-sm text-surface-600 dark:text-surface-400 flex-grow">{guide.summary}</p>
              <span className="mt-4 text-sm font-semibold text-brand-600 dark:text-brand-400">
                Voir les prix en FCFA →
              </span>
            </Link>
          ))}
        </div>

        {/* CTA catégorie */}
        <div className="mt-8 bg-brand-600 text-white rounded-2xl p-6 md:p-10 text-center">
          <h2 className="text-xl md:text-2xl font-bold font-display mb-3">
            Vous ne trouvez pas votre téléphone&nbsp;?
          </h2>
          <p className="text-white/90 mb-6 max-w-2xl mx-auto">
            Découvrez tous nos smartphones en ligne : iPhone, Samsung, Xiaomi, Tecno et bien plus,
            avec filtres par prix pour trouver le téléphone au meilleur prix à Dakar.
          </p>
          <Link
            href="/category/smartphones"
            className="inline-block bg-white text-brand-700 font-bold px-8 py-3 rounded-xl hover:bg-surface-50 transition"
          >
            Voir tous les smartphones
          </Link>
        </div>
      </div>
    </div>
  );
}