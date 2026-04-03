/**
 * tekalis-seo/hooks/useSEO.js
 * 
 * Remplace tekalis-frontend/packages/shared/hooks/useSEO.js
 * 
 * Version complète avec :
 * - Titres dynamiques par page
 * - Schema.org Product, Article, BreadcrumbList
 * - Open Graph / Twitter Card
 * - Canonical URLs
 * - Support prerendering
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://tekalis.com';
const SITE_NAME = 'Tekalis';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;
const DEFAULT_DESCRIPTION = 'Tekalis — Boutique électronique en ligne au Sénégal. Smartphones, laptops, TV, électroménager. Livraison rapide à Dakar.';

/**
 * Hook principal SEO
 * 
 * Usage :
 *   useSEO({ title: 'iPhone 15 Pro', description: '...', type: 'product', price: 650000 })
 */
export const useSEO = ({
  title,
  description,
  image,
  keywords = [],
  type = 'website',
  price,
  currency = 'XOF',
  availability = 'InStock',
  canonical,
  noindex = false,
  schema,        // Schema.org JSON-LD custom
  breadcrumbs,  // [{ name: 'Accueil', url: '/' }, ...]
} = {}) => {
  const location = useLocation();
  const currentUrl = canonical || `${SITE_URL}${location.pathname}`;
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Boutique Tech Dakar | Livraison Rapide Sénégal`;
  const metaDescription = description || DEFAULT_DESCRIPTION;
  const ogImage = image || DEFAULT_IMAGE;

  useEffect(() => {
    // Scroll to top on route change (aide le SEO comportemental)
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return {
    fullTitle,
    metaDescription,
    ogImage,
    currentUrl,
    noindex,
    type,
    price,
    currency,
    availability,
    keywords,
    schema,
    breadcrumbs,
  };
};

/**
 * Composant SEOHead — à placer dans chaque page
 * 
 * Usage :
 *   <SEOHead
 *     title="iPhone 15 Pro à Dakar"
 *     description="Achetez l'iPhone 15 Pro..."
 *     type="product"
 *     price={650000}
 *   />
 */
export const SEOHead = ({
  title,
  description,
  image,
  keywords = [],
  type = 'website',
  price,
  currency = 'XOF',
  availability = 'InStock',
  canonical,
  noindex = false,
  schema,
  breadcrumbs,
  productData,   // { name, brand, sku, images, rating }
  articleData,   // { publishedAt, modifiedAt, author }
}) => {
  const location = useLocation();
  const currentUrl = canonical || `${SITE_URL}${location.pathname}`;
  const fullTitle = title
    ? `${title} | ${SITE_NAME}`
    : `${SITE_NAME} — Boutique Tech Dakar | Livraison Rapide Sénégal`;
  const metaDescription = description || DEFAULT_DESCRIPTION;
  const ogImage = image || DEFAULT_IMAGE;
  const keywordsStr = keywords.length > 0 ? keywords.join(', ') : undefined;

  // ── Génération Schema.org ───────────────────────────────────────────────────
  const schemas = [];

  // Schema.org Product
  if (type === 'product' && productData) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: productData.name || title,
      description: metaDescription,
      image: productData.images || [ogImage],
      brand: {
        '@type': 'Brand',
        name: productData.brand || 'Tekalis',
      },
      sku: productData.sku || undefined,
      offers: {
        '@type': 'Offer',
        price: price,
        priceCurrency: currency,
        availability: `https://schema.org/${availability}`,
        url: currentUrl,
        seller: {
          '@type': 'Organization',
          name: SITE_NAME,
        },
        priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
      },
      ...(productData.rating && productData.rating.count > 0
        ? {
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: productData.rating.average,
              reviewCount: productData.rating.count,
              bestRating: 5,
              worstRating: 1,
            },
          }
        : {}),
    });
  }

  // Schema.org Article (Blog)
  if (type === 'article' && articleData) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: title,
      description: metaDescription,
      image: [ogImage],
      datePublished: articleData.publishedAt,
      dateModified: articleData.modifiedAt || articleData.publishedAt,
      author: {
        '@type': 'Person',
        name: articleData.author || 'Équipe Tekalis',
      },
      publisher: {
        '@type': 'Organization',
        name: SITE_NAME,
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_URL}/logo.png`,
        },
      },
      url: currentUrl,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': currentUrl,
      },
    });
  }

  // Schema.org BreadcrumbList
  if (breadcrumbs && breadcrumbs.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Accueil', item: SITE_URL },
        ...breadcrumbs.map((crumb, index) => ({
          '@type': 'ListItem',
          position: index + 2,
          name: crumb.name,
          item: `${SITE_URL}${crumb.url}`,
        })),
      ],
    });
  }

  // Schema custom passé en prop
  if (schema) schemas.push(schema);

  return (
    <Helmet>
      {/* ── Balises de base ─────────────────────────────────── */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      {keywordsStr && <meta name="keywords" content={keywordsStr} />}
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow'} />
      <meta name="author" content={SITE_NAME} />
      <link rel="canonical" href={currentUrl} />

      {/* ── Open Graph ──────────────────────────────────────── */}
      <meta property="og:type" content={type === 'product' ? 'product' : type === 'article' ? 'article' : 'website'} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="fr_SN" />
      <meta property="og:site_name" content={SITE_NAME} />

      {/* Open Graph Product */}
      {type === 'product' && price && (
        <>
          <meta property="product:price:amount" content={price} />
          <meta property="product:price:currency" content={currency} />
        </>
      )}

      {/* Open Graph Article */}
      {type === 'article' && articleData && (
        <>
          <meta property="article:published_time" content={articleData.publishedAt} />
          {articleData.modifiedAt && (
            <meta property="article:modified_time" content={articleData.modifiedAt} />
          )}
          <meta property="article:author" content={articleData.author || 'Équipe Tekalis'} />
        </>
      )}

      {/* ── Twitter Card ─────────────────────────────────────── */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:site" content="@tekalis" />

      {/* ── Schema.org JSON-LD ───────────────────────────────── */}
      {schemas.map((schemaObj, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schemaObj)}
        </script>
      ))}
    </Helmet>
  );
};

export default useSEO;
