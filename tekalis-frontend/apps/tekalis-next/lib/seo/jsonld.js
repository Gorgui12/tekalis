/**
 * lib/seo/jsonld.js
 *
 * Constructeurs de donnees structurees schema.org.
 *
 * Regles appliquees :
 *  - aucune donnee inventee (prix, stock, images, marque viennent de l'API) ;
 *  - aucun `aggregateRating` / `review` sans avis reels en base ;
 *  - `price` est un NOMBRE (JSON-LD n'accepte pas "110 500 FCFA") ;
 *  - si une information est absente, la propriete est omise plutot que devinee.
 */

import {
  SITE_URL,
  SITE_NAME,
  SITE_LOCALE,
  CURRENCY,
  CONTACT,
  DEFAULT_OG_IMAGE,
  LOGO_URL,
  SAME_AS,
  absoluteUrl,
} from './config';
import { stripHtml } from './format';

const SCHEMA_CONTEXT = 'https://schema.org';

/**
 * Serialisation sure : echappe `<` pour qu'un nom de produit contenant `</script>`
 * ne puisse pas fermer la balise. `JSON.stringify` seul ne protege pas.
 */
export function serializeJsonLd(data) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

function toAbsoluteImage(url) {
  if (!url) return null;
  return /^https?:\/\//i.test(url) ? url : absoluteUrl(url);
}

/** Liste d'URLs d'images absolues, dedoublonnees. */
export function productImages(product) {
  const raw = [];
  if (Array.isArray(product?.images)) {
    for (const image of product.images) {
      const url = typeof image === 'string' ? image : image?.url;
      if (url) raw.push(url);
    }
  }
  if (product?.image) raw.push(product.image);
  const images = raw.map(toAbsoluteImage).filter(Boolean);
  return Array.from(new Set(images));
}

/**
 * Disponibilite reelle, derivee du couple statut + stock.
 * Ne repose sur aucun texte marketing : c'est l'etat de la base.
 */
export function resolveAvailability(product) {
  if (!product) return 'https://schema.org/OutOfStock';
  if (product.status === 'preorder') return 'https://schema.org/PreOrder';
  if (product.status === 'discontinued' || product.status === 'outofstock') {
    return 'https://schema.org/OutOfStock';
  }
  const stock = Number(product.stock);
  if (Number.isFinite(stock) && stock <= 0) return 'https://schema.org/OutOfStock';
  return 'https://schema.org/InStock';
}

/**
 * Etat de l'article, depuis le champ `condition` du modele.
 *
 * ATTENTION — arbitrage a valider (voir SEO_DECISIONS.md) : en base les 180
 * produits valent `condition: "new"`, y compris les 14 produits dont le nom se
 * termine par "-venant" (import, souvent d'occasion). Declarer `NewCondition`
 * sur un produit "venant" serait une donnee structuree trompeuse, et Google
 * sanctionne les balisages marchands inexacts. On omet donc `itemCondition`
 * pour ces produits plutot que d'affirmer un etat non verifie.
 */
export function resolveItemCondition(product) {
  const condition = product?.condition;
  if (condition === 'refurbished') return 'https://schema.org/RefurbishedCondition';
  if (condition === 'used') return 'https://schema.org/UsedCondition';
  if (condition === 'new') {
    const signal = `${product?.slug || ''} ${product?.name || ''}`.toLowerCase();
    if (signal.includes('venant')) return undefined;
    return 'https://schema.org/NewCondition';
  }
  return undefined;
}

/** Label lisible de la disponibilite, pour le contenu visible. */
export function availabilityLabel(product) {
  const availability = resolveAvailability(product);
  if (availability.endsWith('InStock')) return 'En stock';
  if (availability.endsWith('PreOrder')) return 'En précommande';
  return 'Rupture de stock';
}

/**
 * Product + Offer.
 * `categorySlug` alimente le fil d'Ariane ; `breadcrumb` evite de le re-calculer.
 */
export function buildProductSchema(product, options = {}) {
  if (!product) return null;
  const { productUrl, categoryName } = options;

  const url = productUrl || absoluteUrl(`/products/${product.slug || product._id}`);
  const images = productImages(product);
  const description = stripHtml(product.metaDescription || product.description || '');
  const availability = resolveAvailability(product);
  const itemCondition = resolveItemCondition(product);
  const price = Number(product.price);
  const numericPrice = Number.isFinite(price) && price > 0 ? price : undefined;

  const seller = {
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
  };

  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'Product',
    name: stripHtml(product.name),
    ...(description ? { description } : {}),
    ...(images.length > 0 ? { image: images } : {}),
    ...(product._id ? { sku: product._id } : {}),
    ...(product.mpn ? { mpn: product.mpn } : {}),
    ...(product.gtin ? { gtin: product.gtin } : {}),
    ...(product.brand ? { brand: { '@type': 'Brand', name: product.brand } } : {}),
    ...(categoryName ? { category: categoryName } : {}),
    url,
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: CURRENCY,
      ...(numericPrice !== undefined ? { price: numericPrice } : {}),
      availability,
      ...(itemCondition ? { itemCondition } : {}),
      seller,
    },
  };
}

