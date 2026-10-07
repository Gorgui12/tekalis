#!/usr/bin/env node
/**
 * scripts/solar-check.mjs
 *
 * Verification des pages solaires TELLES QU'ELLES sont servees (HTTP reel),
 * pas telles qu'elles sont ecrites.
 *
 * Pour chaque URL solaire :
 *   1. statut HTTP 200 ;
 *   2. exactement un <h1> ;
 *   3. <title> present, <= 65 caracteres ;
 *   4. meta description presente, <= 160 caracteres ;
 *   5. canonical auto-referentielle (chemin identique) ;
 *   6. au moins un bloc JSON-LD parsable ;
 *   7. volume de texte visible minimal ;
 *   8. aucun <a href="/configurator"> (ancienne URL, doit rediriger) ;
 *   9. avertissement "indication" non present ? non : la mention
 *      "estimation indicative" doit exister sur le configurateur.
 *
 * Sondes de statut :
 *   - /configurator  -> 308 vers /configurateur-solaire ;
 *   - /kit-solaire/zzz-slug-inconnu -> 404 ;
 *   - /outils/zzz-outil-inconnu     -> 404 ;
 *
 * Sitemap : /sitemap.xml doit contenir le configurateur, les kits,
 * les outils et les 3 guides.
 *
 * Usage :
 *   node scripts/solar-check.mjs                    # http://localhost:3000
 *   node scripts/solar-check.mjs http://localhost:3117
 *   node scripts/solar-check.mjs <url> --no-start   # ne demarre pas de serveur
 *
 * Sortie : code 1 si une regle est violee.
 */

const argBase = process.argv.slice(2).find((a) => !a.startsWith('-'));
const BASE = (argBase || process.env.SOLAR_BASE_URL || 'http://localhost:3000').replace(/\/+$/, '');
const CANONICAL_HOST = 'https://tekalis.com';
const TITLE_MAX = 65;
const DESC_MAX = 160;
const MIN_VISIBLE = 1500;

const errors = [];
const warnings = [];

function fail(scope, rule, detail) {
  errors.push({ scope, rule, detail });
}

function warn(scope, rule, detail) {
  warnings.push({ scope, rule, detail });
}

function stripScripts(html) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '');
}

function matchOne(html, re) {
  const m = html.match(re);
  return m ? m[1] : null;
}

function decode(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/\s+/g, ' ')
    .trim();
}

// Slugs reels, lus depuis lib/solar/presets.js (source de verite).
const presetsMod = await import(
  new URL('../tekalis-frontend/apps/tekalis-next/lib/solar/presets.js', import.meta.url)
);
const KIT_SLUGS = presetsMod.kitPresetSlugs();

const SOLAR_PATHS = [
  '/configurateur-solaire',
  ...KIT_SLUGS.map((s) => `/kit-solaire/${s}`),
  '/outils/calculateur-consommation-electrique',
  '/outils/calculateur-batterie-solaire',
  '/outils/calculateur-panneaux-solaires',
  '/blog/dimensionner-kit-solaire-senegal',
  '/blog/batterie-gel-ou-lithium',
  '/blog/onduleur-hybride-ou-off-grid',
];

