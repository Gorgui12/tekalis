import { serverFetch } from "@/lib/serverFetch";
import HomeClient from '@/components/home/HomeClient';
import HomeSeoContent from '@/components/home/HomeSeoContent';

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

export const revalidate = 300;

async function getHomeData() {
  // DFT-1 : les sections de l'accueil sont alimentées par des requêtes DÉDIÉES
  // (homepageSection + limit=8) et non plus filtrées dans un lot de 20 produits.
  // Le pool (limit=200) ne sert qu'au repli quand une section n'est pas
  // renseignée en admin (vedettes / plus récents / ventes / prix barré).
  const [poolRes, newRes, bestRes, promoRes, articlesRes] = await Promise.allSettled([
    serverFetch('/products?limit=200', { revalidate: 300 }),
    serverFetch('/products?homepageSection=new&limit=8', { revalidate: 300 }),
    serverFetch('/products?homepageSection=bestseller&limit=8', { revalidate: 300 }),
    serverFetch('/products?homepageSection=promo&limit=8', { revalidate: 300 }),
    serverFetch('/articles?limit=3'),
  ]);

  const unwrap = (res) =>
    res.status === 'fulfilled'
      ? res.value?.data || res.value?.products || (Array.isArray(res.value) ? res.value : [])
      : [];

  const articles =
    articlesRes.status === 'fulfilled'
      ? articlesRes.value?.articles || articlesRes.value?.data || []
      : [];

  return {
    products: unwrap(poolRes),
    newProducts: unwrap(newRes),
    bestProducts: unwrap(bestRes),
    promoProducts: unwrap(promoRes),
    articles,
  };
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
  const { products, newProducts, bestProducts, promoProducts, articles } = await getHomeData();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      {/* H1 server-rendered : le hero est un client component, cf. RSC / HW curl.
          Invisible (sr-only), conservé pour les crawlers / l'accessibilité. */}
      <h1 className="sr-only">
        Tekalis — Boutique électronique high-tech à Dakar Fann, livraison partout au Sénégal
      </h1>
      {/* Passe les données SSR au composant client pour SEO */}
      <HomeClient
        initialProducts={products}
        initialNew={newProducts}
        initialBest={bestProducts}
        initialPromo={promoProducts}
        initialArticles={articles}
      />
      {/* Contenu SEO server-rendered : volume, maillage interne, NAP, FAQ */}
      <HomeSeoContent />
    </>
  );
}