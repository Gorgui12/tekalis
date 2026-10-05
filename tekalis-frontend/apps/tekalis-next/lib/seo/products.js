/**
 * lib/seo/products.js
 *
 * Acces serveur aux donnees produit, partage entre `generateMetadata` et le
 * rendu de la page.
 *
 * Next.js 15 : `params` est une Promise et `fetch` n'est plus mis en cache par
 * defaut. `serverFetch` porte `{ next: { revalidate } }`, et `cache()` evite de
 * faire deux appels identiques a l'API pendant le meme rendu.
 */

import { cache } from 'react';
import { serverFetch } from '@/lib/serverFetch';
import { isMongoObjectId, stripTimestampSuffix } from '@/lib/seo/format';

/** Valeur sentinelle : l'API a repondu 404 (et non "on n'a pas su demander"). */
export const PRODUCT_NOT_FOUND = 'not-found';

/**
 * Recupere un produit par slug OU ObjectId.
 * Renvoie `null` si l'API est injoignable (build Vercel, cold start Render),
 * `PRODUCT_NOT_FOUND` si l'API repond 404, l'objet produit sinon.
 */
export const getProduct = cache(async (idOrSlug) => {
  if (!idOrSlug) return null;
  try {
    const res = await serverFetch(`/products/${idOrSlug}`);
    return res?.data || res || null;
  } catch (err) {
    const match = (err?.message || '').match(/^API (\d+):/);
    if (match && Number(match[1]) === 404) return PRODUCT_NOT_FOUND;
    return null;
  }
});

/**
 * Resout l'URL demandee vers un produit + sa cible canonique.
 *
 * Deux legacies a absorber sans casser aucun lien :
 *  1. `/products/<ObjectId>`  — URL de l'ancienne app Vite.
 *  2. `/products/<slug>-<13 chiffres>` — slugs « ancien format » produits par
 *     `resolveUniqueSlug()` (Date.now()), puis regeneres proprement.
 *     Ces URL sont aujourd'hui en 404 mais elles sont encore indexees par
 *     Google (ex. samsung-galaxy-a14-128-go-4-go-1786915894592, 312 impressions).
 */
export const resolveProductRequest = cache(async (idOrSlug) => {
  const direct = await getProduct(idOrSlug);

  if (direct && direct !== PRODUCT_NOT_FOUND) {
    const canonicalSlug = direct.slug || direct._id;
    return {
      product: direct,
      canonicalSlug,
      // 301 uniquement si l'URL demandee n'est pas deja la cible canonique.
      shouldRedirect: Boolean(direct.slug) && direct.slug !== idOrSlug,
    };
  }

  // Cas 2 : ancien slug a suffixe numerique -> on tente le slug sans suffixe.
  if (direct === PRODUCT_NOT_FOUND) {
    const base = stripTimestampSuffix(idOrSlug);
    if (base) {
      const fallback = await getProduct(base);
      if (fallback && fallback !== PRODUCT_NOT_FOUND) {
        return {
          product: fallback,
          canonicalSlug: fallback.slug || fallback._id,
          shouldRedirect: true,
        };
      }
    }
    return { product: null, canonicalSlug: null, notFound: true };
  }

  // API injoignable : on rend la page en mode degrade plutot que de 404.
  return { product: null, canonicalSlug: null, apiUnavailable: true };
});

/**
 * Produits d'une meme categorite, pour le maillage interne (phase 7).
 * Renvoie une liste triee par pertinence : meme marque d'abord, sinon prix proche.
 */
export async function getRelatedProducts(product, limit = 6) {
  const categoryId = product?.category?.[0]?._id || product?.category?.[0];
  if (!categoryId) return [];

  let list = [];
  try {
    const res = await serverFetch(
      `/products?category=${categoryId}&limit=60&fields=_id,slug,name,price,brand,images,comparePrice,stock,status,category`
    );
    const items = res?.data || res?.products || (Array.isArray(res) ? res : []);
    list = Array.isArray(items) ? items : [];
  } catch {
    return [];
  }

  const currentPrice = Number(product?.price) || 0;

  return list
    .filter((item) => item && (item.slug || item._id))
    .filter((item) => (item._id || item.slug) !== (product._id || product.slug))
    .map((item) => {
      const priceGap = Math.abs((Number(item.price) || 0) - currentPrice);
      let score = 0;
      if (item.brand && product?.brand && item.brand === product.brand) score -= 2;
      score += priceGap / 100000;
      if (item.status === 'available' && Number(item.stock) > 0) score -= 0.5;
      return { item, score };
    })
    .sort((a, b) => a.score - b.score)
    .slice(0, limit)
    .map(({ item }) => item);
}

/** Avis approuves reels. Aucune note n'est inventee si la reponse est vide. */
export const getProductReviews = cache(async (productId) => {
  if (!productId || !isMongoObjectId(productId)) return [];
  try {
    const res = await serverFetch(`/reviews/${productId}?limit=5`);
    const reviews = res?.reviews || [];
    return Array.isArray(reviews) ? reviews : [];
  } catch {
    return [];
  }
});
