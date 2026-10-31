/**
 * scripts/check-prix-guides.mjs
 *
 * Controle qualite des guides de prix (lib/utils/prixGuides.js).
 *
 * Verifie :
 *  1. slugs, titles et meta descriptions uniques ;
 *  2. title <= 60 caracteres (avertissement) et <= 70 (erreur) ;
 *  3. meta description entre 140 et 160 caracteres ;
 *  4. h1, summary, query[], search et categorySlug presents ;
 *  5. categorySlug present dans KNOWN_CATEGORY_SLUGS (lib/seo/config.js) ;
 *  6. minimum 4 FAQ pour les guides ajoutes dans ce lot ;
 *  7. chaque `related` / `seeAlso` pointe vers un guide existant.
 *
 * Usage : node scripts/check-prix-guides.mjs
 * Sortie : code 1 si une regle est violee.
 */

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const target = path.resolve(here, '../lib/utils/prixGuides.js');
const configPath = path.resolve(here, '../lib/seo/config.js');

const source = await readFile(target, 'utf8');
const configSource = await readFile(configPath, 'utf8');

const runnable = source
  .replace(/^\s*import\s+[^;]+;$/gm, '')
  .replace(/^export /gm, '');
const factory = new Function(
  'SITE_URL',
  `${runnable}\nreturn { PRIX_GUIDES, getPrixGuide, guideBrand, guidesByBrand, getRelatedGuides, findPrixGuideForProduct, prixGuideBreadcrumb, TOP_PRIX_GUIDE_SLUGS };`
);
const {
  PRIX_GUIDES,
  getPrixGuide,
  guidesByBrand,
  getRelatedGuides,
  findPrixGuideForProduct,
  prixGuideBreadcrumb,
  TOP_PRIX_GUIDE_SLUGS,
} = factory('https://tekalis.com');

const categoryBlock = configSource.match(/KNOWN_CATEGORY_SLUGS\s*=\s*\[([\s\S]*?)\]/);
const KNOWN_CATEGORY_SLUGS = categoryBlock
  ? [...categoryBlock[1].matchAll(/['"]([^'"]+)['"]/g)].map((m) => m[1])
  : [];

const NEW_SLUGS = new Set([
  'iphone-11-prix-dakar',
  'iphone-15-prix-dakar',
  'iphone-15-pro-prix-dakar',
  'iphone-16-prix-dakar',
  'iphone-12-mini-prix-dakar',
  'iphone-8-plus-prix-dakar',
  'iphone-17-pro-max-prix-dakar',
  'samsung-galaxy-s21-prix-fcfa',
  'samsung-galaxy-s10-plus-prix-fcfa',
  'samsung-galaxy-a34-prix-fcfa',
  'iphone-14-plus-prix-dakar',
]);

// Guides existants dont le title et la meta ont ete retravailles dans ce lot.
const IMPROVED_SLUGS = new Set([
  'iphone-13-prix-dakar',
  'iphone-xr-prix-dakar',
  'iphone-12-prix-dakar',
]);

const errors = [];
const warnings = [];
const seenSlugs = new Map();
const seenTitles = new Map();
const seenDescriptions = new Map();
const seenH1 = new Map();

const fail = (slug, rule, detail) => errors.push(`[${slug}] ${rule} : ${detail}`);
const warn = (slug, rule, detail) => warnings.push(`[${slug}] ${rule} : ${detail}`);

for (const guide of PRIX_GUIDES) {
  const slug = guide.slug || '(sans slug)';

  if (!guide.slug) fail(slug, 'slug', 'absent');
  else if (seenSlugs.has(guide.slug)) fail(slug, 'slug', `duplique avec ${seenSlugs.get(guide.slug)}`);
  else seenSlugs.set(guide.slug, slug);

  if (!guide.title) fail(slug, 'title', 'absent');
  else {
    if (seenTitles.has(guide.title)) fail(slug, 'title', `duplique avec ${seenTitles.get(guide.title)}`);
    else seenTitles.set(guide.title, slug);
    if (guide.title.length > 70) fail(slug, 'title', `${guide.title.length} car. (> 70)`);
    else if (guide.title.length > 60) warn(slug, 'title', `${guide.title.length} car. (> 60)`);
  }

  if (!guide.metaDescription) fail(slug, 'meta', 'absente');
  else {
    if (seenDescriptions.has(guide.metaDescription)) {
      fail(slug, 'meta', `dupliquee avec ${seenDescriptions.get(guide.metaDescription)}`);
    } else {
      seenDescriptions.set(guide.metaDescription, slug);
    }
    const length = guide.metaDescription.length;
    if (length < 140 || length > 160) {
      // Regle imposee pour les guides crees ou retravailles dans ce lot ; les
      // autres guides anciens sont seulement signales.
      if (NEW_SLUGS.has(guide.slug) || IMPROVED_SLUGS.has(guide.slug)) {
        fail(slug, 'meta', `${length} car. (140-160)`);
      } else {
        warn(slug, 'meta', `${length} car. (hors 140-160)`);
      }
    }
  }

  if (!guide.h1) fail(slug, 'h1', 'absent');
  else {
    if (seenH1.has(guide.h1)) warn(slug, 'h1', `duplique avec ${seenH1.get(guide.h1)}`);
    else seenH1.set(guide.h1, slug);
  }

  if (!guide.summary) fail(slug, 'summary', 'absent');
  if (!Array.isArray(guide.query) || guide.query.length === 0) fail(slug, 'query', 'vide');
  if (!guide.search && !guide.brand) fail(slug, 'search', 'absent');
  if (!guide.categorySlug) fail(slug, 'categorySlug', 'absent');
  else if (!KNOWN_CATEGORY_SLUGS.includes(guide.categorySlug)) {
    fail(slug, 'categorySlug', `inconnu dans KNOWN_CATEGORY_SLUGS : ${guide.categorySlug}`);
  }

  if (!Array.isArray(guide.faqs)) fail(slug, 'faqs', 'absent');
  else if (NEW_SLUGS.has(guide.slug) && guide.faqs.length < 4) {
    fail(slug, 'faqs', `${guide.faqs.length} question(s), minimum 4`);
  }

  for (const relatedSlug of guide.related || []) {
    if (!getPrixGuide(relatedSlug)) fail(slug, 'related', `guide inexistant : ${relatedSlug}`);
  }
  for (const seeAlso of guide.seeAlso || []) {
    if (!getPrixGuide(seeAlso.slug)) fail(slug, 'seeAlso', `guide inexistant : ${seeAlso.slug}`);
  }
}

