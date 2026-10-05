/**
 * lib/seo/metadata.js
 *
 * Constructeurs de title / description / metadata Next.js.
 *
 * Objectif : gain de positions. Les fiches smartphones sont bloquees en
 * position 5-8 (~67 % des impressions). Leur CTR (~1,0 % a position ~6,5) est
 * dans la norme de sa tranche : le levier est donc le classement, pas le CTR.
 *
 * Concretement, le titre actuel est generique et identique sur plusieurs
 * fiches, donc peu distinctif. Les recherchesTyped par les visiteurs senegalais
 * portent sur le prix ("prix senegal", "prix en fcfa") : on fait apparaitre
 * "Prix" + le montant + "FCFA" dans les 60 premiers caracteres du titre, et le
 * prix dans les 120 premiers de la description. Un titre specifique ameliore
 * aussi la pertinence perçue et le taux de clic a position egale.
 */

import {
  SITE_URL,
  SITE_NAME,
  SITE_LOCALE,
  DEFAULT_OG_IMAGE,
  DEFAULT_OG_IMAGE_WIDTH,
  DEFAULT_OG_IMAGE_HEIGHT,
  NOINDEX_ROBOTS,
  PAYMENT_CLAIM,
  SHIPPING_CLAIM,
  absoluteUrl,
} from './config';
import { formatFcfa, stripHtml, truncate, truncateAtWord } from './format';

// Google tronque le title vers 60 caracteres sur mobile, ~70 au total.
export const MAX_TITLE = 65;
// Google tronque la description entre 155 et 320 caracteres ; on vise 120-160.
export const MAX_DESCRIPTION = 155;

const BRAND_SUFFIX = `| ${SITE_NAME}`;

/** Choisit le premier candidat qui tient dans la limite. */
function firstWithinLimit(candidates, maxLength, fallback) {
  for (const candidate of candidates) {
    if (candidate && candidate.length <= maxLength) return candidate;
  }
  return fallback;
}

/**
 * Titre de fiche produit.
 * Priorite absolue : "Prix" + montant + "FCFA" dans les ~60 premiers caracteres.
 *   buildProductTitle('Samsung Galaxy A14 128 Go / 4 Go', 110500)
 *     -> 'Samsung Galaxy A14 128 Go / 4 Go - Prix 110 500 FCFA | Tekalis'
 */
export function buildProductTitle(name, price) {
  const cleanName = stripHtml(name) || 'Produit';
  const formattedPrice = price ? formatFcfa(price) : null;

  const candidates = formattedPrice
    ? [
        `${cleanName} - Prix ${formattedPrice} FCFA au Sénégal ${BRAND_SUFFIX}`,
        `${cleanName} - Prix ${formattedPrice} FCFA ${BRAND_SUFFIX}`,
        `${cleanName} - ${formattedPrice} FCFA ${BRAND_SUFFIX}`,
        `${cleanName} ${BRAND_SUFFIX}`,
      ]
    : [
        `${cleanName} - Prix au Sénégal ${BRAND_SUFFIX}`,
        `${cleanName} ${BRAND_SUFFIX}`,
      ];

  const fallback = `${truncateAtWord(cleanName, MAX_TITLE - BRAND_SUFFIX.length)} ${BRAND_SUFFIX}`;
  return firstWithinLimit(candidates, MAX_TITLE, fallback);
}

/**
 * Description de fiche produit, 120-155 caracteres.
 * Construite uniquement a partir de donnees reelles : nom, prix, marque, etat,
 * disponibilite. Les claims commerciaux viennent de lib/seo/config.js, qui ne
 * contient que des formules deja presentes sur le site.
 */