/**
 * Fil d'Ariane. `items` = [{ name, path }], le dernier etant la page courante.
 * Le dernier item est marque `currentPage` : Google n'attend pas de cible sur lui.
 */
export function buildBreadcrumbSchema(items) {
  if (!Array.isArray(items) || items.length === 0) return null;
  const list = items.filter(Boolean);
  if (list.length === 0) return null;

  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'BreadcrumbList',
    itemListElement: list.map((item, index) => {
      const position = index + 1;
      const entry = {
        '@type': 'ListItem',
        position,
        name: stripHtml(item.name),
      };
      if (item.path && position < list.length) {
        entry.item = absoluteUrl(item.path);
      }
      return entry;
    }),
  };
}

/** Fil d'Ariane standard d'une fiche produit. */
export function productBreadcrumbItems(product, category) {
  const items = [{ name: 'Accueil', path: '/' }, { name: 'Produits', path: '/products' }];
  if (category?.slug) {
    items.push({ name: category.name, path: `/category/${category.slug}` });
  }
  items.push({ name: stripHtml(product?.name), path: `/products/${product?.slug || product?._id}` });
  return items;
}

/** Organization : ce que Google doit associer au nom "Tekalis". */
export function buildOrganizationSchema() {
  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    alternateName: 'Tekalis Sénégal',
    url: `${SITE_URL}/`,
    logo: absoluteUrl(LOGO_URL),
    image: absoluteUrl(DEFAULT_OG_IMAGE),
    description:
      "Boutique d'électronique et de high-tech à Dakar : smartphones, ordinateurs portables, TV, électroménager et énergie solaire.",
    telephone: CONTACT.telephone,
    email: CONTACT.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: CONTACT.streetAddress,
      addressLocality: CONTACT.addressLocality,
      addressRegion: CONTACT.addressRegion,
      postalCode: CONTACT.postalCode,
      addressCountry: CONTACT.addressCountry,
    },
    ...(SAME_AS.length > 0 ? { sameAs: SAME_AS } : {}),
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'service client',
        telephone: CONTACT.telephone,
        email: CONTACT.email,
        areaServed: 'SN',
        availableLanguage: ['fr'],
      },
    ],
  };
}

/**
 * WebSite avec SearchAction.
 * Un SearchAction n'est declare que parce qu'une recherche par URL existe
 * reellement : `GET /api/v1/products?search=` + page /products.
 */
export function buildWebSiteSchema() {
  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: SITE_NAME,
    alternateName: 'Tekalis Sénégal',
    url: `${SITE_URL}/`,
    inLanguage: SITE_LOCALE,
    publisher: { '@id': `${SITE_URL}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/products?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * ItemList pour les pages de listing / categories.
 * `products` attend des objets produit bruts de l'API.
 */
export function buildItemListSchema(name, products, options = {}) {
  const { path, description } = options;
  const list = (Array.isArray(products) ? products : [])
    .filter((p) => p && (p.slug || p._id))
    .slice(0, 100);

  if (list.length === 0) return null;

  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'ItemList',
    name,
    ...(description ? { description } : {}),
    ...(path ? { url: absoluteUrl(path) } : {}),
    numberOfItems: list.length,
    itemListElement: list.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: stripHtml(product.name),
      url: absoluteUrl(`/products/${product.slug || product._id}`),
    })),
  };
}

/** Article de blog. Titre, date, auteur, image uniquement si reellement presents. */
export function buildArticleSchema(article) {
  if (!article) return null;
  const url = absoluteUrl(`/blog/${article.slug}`);
  const image = toAbsoluteImage(
    article.coverImage || article.image || article.featuredImage
  );
  const published = article.publishedAt || article.createdAt;
  const modified = article.updatedAt || published;
  const authorName = article.author?.name || article.authorName;

  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'Article',
    headline: stripHtml(article.title),
    ...(article.excerpt ? { description: stripHtml(article.excerpt) } : {}),
    ...(image ? { image } : {}),
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    datePublished: published ? new Date(published).toISOString() : undefined,
    dateModified: modified ? new Date(modified).toISOString() : undefined,
    inLanguage: SITE_LOCALE,
    ...(authorName
      ? {
          author: {
            '@type': 'Person',
            name: authorName,
            ...(article.author?.avatar ? { image: toAbsoluteImage(article.author.avatar) } : {}),
          },
        }
      : {}),
    publisher: { '@id': `${SITE_URL}/#organization` },
  };
}

/**
 * Ajoute `additionalProperty` a partir du dict `specs` reel du produit.
 * Toutes les paires sont des donnees produit, aucune n'est inventee.
 */
export function attachSpecs(schema, product, maxEntries = 25) {
  const specs = product?.specs;
  if (!specs || typeof specs !== 'object') return schema;

  const additionalProperty = Object.entries(specs)
    .filter(([, value]) => value !== null && value !== undefined && value !== '')
    .map(([name, value]) => ({
      '@type': 'PropertyValue',
      name,
      value: Array.isArray(value) ? value.filter(Boolean).join(', ') : String(value),
    }))
    .slice(0, maxEntries);

  if (additionalProperty.length === 0) return schema;
  schema.additionalProperty = additionalProperty;
  return schema;
}
