import { serverFetch } from "@/lib/serverFetch";
import Link from "next/link";
import ProductsClient from '@/components/product/ProductsClient';
import { PRIX_GUIDES } from '@/lib/utils/prixGuides';

export const metadata = {
  title: 'Tous les Produits — Électronique Dakar Fann | Tekalis Sénégal',
  description:
    'Découvrez tous nos produits électroniques à Dakar Fann : smartphones iPhone Samsung, ordinateurs portables HP Dell Lenovo, TV 4K, électroménager. Livraison rapide dans toute la région de Dakar. Garantie constructeur incluse.',
  keywords: [
    'électronique Dakar Fann', 'smartphones Dakar', 'laptops Sénégal', 'TV Dakar',
    'électroménager Dakar', 'gaming Dakar', 'accessoires tech Sénégal', 'Tekalis'
  ],
  alternates: { canonical: 'https://tekalis.com/products' },
  openGraph: {
    title: 'Tous les Produits — Électronique Dakar Fann | Tekalis',
    description: 'Catalogue complet électronique à Dakar Fann. Smartphones, laptops, TV, électroménager. Livraison rapide.',
    url: 'https://tekalis.com/products',
    siteName: 'Tekalis Sénégal',
    locale: 'fr_SN',
  },
};

export const revalidate = 3600;

async function getProducts() {
  const data = await serverFetch('/products?limit=200');
  return data?.data || data?.products || (Array.isArray(data) ? data : []);
}

export default async function ProductsPage() {
  const products = await getProducts();

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Tous les produits Tekalis',
    description: 'Catalogue complet de produits électroniques à Dakar, Sénégal',
    url: 'https://tekalis.com/products',
    numberOfItems: products.length,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {/* H1 server-rendered : le catalogue est un client component, cf. RSC / HW curl. */}
      <h1 className="sr-only">
        Tous les Produits — Électronique high-tech à Dakar Fann, livraison partout au Sénégal
      </h1>
      {/* Bandeau "Guides de prix" — cible les requêtes "prix ... fcfa" */}
      <div className="bg-white dark:bg-surface-800 border-b border-surface-100 dark:border-surface-700">
        <div className="container mx-auto px-4 py-4 flex flex-wrap items-center gap-3">
          <span className="text-sm font-bold text-surface-900 dark:text-white">
            💰 Guides des prix&nbsp;:
          </span>
          {PRIX_GUIDES.map((guide) => (
            <Link
              key={guide.slug}
              href={`/prix/${guide.slug}`}
              className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-semibold"
            >
              {guide.h1}
            </Link>
          ))}
          <Link
            href="/prix"
            className="text-xs text-surface-600 dark:text-surface-300 hover:text-brand-600 font-semibold"
          >
            Voir tout →
          </Link>
        </div>
      </div>
      <ProductsClient initialProducts={products} />
    </>
  );
}
