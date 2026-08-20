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
      };
    }

    return {
      title: `${product.name || 'Produit'} | Tekalis Sénégal`,
      description: product.description?.substring(0, 160) || 'Achetez au meilleur prix au Sénégal. Livraison rapide à Dakar.',
    };
  } catch {
    return {
      title: 'Produit | Tekalis Sénégal',
      description: 'Achetez au meilleur prix au Sénégal. Livraison rapide à Dakar.',
    };
  }
}

export const revalidate = 3600;

export default async function ProductPage({ params }) {
  try {
    const { id } = await params;
    const res = await serverFetch(`/products/${id}`);
    const product = res?.data || res;

    if (!product) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Produit introuvable</h1>
            <p className="text-gray-600 mb-6">Ce produit n'existe pas ou a été supprimé.</p>
            <a href="/products" className="text-blue-600 hover:underline">Voir tous les produits</a>
          </div>
        </div>
      );
    }

    return <ProductDetailClient product={product} />;
  } catch (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Erreur de chargement</h1>
          <p className="text-gray-600 mb-6">Une erreur est survenue lors du chargement du produit.</p>
          <a href="/products" className="text-blue-600 hover:underline">Voir tous les produits</a>
        </div>
      </div>
    );
  }
}
