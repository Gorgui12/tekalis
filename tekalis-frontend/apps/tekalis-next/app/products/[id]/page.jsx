import { notFound } from "next/navigation";
import { serverFetch } from "@/lib/serverFetch";
import ProductDetailClient from '@/components/product/ProductDetailClient';

export async function generateMetadata({ params }) {
  try {
    const { id } = await params;
    const res = await serverFetch(`/products/${id}`);
    const product = res?.data || res;

    if (!product) {
      return {
        title: 'Produit introuvable | Tekalis',
        robots: { index: false },
      };
    }

    return {
      title: `${product.name || 'Produit'} | Tekalis Sénégal`,
      description: product.description?.substring(0, 160) || 'Achetez au meilleur prix au Sénégal. Livraison rapide à Dakar.',
      alternates: { canonical: `https://tekalis.com/products/${id}` },
    };
  } catch {
    return {
      title: 'Produit introuvable | Tekalis',
      robots: { index: false },
    };
  }
}

export const revalidate = 3600;

export default async function ProductPage({ params }) {
  let product;

  try {
    const { id } = await params;
    const res = await serverFetch(`/products/${id}`);
    product = res?.data || res;
  } catch {
    product = null;
  }

  if (!product) notFound();

  return <ProductDetailClient product={product} />;
}
