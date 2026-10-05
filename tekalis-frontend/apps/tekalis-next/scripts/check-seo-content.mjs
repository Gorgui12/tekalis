/**
 * scripts/check-seo-content.mjs
 *
 * Controle qualite du contenu editorial des categories.
 *
 * Verifie :
 *  1. le fichier est du JS valide (import) ;
 *  2. aucun caractere hors alphabet latin (detecte la corruption de generation) ;
 *  3. chaque slug de CATEGORY_CONTENT correspond a une categorie reelle de l'API ;
 *  4. les 16 categories de l'API ont toutes une entree ;
 *  5. title <= 70 car., description entre 120 et 160 car. ;
 *  6. intro entre 110 et 210 mots ;
 *  7. chaque marque citee dans l'intro existe dans l'API (anti-hallucination) ;
 *  8. FAQ : 1 a 4 questions, reponse non vide.
 *
 * Usage : node scripts/check-seo-content.mjs
 * Sortie : code 1 si une regle est violee.
 */

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const API = 'https://tekalis.onrender.com/api/v1';
const errors = [];

const here = path.dirname(fileURLToPath(import.meta.url));
const target = path.resolve(here, '../lib/seo/categoryContent.js');
const configPath = path.resolve(here, '../lib/seo/config.js');
const source = await readFile(target, 'utf8');
const configSource = await readFile(configPath, 'utf8');

// Les imports de l'app sont sans extension (style webpack) : on ne peut pas
// importer le module directement avec Node ESM. On evalue le fichier isolement,
// en injectant les 4 claims, dont on verifie la presence dans config.js.
const CLAIMS = {
  SHIPPING_CLAIM: 'Livraison a Dakar sous 24 a 48 h, offerte des 100 000 FCFA',
  PAYMENT_CLAIM: 'Paiement a la livraison, Wave, Orange Money ou Free Money',
  RETURNS_CLAIM: 'Retour possible sous 7 jours apres reception',
  WARRANTY_CLAIM: 'Garantie constructeur incluse',
};
for (const name of Object.keys(CLAIMS)) {
  if (!new RegExp(`export const ${name}\\b`).test(configSource)) {
    throw new Error(`${name} introuvable dans lib/seo/config.js`);
  }
}
const runnable = source
  .replace(/^\s*import\s+[^;]+;$/gm, '')
  .replace(/^export /gm, '');
const factory = new Function(
  ...Object.keys(CLAIMS),
  `${runnable}\nreturn { CATEGORY_CONTENT, buildFallbackCategoryContent };`
);
const { CATEGORY_CONTENT: CONTENT } = factory(...Object.values(CLAIMS));
if (typeof CONTENT !== 'object') {
  throw new Error('CATEGORY_CONTENT introuvable ou invalide');
}

// --- 2. Caracteres hors latin --------------------------------------------
const raw = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const bad = raw.match(/[\u2E80-\u9FFF\uAC00-\uD7AF\uF900-\uFAFF\uFF00-\uFFEF\u3000-\u303F]/g);
if (bad) {
  const uniq = [...new Set(bad)].join(' ');
  errors.push(`caracteres hors latin detectes : ${uniq}`);
}

// --- 3-4. Couverture des categories reelles ------------------------------
const [catsRes, prodRes] = await Promise.all([
  fetch(`${API}/categories`).then((r) => r.json()),
  fetch(`${API}/products?limit=200`).then((r) => r.json()),
]);
const apiSlugs = new Set(catsRes.categories.map((c) => c.slug));
const products = prodRes.data;

for (const slug of Object.keys(CONTENT)) {
  if (!apiSlugs.has(slug)) errors.push(`slug inconnu de l'API : ${slug}`);
}
for (const slug of apiSlugs) {
  if (!CONTENT[slug]) errors.push(`categorie API sans contenu : ${slug}`);
}

// Marques reellement presentes (accent-insensible)
const norm = (s) =>
  String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/gi, '')
    .toLowerCase();
