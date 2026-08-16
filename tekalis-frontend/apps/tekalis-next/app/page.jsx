import { serverFetch } from "@/lib/serverFetch";
import HomeClient from '@/components/home/HomeClient';

export const metadata = {
  title: 'Tekalis — Boutique Électronique Dakar Fann | Smartphones, Laptops, TV | Livraison Sénégal',
  description:
    'Tekalis, votre boutique électronique à Dakar Fann. Smartphones iPhone Samsung, ordinateurs portables HP Dell Lenovo, TV 4K, électroménager. Livraison rapide dans toute la région de Dakar. Paiement Wave, Orange Money, Free Money. Garantie constructeur incluse.',
  keywords: [
    'électronique Dakar Fann', 'smartphone Dakar', 'ordinateur portable Sénégal', 'TV Dakar',
    'électroménager Dakar', 'boutique tech Dakar', 'Tekalis', 'livraison Dakar',
    'iPhone Dakar', 'Samsung Sénégal', 'PC portable Dakar', 'climatiseur Dakar'
  ],
  alternates: { canonical: 'https://tekalis.com/' },
  openGraph: {
    title: 'Tekalis — Boutique Électronique Dakar Fann | Smartphones, Laptops, TV',
    description: 'Smartphones, ordinateurs, TV et électroménager à Dakar Fann. Livraison rapide dans toute la région de Dakar. Garantie incluse.',
    url: 'https://tekalis.com',
    siteName: 'Tekalis Sénégal',
    locale: 'fr_SN',
    type: 'website',
  },
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