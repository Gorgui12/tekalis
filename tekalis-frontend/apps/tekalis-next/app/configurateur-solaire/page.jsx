import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import JsonLd from '@/components/seo/JsonLd';
import { fetchSolarProducts } from '@/lib/solar/serverData';
import { WARNINGS } from '@/lib/solar/constants';

const SolarConfigurator = dynamic(() => import('@/components/solar/SolarConfigurator'));

export const revalidate = 3600;

const OG_IMAGE = `/api/og?title=${encodeURIComponent('Configurateur de kit solaire')}&subtitle=${encodeURIComponent('Dimensionnement gratuit — estimation indicative')}`;

export const metadata = {
  title: 'Configurateur de kit solaire - Tekalis',
  description: 'Calculez le kit solaire adapté à vos appareils au Sénégal. Estimation indicative gratuite.',
  alternates: { canonical: '/configurateur-solaire' },
  openGraph: {
    title: 'Configurateur de kit solaire - Tekalis',
    description: 'Calculez le kit solaire adapté à vos appareils au Sénégal.',
    url: '/configurateur-solaire',
    type: 'website',
    images: [{ url: OG_IMAGE, width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
};

export default async function SolarConfiguratorPage() {
  const products = await fetchSolarProducts();

  const webAppLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Configurateur de kit solaire Tekalis',
    applicationCategory: 'UtilityApplication',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'XOF' },
    operatingSystem: 'Web',
    inLanguage: 'fr',
  };

  return (
    <>
      <JsonLd data={webAppLd} />
      <main>
        {/* Titre + avertissement rendus cote serveur : le composant client est
            suspendu (useSearchParams) au premier rendu, ils n'apparaitraient
            pas dans le HTML servi aux crawlers. */}
        <div className="max-w-4xl mx-auto px-4 pt-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-3">
            Configurateur de kit solaire au Sénégal
          </h1>
          <p className="text-sm text-gray-700 mb-4">
            Dimensionnez votre kit en 4 étapes : appareils, contraintes, résultats, devis.
            {' '}{WARNINGS.indicative}
          </p>
        </div>
        <Suspense fallback={<div className="p-4">Chargement...</div>}>
          <SolarConfigurator products={products} />
        </Suspense>
      </main>
    </>
  );
}