// Les helpers doivent rester coherents avec les donnees.
for (const guide of PRIX_GUIDES) {
  const related = getRelatedGuides(guide);
  if (related.length === 0) fail(guide.slug, 'related', 'aucun guide voisin genere');
}

for (const slug of TOP_PRIX_GUIDE_SLUGS) {
  if (!getPrixGuide(slug)) fail('TOP_PRIX_GUIDE_SLUGS', 'guide', `inexistant : ${slug}`);
}

const groups = guidesByBrand();
for (const group of groups) {
  if (!group.guides.length) fail('guidesByBrand', 'groupe', `${group.brand} vide`);
}

// Sondes de mapping produit -> guide.
const mappingProbes = [
  ['iPhone 11 (64Go / 128Go)', 'iphone-11-prix-dakar'],
  ['iPhone 11 Pro', null],
  ['iPhone 11 Pro Max', 'iphone-11-pro-max-prix-dakar'],
  ['iPhone 15 simple (128GB / 256GB)', 'iphone-15-prix-dakar'],
  ['iPhone 15 Pro Max 256Go', 'iphone-15-pro-prix-dakar'],
  ['iPhone 15 Pro', 'iphone-15-pro-prix-dakar'],
  ['iPhone 16 256Go', 'iphone-16-prix-dakar'],
  ['iPhone 12 Mini', 'iphone-12-mini-prix-dakar'],
  ['iPhone 8 64 Go - Venant', 'iphone-8-plus-prix-dakar'],
  ['iPhone 17 Pro / Pro Max 256GB eSIM', 'iphone-17-pro-max-prix-dakar'],
  ['Samsung Galaxy S21 5G 128 Go - Venant', 'samsung-galaxy-s21-prix-fcfa'],
  ['Samsung Galaxy S10+ 128 Go - Venant', 'samsung-galaxy-s10-plus-prix-fcfa'],
  ['Samsung Galaxy S10 128 Go - Venant', 'samsung-galaxy-s10-prix-fcfa'],
  ['Samsung Galaxy A34 5G 128 Go / 8 Go', 'samsung-galaxy-a34-prix-fcfa'],
  ['iPhone 14 Plus', 'iphone-14-plus-prix-dakar'],
  ['Chargeur Rapide Apple 20W Type-C Original', null],
];
for (const [name, expected] of mappingProbes) {
  const found = findPrixGuideForProduct({ name });
  const actual = found ? found.slug : null;
  if (actual !== expected) {
    fail('mapping produit', name, `${actual || 'aucun'} (attendu : ${expected || 'aucun'})`);
  }
}

// Fil d'Ariane.
for (const guide of PRIX_GUIDES) {
  const items = prixGuideBreadcrumb(guide);
  if (items.length !== 3 || items[0].path !== '/' || items[1].path !== '/prix') {
    fail(guide.slug, 'breadcrumb', 'doit etre Accueil > Prix > modele');
  }
}

console.log(`Guides analyses : ${PRIX_GUIDES.length}`);
console.log(`Groupes de marque : ${groups.map((g) => `${g.brand} (${g.guides.length})`).join(', ')}`);
console.log(`Guides mis en avant sur l'accueil : ${TOP_PRIX_GUIDE_SLUGS.length}`);

if (warnings.length) {
  console.log(`\nAvertissements (${warnings.length}) :`);
  for (const warning of warnings) console.log(`  - ${warning}`);
}

if (errors.length) {
  console.log(`\nERREURS (${errors.length}) :`);
  for (const error of errors) console.log(`  - ${error}`);
  console.log('\nControle des guides de prix : ECHEC');
  process.exit(1);
}

console.log('\nControle des guides de prix : OK');
