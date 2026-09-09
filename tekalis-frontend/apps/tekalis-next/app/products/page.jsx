import { serverFetch } from "@/lib/serverFetch";
import ProductsClient from '@/components/product/ProductsClient';

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
      <ProductsClient initialProducts={products} />
    </>
  );
}
