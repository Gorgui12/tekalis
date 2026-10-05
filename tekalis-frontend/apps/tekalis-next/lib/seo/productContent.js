/**
 * lib/seo/productContent.js
 *
 * Generateur d'introduction de fiche produit.
 *
 * Objectif : que deux fiches de la meme famille ne produisent pas deux pages
 * quasi identiques. On combine le NOM du produit avec ses specifications reelles
 * (serie, stockage, RAM, ecran, marque, etat) pour obtenir des phrases qui
 * varient d'un produit a l'autre.
 *
 * Aucune donnee inventee : seuls les champs presents sur le produit sont utilises.
 * Si un champ manque, la phrase correspondante est omise.
 */

import { formatFcfa, stripHtml } from './format';
import { PAYMENT_CLAIM, SHIPPING_CLAIM } from './config';

const SERIES_PATTERNS = [
  { re: /iphone\s*(\d+)/i, label: 'iPhone' },
  { re: /galaxy\s*([a-z]\d+\s*(?:pro|fe|plus|ultra)?)/i, label: 'Samsung Galaxy' },
  { re: /macbook|ipad|imac/i, label: 'Apple' },
  { re: /surface|thinkpad|ideapad|elitebook|probook|envy|victus|pavilion|omen/i, label: 'PC portable' },
  { re: /onduleur/i, label: 'Onduleur' },
  { re: /panneau\s*solaire/i, label: 'Panneau solaire' },
  { re: /batterie/i, label: 'Batterie' },
  { re: /ventilateur|refra[iî]chisseur|climatiseur/i, label: 'Climatisation' },
  { re: /micro-ondes/i, label: 'Micro-ondes' },
  { re: /r[eé]frig[eé]rateur|cong[eé]lateur/i, label: 'Appareil de froid' },
  { re: /machine\s*[aà]\s*laver/i, label: 'Machine à laver' },
  { re: /t[eé]l[eé]viseur|smart\s*tv|tv\s/i, label: 'Téléviseur' },
  { re: /casque|[eé]couteurs/i, label: 'Audio' },
];

/** Extrait le nom de serie du produit ("Samsung Galaxy A14 ..." -> "Galaxy A14"). */
export function extractSeries(name) {
  const clean = stripHtml(name || '');
  if (!clean) return null;

  const galaxy = clean.match(/Galaxy\s+([A-Za-z]\d+[A-Za-z]*\s*(?:Pro|FE|Plus|Ultra)?)/i);
  if (galaxy) return `Galaxy ${galaxy[1].replace(/\s+/g, ' ').trim()}`;

  const iphone = clean.match(/iPhone\s*([\w\s]+?)(?:\s*-|\s+avec|\s+\d|$)/i);
  if (iphone) return `iPhone ${iphone[1].trim()}`;

  return null;
}

/** "128 Go" depuis specs.storage ou depuis le nom. */
function extractStorage(product) {
  const fromSpecs = product?.specs?.storage;
  if (fromSpecs) return String(fromSpecs);
  const fromName = stripHtml(product?.name || '').match(/(\d+\s?(?:Go|GB|TB))\b/i);
  return fromName ? fromName[1].replace(/\s+/g, ' ') : null;
}

/** "8 Go" depuis specs.ram ou depuis le nom. */
function extractRam(product) {
  const fromSpecs = product?.specs?.ram;
  if (fromSpecs) return String(fromSpecs);
  const fromName = stripHtml(product?.name || '').match(/(\d+\s?Go\s?RAM)/i);
  if (fromName) return fromName[1].replace(/\s*RAM/i, ' Go');
  return null;
}

/**
 * Construit l'introduction visible de la fiche.
 *
 * @param {object} product     produit brut de l'API
 * @param {object} preformatted `{ price, availability }` deja formate
 * @returns {string} une ou deux phrases, en francais
 */
export function buildProductIntro(product, preformatted = {}) {
  if (!product) return '';

  const price = preformatted.price ?? (product.price ? formatFcfa(product.price) : null);
  const availability =
    preformatted.availability ||
    (product.stock > 0 && product.status === 'available' ? 'en stock' : 'en rupture de stock');

  const brand = product.brand && product.brand.toLowerCase() !== 'générique' ? product.brand : null;
  const series = extractSeries(product.name);
  const storage = extractStorage(product);
  const ram = extractRam(product);
  const category = product.category?.[0]?.name;

  // --- Phrase 1 : le produit, son prix, ou il le trouve ---
  const sentences = [];

  const where = brand
    ? `${brand}${category ? `, rayon ${category.toLowerCase()}` : ''}`
    : category
      ? `notre rayon ${category.toLowerCase()}`
      : 'notre boutique';

  if (series) {
    sentences.push(
      `${series} est disponible sur tekalis.com${price ? ` à ${price} FCFA` : ''}, à Dakar (Fann) et livré partout au Sénégal.`
    );
  } else if (price) {
    sentences.push(
      `Trouvez ${stripHtml(product.name)} à ${price} FCFA sur tekalis.com, boutique d'électronique à Dakar (Fann).`
    );
  } else {
    sentences.push(
      `${stripHtml(product.name)} est référencé dans ${where} sur tekalis.com, boutique d'électronique à Dakar.`
    );
  }

  // --- Phrase 2 : les caractéristiques qui font la difference ---
  const traits = [];
  if (storage) traits.push(`${storage} de stockage`);
  if (ram) traits.push(`${ram} de RAM`);
  if (product.specs?.screen) traits.push(`écran ${product.specs.screen}`);
  else if (product.specs?.display) traits.push(`écran ${product.specs.display}`);
  if (product.specs?.battery) traits.push(`batterie ${product.specs.battery}`);

  if (traits.length > 0) {
    const list =
      traits.length === 1
        ? traits[0]
        : `${traits.slice(0, -1).join(', ')} et ${traits[traits.length - 1]}`;
    sentences.push(`Cette référence propose ${list}.`);
  }

  // --- Phrase 3 : disponibilite et commande ---
  const closing = [];
  if (availability === 'en stock') {
    closing.push(`Disponible ${availability}`);
  } else {
    closing.push('Actuellement en rupture de stock');
  }
  if (SHIPPING_CLAIM) closing.push(SHIPPING_CLAIM.toLowerCase());
  if (PAYMENT_CLAIM) closing.push(PAYMENT_CLAIM.toLowerCase());

  sentences.push(`${closing.join(', ')}.`);

  return sentences.join(' ');
}
