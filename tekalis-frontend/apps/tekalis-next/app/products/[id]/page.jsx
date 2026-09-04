import { permanentRedirect } from "next/navigation";
import { serverFetch } from "@/lib/serverFetch";
import ProductDetailClient from '@/components/product/ProductDetailClient';

const SITE_URL = 'https://tekalis.com';

const BLOCKED_STATUSES = new Set(['discontinued']);

export async function generateMetadata({ params }) {
  try {
    const { id } = await params;
    const product = await fetchProduct(id);

    // Produit absent → la page fera un redirect() vers /products :
    // inutile de renvoyer des métadonnées (aucune page n'est rendue).
    if (!product || product === "not-found") return {};

    const path = product.slug || id;
    return {
      title: `${product.name || 'Produit'} | Tekalis Sénégal`,
      description: product.metaDescription || product.description?.substring(0, 160) || 'Achetez au meilleur prix au Sénégal. Livraison rapide à Dakar.',
      alternates: { canonical: `${SITE_URL}/products/${path}` },
    };
  } catch {
    // Erreur transitoire (cold start Render, timeout) : on affiche un état
    // d'erreur, PAS une page noindex. On laisse les métadonnées par défaut.
    return {};
  }
}

export const revalidate = 3600;

export default async function ProductPage({ params }) {
  const { id } = await params;

  const product = await fetchProduct(id);

  // Produit réellement absent (vraie 404 API) :
  // c'est un vieux produit supprimé → on redirige vers le catalogue parent
  // plutôt que de servir une 404 (nettoie les erreurs "Introuvable (404)"
  // de Google Search Console).
  if (product === "not-found") {
    permanentRedirect('/products');
  }

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

  // Produit discontinué → page "morte" pour le SEO, on redirige vers le catalogue.
  if (BLOCKED_STATUSES.has(product.status)) {
    permanentRedirect('/products');
  }

  // Une URL _id redirige vers l'URL canonique slug (respecte aussi le canonical).
  if (product.slug && product.slug !== id) {
    permanentRedirect(`/products/${product.slug}`);
  }

  return <ProductDetailClient product={product} />;
}

/**
 * Récupère un produit en distinguant :
 *  - un produit réel (objet)
 *  - une vraie absence (renvoie "not-found", → on redirige vers /products)
 *  - une erreur transitoire (renvoie null, → pas de 404, pas de redirect)
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