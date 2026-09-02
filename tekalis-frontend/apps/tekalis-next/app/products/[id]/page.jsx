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
  const { id } = await params;

  const product = await fetchProduct(id);

  // Un produit absent de la base → vraie page 404 (pour le SEO)
  if (product === "not-found") notFound();

  // Erreur transitoire (cold start Render, timeout, panne réseau)
  // → N'affiche PAS un 404 : on montre un état d'erreur élégant à la place.
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Erreur de chargement</h1>
          <p className="text-gray-600 mb-6">
            Une erreur est survenue lors du chargement du produit. Veuillez réessayer.
          </p>
          <a href="/products" className="text-blue-600 hover:underline">
            Voir tous les produits
          </a>
        </div>
      </div>
    );
  }

  return <ProductDetailClient product={product} />;
}

/**
 * Récupère un produit en distinguant :
 *  - un produit réel (objet)
 *  - une vraie absence (renvoie "not-found", → 404)
 *  - une erreur transitoire (renvoie null, → pas de 404)
 * Le backend Render en free tier fait souvent du cold start : un simple
 * timeout ne doit pas transformer la page en 404.
 */
async function fetchProduct(id) {
  try {
    const res = await serverFetch(`/products/${id}`);
    return res?.data || res || null;
  } catch (err) {
    // serverFetch échoue avec `Error("API <status>: <path>")` sur non-OK,
    // ou avec une erreur réseau/timeout (sans "API ").
    const msg = err?.message || "";
    const m = msg.match(/^API (\d+):/);
    if (m && Number(m[1]) === 404) return "not-found";
    return null;
  }
}
