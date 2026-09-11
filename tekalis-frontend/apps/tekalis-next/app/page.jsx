import { serverFetch } from "@/lib/serverFetch";
import HomeClient from '@/components/home/HomeClient';

export const metadata = {
  title: 'Tekalis — Boutique Électronique Dakar Fann | Livraison Sénégal',
  description:
    'Boutique électronique en ligne au Sénégal : smartphones, laptops, TV et électroménager à Dakar Fann. Achetez sur Tekalis avec livraison rapide.',
  keywords: [
    'boutique électronique Dakar', 'magasin high-tech Dakar', 'acheter électronique en ligne Sénégal',
    'site e-commerce électronique Sénégal', 'Tekalis', 'smartphones Dakar', 'ordinateurs Sénégal', 'TV électroménager Dakar'
  ],
  alternates: { canonical: 'https://tekalis.com/' },
  openGraph: {
    title: 'Tekalis — Boutique Électronique Dakar Fann',
    description: 'Boutique électronique en ligne au Sénégal. Smartphones, laptops, TV et électroménager à Dakar Fann, livraison rapide.',
    url: 'https://tekalis.com',
    siteName: 'Tekalis Sénégal',
    locale: 'fr_SN',
    type: 'website',
  },
};

export const revalidate = 3600;

async function getHomeData() {
  const [productsData, articlesData] = await Promise.allSettled([
    serverFetch('/products'),
    serverFetch('/articles?limit=3'),
  ]);

  const products =
    productsData.status === 'fulfilled'
      ? productsData.value?.data || productsData.value?.products || productsData.value || []
      : [];

  const articles =
    articlesData.status === 'fulfilled'
      ? articlesData.value?.articles || articlesData.value?.data || []
      : [];

  return { products, articles };
}

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

export default async function HomePage() {
  const { products, articles } = await getHomeData();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      {/* Passe les données SSR au composant client pour SEO */}
      <HomeClient initialProducts={products} initialArticles={articles} />
    </>
  );
}