const apiBrands = new Set(products.map((p) => norm(p.brand)).filter(Boolean));
// Corpus phrastique : noms de produits complets, pour reconnaitre un modele
// compose de plusieurs mots (« Dual Inverter », « Inverter Direct Drive »).
const apiPhrases = new Set(products.flatMap((p) => [norm(p.name), norm(p.brand)]).filter(Boolean));
const apiWords = new Set(
  products
    .flatMap((p) => [p.name, p.brand])
    .join(' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split(/[^a-z0-9]+/i)
    .filter((w) => w.length >= 4)
    .map((w) => w.toLowerCase())
);

const overlapsBrand = (phrase) =>
  [...apiBrands].some((b) => b && (phrase.includes(b) || b.includes(phrase)));

// --- 5-8. Regles par categorie -------------------------------------------
const BRANDS = [
  'Apple', 'Samsung', 'HP', 'Dell', 'Lenovo', 'Asus', 'Xiaomi', 'JBL', 'Sony',
  'LG', 'Hisense', 'TCL', 'Midea', 'Westpool', 'Roch', 'Binatone', 'Sayona',
  'TP-Link', 'Segway', 'Fiido', 'Redragon', 'Anker', 'SanDisk', 'Logitech',
  'Toshiba', 'Epson', 'APC', 'Felicity', 'Must', 'Ritar', 'Jinko', 'Suer',
  'Havit', 'Amazon', 'Google', 'Shinecon', 'Smart Technology', 'Microsoft',
  'Modio', 'Atouch', 'ZTE', 'Moulinex', 'Kotion Each', 'Gen Game', 'Lenovo',
];

for (const [slug, c] of Object.entries(CONTENT)) {
  if (!c.title) errors.push(`${slug}: title manquant`);
  if (c.title && c.title.length > 70) errors.push(`${slug}: title ${c.title.length} car. (>70)`);

  const dl = (c.description || '').length;
  if (dl < 120 || dl > 160) errors.push(`${slug}: description ${dl} car. (120-160)`);

  const words = (c.intro || '').trim().split(/\s+/).filter(Boolean).length;
  if (words < 110 || words > 210) errors.push(`${slug}: intro ${words} mots (110-210)`);

  if (!c.h1) errors.push(`${slug}: h1 manquant`);

  // Anti-hallucination : marque citee mais absente de l'API
  // Chaque champ est suivi d'un point pour que les majuscules de debut de
  // phrase soient traitees comme telles et ne soient pas prises pour un
  // nom de marque.
  const text = [c.title, c.description, c.h1, c.intro, JSON.stringify(c.faqs || [])]
    .filter(Boolean)
    .join('. ')
    .replace(/".*?"/g, '');
  for (const b of BRANDS) {
    if (new RegExp(`\\b${b}\\b`, 'i').test(text) && !overlapsBrand(norm(b))) {
      errors.push(`${slug}: marque citee absente de l'API : ${b}`);
    }
  }

  // Anti-hallucination : nom de modele « Foo Bar » absent du catalogue.
  // Deux faux positifs a ecarter :
  //  - les majuscules de debut de phrase (« Tekalis MacBook... ») ;
  //  - les termes hors catalogue legitimes (operateurs de paiement).
  const NOT_PRODUCTS = ['Orange Money', 'Free Money', 'Wave Money', 'Wave'];
  const segments = text.split(/(?<=[.!?:;])\s+/);
  const scannable = segments.map((s) => s.split(/\s+/).slice(2).join(' ')).join(' ');
  for (const m of scannable.matchAll(/\b([A-Z][a-zA-Z]{3,}(?:\s+[A-Z][a-zA-Z]{3,})+)\b/g)) {
    if (NOT_PRODUCTS.includes(m[1])) continue;
    const phrase = norm(m[1]);
    if (!phrase) continue;
    if (apiPhrases.has(phrase) || apiWords.has(phrase)) continue;
    if (BRANDS.some((b) => norm(b) === phrase)) continue;
    if (overlapsBrand(phrase)) continue;
    // Sous-phrase composite : chaque mot significant existe au catalogue
    // (« Dual Inverter » -> « dual » + « inverter » sont bien presents).
    const wordsOfPhrase = m[1]
      .split(/\s+/)
      .map((w) => norm(w))
      .filter((w) => w.length >= 4);
    if (wordsOfPhrase.length > 0 && wordsOfPhrase.every((w) => apiWords.has(w))) continue;
    errors.push(`${slug}: libelle non verifie dans l'API : "${m[1]}"`);
  }

  const faqs = c.faqs || [];
  if (faqs.length < 1 || faqs.length > 4) errors.push(`${slug}: ${faqs.length} FAQ (1-4)`);
  for (const f of faqs) {
    if (!f.q || !f.a) errors.push(`${slug}: FAQ incomplete`);
  }
}

// --- Rapport --------------------------------------------------------------
console.log(`Categories API : ${apiSlugs.size}`);
console.log(`Categories avec contenu : ${Object.keys(CONTENT).length}`);
console.log(`Produits analyses : ${products.length}`);
if (errors.length === 0) {
  console.log('\nOK - toutes les regles sont respectees.');
} else {
  console.log(`\n${errors.length} probleme(s) :`);
  for (const e of errors) console.log(`  - ${e}`);
  process.exit(1);
}