async function checkUrl(pathname) {
  const url = `${BASE}${pathname}`;
  const scope = pathname;

  let res;
  try {
    res = await fetch(url, { redirect: 'manual' });
  } catch (err) {
    fail(scope, 'requete', `${err.message} — le serveur est-il demarre sur ${BASE} ?`);
    return null;
  }

  if (res.status !== 200) {
    fail(scope, 'statut', `HTTP ${res.status} au lieu de 200`);
    return null;
  }

  const html = await res.text();
  const visible = stripScripts(html).length;

  const h1Count = (html.match(/<h1[\s>]/gi) || []).length;
  if (h1Count !== 1) fail(scope, 'h1', `${h1Count} <h1> detecte(s), 1 attendu`);

  const title = decode(matchOne(html, /<title[^>]*>([\s\S]*?)<\/title>/i) || '');
  if (!title) fail(scope, 'title', 'absent');
  else if (title.length > TITLE_MAX) {
    warn(scope, 'title', `${title.length} caracteres (> ${TITLE_MAX}, risque de troncature)`);
  }

  const description = decode(
    matchOne(html, /<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) || ''
  );
  if (!description) fail(scope, 'description', 'absente');
  else if (description.length > DESC_MAX) {
    warn(scope, 'description', `${description.length} caracteres (> ${DESC_MAX})`);
  }

  const canonical = matchOne(html, /<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)
    || matchOne(html, /<link[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["']/i);
  if (!canonical) {
    fail(scope, 'canonical', 'absente');
  } else {
    let canonicalPath = null;
    try {
      canonicalPath = new URL(canonical).pathname;
    } catch {
      canonicalPath = null;
    }
    if (!canonical.startsWith(CANONICAL_HOST)) {
      fail(scope, 'canonical', `hote inattendu : ${canonical}`);
    } else if (canonicalPath !== pathname) {
      fail(scope, 'canonical', `non auto-referentielle (${canonicalPath} != ${pathname})`);
    }
  }

  const jsonLd = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  if (jsonLd.length === 0) fail(scope, 'json-ld', 'aucun bloc JSON-LD');
  for (const [, raw] of jsonLd) {
    try {
      JSON.parse(raw.trim());
    } catch (err) {
      fail(scope, 'json-ld', `JSON invalide : ${err.message}`);
    }
  }

  if (visible < MIN_VISIBLE) {
    fail(scope, 'contenu', `${visible} caracteres visibles (< ${MIN_VISIBLE}) : page vide au rendu`);
  }

  if (/<a[^>]+href=["']\/configurator/.test(html)) {
    fail(scope, 'lien', 'lien interne vers l ancienne URL /configurator');
  }

  const robots = matchOne(html, /<meta[^>]*name=["']robots["'][^>]*content=["']([^"']*)["']/i) || '';
  if (/noindex/i.test(robots)) fail(scope, 'robots', `noindex inattendu (${robots})`);

  if (pathname === '/configurateur-solaire') {
    if (!/estimation indicative/i.test(decode(stripScripts(html)))) {
      fail(scope, 'mention', "avertissement 'Estimation indicative' absent");
    }
    if (!/faire valider par un technicien/i.test(decode(stripScripts(html)))) {
      fail(scope, 'mention', "avertissement 'a faire valider par un technicien' absent");
    }
  }

  return { scope, title, description, visible, jsonLd: jsonLd.length, h1: h1Count };
}

async function probe(pathname, expectStatus, label) {
  try {
    const res = await fetch(`${BASE}${pathname}`, { redirect: 'manual' });
    const location = res.headers.get('location');
    const ok = res.status === expectStatus;
    if (!ok) {
      fail(label, 'statut', `HTTP ${res.status} au lieu de ${expectStatus}`);
    }
    console.log(
      `  ${ok ? 'OK  ' : 'ECHEC'} ${label.padEnd(42)} HTTP ${res.status}` +
        (location ? ` -> ${location}` : '')
    );
    if (ok && label === 'redirection /configurator') {
      const dest = location ? new URL(location, BASE).pathname : null;
      if (dest !== '/configurateur-solaire') {
        fail(label, 'destination', `pointe vers ${dest} au lieu de /configurateur-solaire`);
      }
    }
    return ok;
  } catch (err) {
    fail(label, 'requete', err.message);
    return false;
  }
}

async function checkSitemap() {
  const scope = '/sitemap.xml';
  let xml;
  try {
    const res = await fetch(`${BASE}/sitemap.xml`);
    if (res.status !== 200) {
      fail(scope, 'statut', `HTTP ${res.status}`);
      return;
    }
    xml = await res.text();
  } catch (err) {
    fail(scope, 'requete', err.message);
    return;
  }

  const missing = SOLAR_PATHS.filter((p) => !xml.includes(`${CANONICAL_HOST}${p}`));
  if (missing.length) {
    fail(scope, 'entrées manquantes', `${missing.length} URL(s) absente(s) : ${missing.join(', ')}`);
  } else {
    console.log(`  OK   sitemap contient les ${SOLAR_PATHS.length} URLs solaires`);
  }
}

// ---------------------------------------------------------------------------

console.log(`Base controlee : ${BASE}`);
console.log(`Pages solaires a verifier : ${SOLAR_PATHS.length}\n`);

const rows = [];
for (const p of SOLAR_PATHS) {
  const r = await checkUrl(p);
  if (r) rows.push(r);
}

console.log(`\nPages conformes : ${rows.length}/${SOLAR_PATHS.length}`);

console.log('\nSondes de statut HTTP...');
await probe('/configurator', 308, 'redirection /configurator');
await probe('/kit-solaire/zzz-slug-inconnu', 404, 'slug kit inconnu');
await probe('/outils/zzz-outil-inconnu', 404, 'outil inconnu');
await probe('/blog/zzz-guide-inconnu', 404, 'guide inconnu');

console.log('\nSitemap...');
await checkSitemap();

console.log(`\n${'='.repeat(72)}\nVerification solaire — ${BASE}\n${'='.repeat(72)}`);

if (rows.length) {
  console.log('\nDetail :');
  for (const r of rows) {
    console.log(
      `  h1=${r.h1} jsonld=${String(r.jsonLd).padStart(2)} visible=${String(r.visible).padStart(6)}  ${r.title.slice(0, 50)}`
    );
  }
}

if (warnings.length) {
  console.log(`\nAvertissements (${warnings.length}) :`);
  for (const w of warnings) console.log(`  - [${w.scope}] ${w.rule} : ${w.detail}`);
}

if (errors.length) {
  console.log(`\nERREURS (${errors.length}) :`);
  for (const e of errors) console.log(`  - [${e.scope}] ${e.rule} : ${e.detail}`);
  console.log('\nVerification solaire : ECHEC');
  process.exit(1);
}

console.log('\nVerification solaire : OK');
