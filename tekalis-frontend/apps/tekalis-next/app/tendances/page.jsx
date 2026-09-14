import { serverFetch } from '@/lib/serverFetch';
import TrendsClient from '@/components/trends/TrendsClient';
import { SITE_URL } from '@/lib/utils/prixGuides';

export const metadata = {
  title: 'Tendances des recherches de téléphones au Sénégal — Tekalis',
  description:
    "Les recherches de téléphones les plus populaires au Sénégal en ce moment : prix iPhone, Samsung Galaxy, téléphones pas chers en FCFA. Retrouvez les modèles demandés en stock chez Tekalis.",
  keywords: [
    'tendance recherche téléphone senegal', 'phone le plus recherché dakar',
    'prix téléphone en fcfa', 'smartphone tendance senegal 2026',
    'iphone tendance dakar', 'samsung le plus demandé senegal',
  ],
  alternates: { canonical: `${SITE_URL}/tendances` },
  openGraph: {
    type: 'website',
    title: 'Tendances des recherches de téléphones au Sénégal — Tekalis',
    description: 'Les téléphones les plus recherchés par les Sénégalais, avec les prix du jour en FCFA.',
    url: `${SITE_URL}/tendances`,
    siteName: 'Tekalis Sénégal',
    locale: 'fr_SN',
  },
};

export const revalidate = 3600;

async function getSuggestions() {
  try {
    const res = await serverFetch('/trends/suggestions?new=1&limit=100');
    return res?.suggestions || [];
  } catch {
    return [];
  }
}

async function getProducts() {
  try {
    const res = await serverFetch('/products?limit=12&sort=rating');
    return res?.data || res?.products || [];
  } catch {
    return [];
  }
}

export default async function TendancesPage() {
  const [suggestions, products] = await Promise.all([getSuggestions(), getProducts()]);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Recherches de téléphones populaires au Sénégal',
    description: 'Les requêtes de recherche les plus populaires sur les iPhone et Samsung au Sénégal.',
    url: `${SITE_URL}/tendances`,
    numberOfItems: suggestions.length,
    itemListElement: suggestions.map((s, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: s.query,
      ...(s.guideSlug ? { url: `${SITE_URL}/prix/${s.guideSlug}` } : {}),
      ...(s.productSlug ? { url: `${SITE_URL}/products/${s.productSlug}` } : {}),
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <TrendsClient suggestions={suggestions} products={products} />
    </>
  );
}