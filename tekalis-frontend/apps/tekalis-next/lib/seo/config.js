/**
 * lib/seo/config.js
 *
 * Source unique des constantes SEO du site.
 *
 * Regle absolute : aucune valeur ici qui ne soit pas deja presente dans le code
 * du site. Les textes commerciaux sont repris a l'identique des pages
 * /livraison, /retours, /garanties et de lib/utils/constants.js.
 * Si une information n'est pas verifiable, on met `null` et les helpers
 * omettent la phrase (jamais de texte invente).
 */

import { SOCIAL_LINKS, SHIPPING } from '@/lib/utils/constants';

// Hote canonique. Surchargeable par NEXT_PUBLIC_SITE_URL pour previsualisation.
// Valeur de production = "https://tekalis.com" (sans www), coherente avec
// layout.jsx / robots.js / sitemap.js / prixGuides.js / Footer.jsx / backend.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://tekalis.com'
).replace(/\/+$/, '');

export const SITE_NAME = 'Tekalis';

export const SITE_LOCALE = 'fr_SN';
export const SITE_LANG = 'fr';
export const SITE_COUNTRY = 'SN';

export const CURRENCY = 'XOF';
export const CURRENCY_LABEL = 'FCFA';

// Image partagee pour Open Graph / Twitter, presente dans public/.
export const DEFAULT_OG_IMAGE = '/og-image.png';
export const DEFAULT_OG_IMAGE_WIDTH = 1200;
export const DEFAULT_OG_IMAGE_HEIGHT = 630;

// Logo utilise dans les schemas Organization / WebSite.
export const LOGO_URL = '/og-image.png';

// Identifiants de contact, repris de app/layout.jsx (schema LocalBusiness).
export const CONTACT = {
  telephone: '+221786346946',
  email: 'contact@tekalis.com',
  streetAddress: 'Fann, Rue 14',
  addressLocality: 'Dakar',
  addressRegion: 'Dakar',
  postalCode: 'BP 12345',
  addressCountry: 'SN',
  latitude: 14.6928,
  longitude: -17.4467,
};

// `sameAs` : uniquement les profils reellement declares dans le code.
// (Le lien Facebook est un lien de partage, pas un profil : on l'exclut.)
export const SAME_AS = [
  SOCIAL_LINKS.instagram,
  SOCIAL_LINKS.twitter,
  SOCIAL_LINKS.linkedin,
  SOCIAL_LINKS.youtube,
].filter(Boolean);

// ---------------------------------------------------------------------------
// Textes commercials
//
// Chaque constante est une formule DEJA PUBLIEE sur le site. Elles servent a
// la fois aux meta descriptions et au contenu visible des fiches.
// `null` = information non verifiable dans le code -> la phrase est omise.
// ---------------------------------------------------------------------------

// app/livraison/page.jsx : « Livraison offerte des 50 000 FCFA »,
// « Délais 24-48h à Dakar », tarifs 1 500 / 2 000 / 2 500 FCFA selon la zone.
export const SHIPPING_CLAIM = `Livraison à Dakar sous 24 à 48 h, offerte dès ${SHIPPING.FREE_SHIPPING_THRESHOLD.toLocaleString('fr-FR')} FCFA`;

// app/retours/page.jsx : « Produit retourné dans un délai de 7 jours après réception »
export const RETURNS_CLAIM = 'Retour possible sous 7 jours après réception';

// app/garanties/page.jsx : « Garantie constructeur sur tous les produits »,
// models/Product.js : warranty.duration = 12 mois.
export const WARRANTY_CLAIM = 'Garantie constructeur incluse';

// lib/utils/constants.js PAYMENT_METHOD_LABELS. Pas de carte bancaire ici :
// app/cgv/page.jsx n'en liste que 4 et Settings.stripe vaut false par defaut.
export const PAYMENT_CLAIM = 'Paiement à la livraison, Wave, Orange Money ou Free Money';

export const LOCATION_CLAIM = `${CONTACT.streetAddress}, ${CONTACT.addressLocality}, Sénégal`;

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export const CATEGORY_PATH_PREFIX = '/category';

/** Liste des slugs de categories servis par l'API (verifie le 2026-10-05). */
export const KNOWN_CATEGORY_SLUGS = [
  'smartphones',
  'ordinateurs',
  'laptops',
  'tablettes',
  'tv',
  'audio',
  'gaming',
  'electromenager',
  'climatisation',
  'ventilation',
  'energie-solaire',
  'accessoires',
  'informatique',
  'reseau',
  'divertissement',
  'mobilite',
];

/** Table des pages indexables a ne jamais laisser crawler comme combinatorial. */
export const NOINDEX_ROBOTS = { index: false, follow: false };

// ---------------------------------------------------------------------------
// Utilitaires d'URL
// ---------------------------------------------------------------------------

/** URL absolue a partir d'un chemin interne. */
export function absoluteUrl(path = '/') {
  if (!path) return `${SITE_URL}/`;
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

/** URL canonique d'un produit, toujours sur son slug. */
export function productPath(slugOrId) {
  return `/products/${slugOrId}`;
}

export function categoryPath(slug) {
  return `${CATEGORY_PATH_PREFIX}/${slug}`;
}

export function articlePath(slug) {
  return `/blog/${slug}`;
}
