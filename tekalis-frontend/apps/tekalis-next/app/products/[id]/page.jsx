import { notFound, permanentRedirect } from 'next/navigation';
import ProductDetailClient from '@/components/product/ProductDetailClient';
import ProductSeoContent from '@/components/product/ProductSeoContent';
import Breadcrumb from '@/components/seo/Breadcrumb';
import JsonLd from '@/components/seo/JsonLd';
import { buildProductMetadata } from '@/lib/seo/metadata';
import { absoluteUrl } from '@/lib/seo/config';
import { attachSpecs, buildBreadcrumbSchema, buildProductSchema, productImages } from '@/lib/seo/jsonld';
import { productBreadcrumb } from '@/lib/seo/breadcrumbs';
import { getProductReviews, getRelatedProducts, resolveProductRequest } from '@/lib/seo/products';

const BLOCKED_STATUSES = new Set(['discontinued']);

/**
 * Metadata de fiche produit.
 *
 * Titre priorise « Prix » + montant + « FCFA » dans les ~60 premiers caracteres :
 * c'est ce que tapent les researched senegalais (« prix senegal », « prix en fcfa »)
 * et c'est le principal levier de CTR, a 1,0 % sur ces pages dans la baseline.
 *
 * Le canonical pointe toujours sur le slug, meme si la page est atteinte par
 * ObjectId (ancienne URL Vite) ou par un ancien slug a suffixe numerique.
 */
export async function generateMetadata({ params }) {
  try {
    const { id } = await params;
    const { product, canonicalSlug } = await resolveProductRequest(id);

    if (!product || !canonicalSlug) return {};

    return buildProductMetadata(product, canonicalSlug);
  } catch {
    return {};
  }
}

export const revalidate = 3600;

export default async function ProductPage({ params }) {
  const { id } = await params;

  const { product, canonicalSlug, notFound: missing, shouldRedirect, apiUnavailable } =
    await resolveProductRequest(id);

  // 301 vers le slug canonique : couvre /products/<ObjectId> (URL de l'ancienne
  // app Vite) et /products/<slug>-<13 chiffres> (ancien format de slug, encore
  // indexe par Google, aujourd'hui en 404).
  if (shouldRedirect && canonicalSlug) {
    permanentRedirect(`/products/${canonicalSlug}`);
  }

  // 404 reel si l'API a repondu et qu'aucun produit ne correspond.
  // `notFound()` renvoie un vrai statut HTTP 404 (pas de soft-404).
  if (missing) {
    notFound();
  }

  if (!product) {
    // API injoignable (cold start Render, rate-limit) : on rend une page
    // degradee indexable=false plutot qu'un 404, et le client recharge.
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Produit momentanément indisponible
          </h1>
          <p className="text-gray-600 mb-6">
            {apiUnavailable
              ? 'Le catalogue se recharge. Réessayez dans un instant ou parcourez nos catégories.'
              : 'Une erreur est survenue lors du chargement du produit.'}
          </p>
          <a href="/products" className="text-blue-600 hover:underline">
            Voir tous les produits
          </a>
        </div>
      </div>
    );
  }

  if (BLOCKED_STATUSES.has(product.status)) {
    permanentRedirect('/products');
  }

  const category = product.category?.[0];
  const productUrl = absoluteUrl(`/products/${canonicalSlug}`);
  const images = productImages(product);

  // Avis reels uniquement : aucune note synthetique.
  const reviews = await getProductReviews(product._id);
  const rating = product.rating && Number(product.rating.count) > 0 ? product.rating : null;

  // Produits lies, rendus serveur pour le maillage interne (phase 7).
  const related = await getRelatedProducts(product, 6);

  // ---- Donnees structurees (Product / Offer) ----
  const productSchema = attachSpecs(
    buildProductSchema(product, {
      productUrl,
      categoryName: category?.name,
    }),
    product
  );

  // aggregateRating / review : uniquement si la base contient de vrais avis.
  if (productSchema && rating && Number(rating.average) > 0) {
    productSchema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: Number(rating.average),
      bestRating: Number(rating.max) || 5,
      ...(rating.min !== undefined ? { worstRating: Number(rating.min) } : {}),
      reviewCount: Number(rating.count),
    };
  }
  if (productSchema && reviews.length > 0) {
    productSchema.review = reviews.slice(0, 5).map((review) => ({
      '@type': 'Review',
      ...(review.title ? { name: stripReviewHtml(review.title) } : {}),
      reviewRating: {
        '@type': 'Rating',
        ratingValue: Number(review.rating),
        bestRating: 5,
        worstRating: 1,
      },
      ...(review.user?.name || review.isVerified
        ? {
            author: {
              '@type': 'Person',
              name: review.user?.name || 'Acheteur vérifié',
            },
          }
        : {}),
      ...(review.createdAt
        ? { datePublished: new Date(review.createdAt).toISOString().slice(0, 10) }
        : {}),
      ...(review.comment ? { reviewBody: stripReviewHtml(review.comment) } : {}),
    }));
  }

  const breadcrumbItems = productBreadcrumb(product, category);
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbItems);

  return (
    <>
      <JsonLd id="product-schema" data={productSchema} />
      <JsonLd id="breadcrumb-schema" data={breadcrumbSchema} />

      <div className="container mx-auto px-4 pt-4">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* H1 + prix + disponibilite + tableau des caracterisations : rendus
          serveur dans ProductSeoContent, donc presents dans le HTML brut.
          ProductDetailClient fournit la galerie, le prix cliquable et le panier. */}
      <ProductDetailClient product={product} />
      <ProductSeoContent product={product} related={related} category={category} />
    </>
  );
}

function stripReviewHtml(value) {
  return String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
