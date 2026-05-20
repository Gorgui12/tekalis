import { serverFetch } from '@/lib/api';
import HomeClient from '@/components/home/HomeClient';

export const metadata = {
  title: 'Tekalis — Boutique Électronique Dakar | Livraison Rapide Sénégal',
  description:
    'Achetez smartphones, laptops, TV et électroménager en ligne au Sénégal. Livraison rapide à Dakar. Garantie constructeur. Paiement Wave, Orange Money ou à la livraison.',
  alternates: { canonical: 'https://tekalis.com/' },
};

// Revalidation toutes les heures
export const revalidate = 3600;

async function getHomeData() {
  try {
    const [productsData, articlesData] = await Promise.allSettled([
      serverFetch('/products?limit=16&sort=newest'),
      serverFetch('/articles?limit=3'),
    ]);

    const products =
      productsData.status === 'fulfilled'
        ? productsData.value?.products || productsData.value?.data || productsData.value || []
        : [];

    const articles =
      articlesData.status === 'fulfilled'
        ? articlesData.value?.articles || articlesData.value?.data || []
        : [];

    return { products, articles };
  } catch {
    return { products: [], articles: [] };
  }
}

export default async function HomePage() {
  const { products, articles } = await getHomeData();

  // Schema.org WebSite (boîte de recherche Google)
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Tekalis',
    url: 'https://tekalis.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: 'https://tekalis.com/products?search={search_term_string}' },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      {/* Passe les données SSR au composant client (interactions) */}
      <HomeClient products={products} articles={articles} />
    </>
  );
}