export function buildProductDescription(product) {
  if (!product) return '';
  if (product.metaDescription) return truncate(stripHtml(product.metaDescription), MAX_DESCRIPTION);

  const name = stripHtml(product.name) || 'ce produit';
  const formattedPrice = product.price ? formatFcfa(product.price) : null;
  const parts = [];

  parts.push(
    formattedPrice
      ? `${name} au prix de ${formattedPrice} FCFA à Dakar.`
      : `${name}, disponible à Dakar.`
  );

  if (product.condition && product.condition !== 'new') {
    parts.push(product.condition === 'used' ? 'Article d\'occasion.' : 'Article reconditionné.');
  }

  if (product.status === 'outofstock') {
    parts.push('Rupture de stock, réassort en cours.');
  } else if (product.stock > 0) {
    parts.push('En stock, livraison à Dakar sous 24 à 48 h.');
  }

  if (SHIPPING_CLAIM) parts.push(SHIPPING_CLAIM);
  parts.push('Commandez sur Tekalis.');

  return truncate(parts.join(' '), MAX_DESCRIPTION);
}

/**
 * Title d'une page de listing / categorie.
 * `suffix` permet de differencier deux pages proches (pagination).
 */
export function buildListingTitle(seo, suffix) {
  const base = seo?.title || `${SITE_NAME}`;
  return suffix ? `${base} - ${suffix}` : base;
}

/**
 * Construit un objet metadata Next.js complet a partir de pieces simples.
 * Applique partout : title, description, canonical, openGraph, twitter.
 */
export function buildMetadata({
  title,
  description,
  path,
  image,
  imageAlt,
  type = 'website',
  publishedTime,
  modifiedTime,
  authors,
  noindex = false,
} = {}) {
  const canonical = path ? absoluteUrl(path) : undefined;
  const finalTitle = title || SITE_NAME;
  const finalDescription = truncate(description || '', MAX_DESCRIPTION);
  const ogImage = image || DEFAULT_OG_IMAGE;

  const ogImages = [
    {
      url: absoluteUrl(ogImage),
      width: DEFAULT_OG_IMAGE_WIDTH,
      height: DEFAULT_OG_IMAGE_HEIGHT,
      alt: imageAlt || finalTitle,
    },
  ];

  const metadata = {
    /*
     * Le layout racine applique le template `%s | ${SITE_NAME}`. Les builders
     * qui construisent deja un titre complet (fiche produit : nom + prix +
     * marque) verraient donc la marque apparaitre deux fois :
     *   "Onduleur X - 377 000 FCFA | Tekalis | Tekalis Senegal"
     * On passe en `absolute` des que le titre contient deja la marque.
     */
    title: finalTitle.includes(SITE_NAME)
      ? { absolute: finalTitle }
      : finalTitle,
    description: finalDescription,
    ...(canonical ? { alternates: { canonical } } : {}),
    openGraph: {
      type,
      title: finalTitle,
      description: finalDescription,
      ...(canonical ? { url: canonical } : {}),
      siteName: SITE_NAME,
      locale: SITE_LOCALE,
      images: ogImages,
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
      ...(authors ? { authors } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: finalTitle,
      description: finalDescription,
      images: ogImages.map((img) => img.url),
    },
    ...(noindex ? { robots: NOINDEX_ROBOTS } : {}),
  };

  return metadata;
}

/**
 * Metadata d'une page produit, en reusing buildProductTitle/Description.
 * Le canonical pointe toujours sur le slug, meme si la page est atteinte
 * par ObjectId ou par un ancien slug a suffixe numerique.
 */
export function buildProductMetadata(product, canonicalSlug) {
  const slug = canonicalSlug || product?.slug || product?._id;
  const primaryImage = product?.images?.[0]?.url || product?.image;

  return buildMetadata({
    title: buildProductTitle(product?.name, product?.price),
    description: buildProductDescription(product),
    path: `/products/${slug}`,
    image: primaryImage || DEFAULT_OG_IMAGE,
    imageAlt: product?.name,
    noindex: product?.status === 'discontinued',
  });
}

/**
 * Metadata de page privee (login, register, panier, checkout, compte).
 * `noindex, nofollow` + canonical auto-reference : la page reste accessible
 * aux robots pour lire le noindex, mais n'est jamais proposee dans les resultats.
 */
export function buildPrivateMetadata(path, title, description) {
  return buildMetadata({ title, description, path, noindex: true });
}

export { PAYMENT_CLAIM, SITE_URL };
