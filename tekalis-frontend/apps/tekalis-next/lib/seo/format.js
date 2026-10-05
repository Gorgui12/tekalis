/**
 * lib/seo/format.js
 *
 * Formatage et normalisation utilises par les balises SEO et le contenu
 * visible. Aucun import React, aucun effet de bord : testable avec node:test.
 */

/**
 * Formate un montant en FCFA pour l'affichage lisible.
 *   formatFcfa(95000) -> "95 000"
 *
 * `Intl` en fr-FR utilise l'espace insecable U+00A0 comme separateur de
 * milliers : on le remplace par une espace ordinaire pour que le texte reste
 * lisible en HTML comme en meta description.
 */
export function formatFcfa(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '';
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(
    Number(value)
  );
}

/** Montant + devise, ex. "95 000 FCFA". */
export function formatPrice(value) {
  const formatted = formatFcfa(value);
  return formatted ? `${formatted} FCFA` : '';
}

/**
 * Tronque proprement sur une limite de mots (jamais au milieu d'un mot)
 * et sans caractere de ponctuation orphelin.
 */
export function truncate(input, maxLength = 155) {
  if (!input) return '';
  const text = String(input).replace(/\s+/g, ' ').trim();
  if (text.length <= maxLength) return text;
  const cut = text.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(' ');
  const base = lastSpace > maxLength * 0.5 ? cut.slice(0, lastSpace) : cut;
  return `${base.replace(/[\s,;:.\-–—]+$/, '')}…`;
}

/**
 * Coupe a une frontiere de mot et termine par `...`, en respectant `maxLength`
 * *final* (points de suspension compris).
 *
 * `truncate` termine par un point et coupe parfois au milieu d'un mot : c'est
 * acceptable pour une description, pas pour un titre, ou une coupure en milieu
 * de mot gaspille la place la plus precieuse du resultat Google.
 */
export function truncateAtWord(input, maxLength = 65) {
  if (!input) return '';
  const text = String(input).replace(/\s+/g, ' ').trim();
  if (text.length <= maxLength) return text;
  const room = maxLength - 3;
  const cut = text.slice(0, room);
  const lastSpace = cut.lastIndexOf(' ');
  const base = lastSpace > room * 0.5 ? cut.slice(0, lastSpace) : cut;
  return `${base.replace(/[\s,;:.\-–—]+$/, '')}...`;
}

/** Retire les balises HTML et decode les entities les plus courantes. */
export function stripHtml(input) {
  if (!input) return '';
  return String(input)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&eacute;/gi, 'é')
    .replace(/&egrave;/gi, 'è')
    .replace(/&agrave;/gi, 'à')
    .replace(/&rsquo;/gi, '’')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Slugify robuste : supprime les accents au lieu de les convertir en separateurs.
 *
 * C'est exactement le bug de tekalis-backend/models/Article.js qui a produit
 * "meilleur-smartphone-2026-au-s-n-gal" : sans normalisation NFD, `é` est
 * supprime par `[^a-z0-9]+` et laisse `s-n-gal`.
 *
 * Uniquement utilise pour de NOUVEAUX slugs : les slugs existants ne bougent pas.
 */
export function slugify(input) {
  if (!input) return '';
  return String(input)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Sénégal -> Senegal
    .replace(/['’]/g, '') // l'iPhone -> liphone
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Detecte un slug de produit "ancien format" : le nom suivi d'un suffixe
 * Date.now() a 13 chiffres, ajoute par resolveUniqueSlug() dans le backend.
 *   samsung-galaxy-a14-128-go-4-go-1786915894592
 * Ces URL sont aujourd'hui en 404 et sont indexees par Google : il faut les
 * rediriger en 301 vers le slug propre.
 */
export function stripTimestampSuffix(idOrSlug) {
  if (!idOrSlug) return null;
  const match = String(idOrSlug).match(/^(.*)-\d{13}$/);
  return match && match[1] ? match[1] : null;
}

/** Un ObjectId Mongo (24 caracteres hexadecimaux) est aussi une URL produit historique. */
export function isMongoObjectId(value) {
  return typeof value === 'string' && /^[a-f\d]{24}$/i.test(value);
}

/**
 * Construit une ancre de lien interne descriptive a partir d'un produit.
 * Utilise par le maillage interne (phase 7) : l'ancre doit contenir le nom et
 * l'intention "prix", pas un "cliquez ici".
 */
export function productAnchor(name, price) {
  const formatted = formatFcfa(price);
  return formatted ? `${name} - prix au Sénégal` : name;
}

/** Premiere lettre en capitale. */
export function capitalize(input) {
  if (!input) return '';
  return input.charAt(0).toUpperCase() + input.slice(1);
}

/** Pluralisation simple : "1 produit" / "3 produits". */
export function plural(count, singular, pluralForm) {
  const word = count > 1 ? pluralForm : singular;
  return `${count} ${word}`;
}

/** Joined list without Oxford comma: "Wave, Orange Money et Free Money". */
export function joinFrench(items) {
  const list = items.filter(Boolean);
  if (list.length === 0) return '';
  if (list.length === 1) return list[0];
  return `${list.slice(0, -1).join(', ')} et ${list[list.length - 1]}`;
}
