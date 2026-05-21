/**
 * PageMeta — Composant SEO unifié pour toutes les pages
 * 
 * RÈGLE FONDAMENTALE : une seule balise <h1> par page.
 * Ce composant gère :
 *   - Balises <title> et <meta description> via Helmet
 *   - H1 optionnel visuellement (si la page n'a pas encore de H1)
 *   - Breadcrumb Schema.org
 *   - Open Graph / Twitter Card
 *   - Canonical
 * 
 * USAGE :
 *   // Page Produits — le H1 est "Tous les Produits" rendu dans le JSX
 *   <PageMeta title="Produits" description="..." />
 *   <h1>Tous les Produits</h1>  ← H1 DANS LE COMPOSANT PARENT
 * 
 *   // Page Home — DynamicHero génère le H1
 *   <PageMeta title="Tekalis — Boutique Électronique Dakar" description="..." />
 *   <DynamicHero isHomePage={true} />  ← H1 DANS LE HERO
 * 
 *   // Page avec H1 textuel visible
 *   <PageMeta title="Contact" description="..." h1="Contactez-nous" />
 */

import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'Tekalis';
const SITE_URL = 'https://tekalis.com';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;
const DEFAULT_DESCRIPTION = 'Tekalis — Boutique électronique au Sénégal. Smartphones, laptops, TV, électroménager. Livraison rapide à Dakar. Garantie constructeur.';

const PageMeta = ({
  title,                  // Titre affiché dans l'onglet (sans "| Tekalis", ajouté auto)
  description,            // Meta description (155 chars max)
  image,                  // OG image URL
  canonical,              // URL canonique (auto si omis)
  noindex = false,        // true → noindex,nofollow
  keywords = [],          // Mots-clés additionnels
  type = 'website',       // 'website' | 'product' | 'article'
  h1,                     // Si fourni : rend un <h1> VISUELLEMENT CACHÉ (sr-only)
                          // Utiliser uniquement si la page n'a aucun H1 visible
  h1Visible = false,      // Si true : rend le H1 visuellement (avec styles Tailwind)
  h1Class = 'text-3xl font-bold text-gray-900 dark:text-white mb-4',
  // Open Graph product
  price,
  currency = 'XOF',
  availability = 'InStock',
  // Breadcrumbs pour Schema.org
  breadcrumbs = [],       // [{ name: 'Produits', url: '/products' }, ...]
  // Article
  publishedAt,
  modifiedAt,
  author,
  // Schema.org custom
  schema,
}) => {
  const pageTitle = title
    ? `${title} | ${SITE_NAME}`
    : `${SITE_NAME} — Boutique Tech Dakar | Livraison Rapide Sénégal`;

  const metaDesc = description || DEFAULT_DESCRIPTION;
  const ogImage = image || DEFAULT_IMAGE;

  // Canonical : utiliser l'URL fournie ou construire depuis window.location
  const canonicalUrl = canonical
    || (typeof window !== 'undefined'
      ? `${SITE_URL}${window.location.pathname}`
      : SITE_URL);

  /* ── Génération Schema.org ───────────────────────────────────────────── */
  const schemas = [];

  // WebSite — uniquement sur la home
  if (type === 'website' && canonicalUrl === `${SITE_URL}/`) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${SITE_URL}/products?search={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    });
  }

  // BreadcrumbList
  if (breadcrumbs.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Accueil', item: SITE_URL },
        ...breadcrumbs.map((b, i) => ({
          '@type': 'ListItem',
          position: i + 2,
          name: b.name,
          item: `${SITE_URL}${b.url}`,
        })),
      ],
    });
  }

  // Product Schema
  if (type === 'product' && price) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: title,
      description: metaDesc,
      image: ogImage,
      offers: {
        '@type': 'Offer',
        price,
        priceCurrency: currency,
        availability: `https://schema.org/${availability}`,
        url: canonicalUrl,
        seller: { '@type': 'Organization', name: SITE_NAME },
      },
    });
  }

  // Article Schema
  if (type === 'article') {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: title,
      description: metaDesc,
      image: ogImage,
      datePublished: publishedAt,
      dateModified: modifiedAt || publishedAt,
      author: { '@type': 'Person', name: author || 'Équipe Tekalis' },
      publisher: {
        '@type': 'Organization',
        name: SITE_NAME,
        logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
      },
    });
  }

  // Schema custom
  if (schema) schemas.push(schema);

  return (
    <>
      <Helmet>
        {/* ── Balises essentielles ── */}
        <title>{pageTitle}</title>
        <meta name="description" content={metaDesc} />
        {keywords.length > 0 && (
          <meta name="keywords" content={keywords.join(', ')} />
        )}
        <meta name="robots" content={noindex ? 'noindex,nofollow' : 'index,follow'} />
        <link rel="canonical" href={canonicalUrl} />

        {/* ── Open Graph ── */}
        <meta property="og:type" content={type === 'product' ? 'product' : type === 'article' ? 'article' : 'website'} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={metaDesc} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="fr_SN" />
        <meta property="og:site_name" content={SITE_NAME} />

        {type === 'product' && price && (
          <>
            <meta property="product:price:amount" content={String(price)} />
            <meta property="product:price:currency" content={currency} />
          </>
        )}

        {type === 'article' && publishedAt && (
          <>
            <meta property="article:published_time" content={publishedAt} />
            {modifiedAt && <meta property="article:modified_time" content={modifiedAt} />}
            <meta property="article:author" content={author || 'Équipe Tekalis'} />
          </>
        )}

        {/* ── Twitter Card ── */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={metaDesc} />
        <meta name="twitter:image" content={ogImage} />
        <meta name="twitter:site" content="@tekalis" />

        {/* ── Schema.org ── */}
        {schemas.map((s, i) => (
          <script key={i} type="application/ld+json">
            {JSON.stringify(s)}
          </script>
        ))}
      </Helmet>

      {/* H1 optionnel ─ sr-only (pour pages sans H1 visuel) ou visible */}
      {h1 && (
        h1Visible
          ? <h1 className={h1Class}>{h1}</h1>
          : <h1 className="sr-only">{h1}</h1>
      )}
    </>
  );
};

export default PageMeta;
