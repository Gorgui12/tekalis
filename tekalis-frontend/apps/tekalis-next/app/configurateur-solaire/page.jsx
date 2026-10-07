import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import JsonLd from '@/components/seo/JsonLd';
import { serverFetch } from '@/lib/serverFetch';
import { solarCatalog } from '@/lib/solar/catalog';
import overrides from '@/data/solar-overrides.json';

const SolarConfigurator = dynamic(() => import('@/components/solar/SolarConfigurator'));

export const revalidate = 3600;

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

/**
 * Catalogue solaire (produits API annotes par data/solar-overrides.json).
 * L'API peut être injoignable au build : on rend alors le configurateur
 * avec un catalogue vide (dimensionnement seul, devis WhatsApp).
 */
async function getSolarProducts() {
  try {
    const data = await serverFetch('/products?limit=200', { revalidate: 3600 });
    const list = data?.data || data?.products || (Array.isArray(data) ? data : []);
    return solarCatalog(list, overrides);
  } catch {
    return [];
  }
}

export default async function SolarConfiguratorPage() {
  const products = await getSolarProducts();

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
