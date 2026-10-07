import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import JsonLd from '@/components/seo/JsonLd';

const SolarConfigurator = dynamic(() => import('@/components/solar/SolarConfigurator'), { ssr: false });

export const metadata = {
  title: 'Configurateur de kit solaire - Tekalis',
  description: 'Calculez le kit solaire adapté à vos appareils au Sénégal. Estimation indicative gratuite.',
  alternates: { canonical: '/configurateur-solaire' },
  openGraph: {
    title: 'Configurateur de kit solaire - Tekalis',
    description: 'Calculez le kit solaire adapté à vos appareils au Sénégal.',
    url: '/configurateur-solaire',
    type: 'website',
  },
};

export default function SolarConfiguratorPage() {
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
          <SolarConfigurator />
        </Suspense>
      </main>
    </>
  );
}
