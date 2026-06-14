import { serverFetch } from "@/lib/serverFetch";
import ProductsClient from '@/components/product/ProductsClient';

export const metadata = {
  title: 'Tous les Produits — Électronique à Dakar | Tekalis',
  description:
    'Découvrez tous nos produits électroniques à Dakar : smartphones, laptops, TV, électroménager. Livraison rapide au Sénégal, garantie constructeur incluse.',
  alternates: { canonical: 'https://tekalis.com/products' },
};

export const revalidate = 3600;

async function getProducts() {
  try {
    const data = await serverFetch('/products?limit=200');
    return data?.products || data?.data || (Array.isArray(data) ? data : []);
  } catch {
    return [];
  }
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