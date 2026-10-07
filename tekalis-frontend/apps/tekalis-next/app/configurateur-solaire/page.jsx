import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import JsonLd from '@/components/seo/JsonLd';
import { fetchSolarProducts } from '@/lib/solar/serverData';

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
        <Suspense fallback={<div className="p-4">Chargement...</div>}>
          <SolarConfigurator products={products} />
        </Suspense>
      </main>
    </>
  );
}
