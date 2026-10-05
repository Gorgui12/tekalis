/**
 * scripts/seo-check.mjs
 *
 * Controle SEO du site **tel qu'il est servi**, pas tel qu'il est ecrit.
 *
 * Deux bugs critiques ont ete trouves uniquement en interrogeant le serveur :
 *   - `PersistGate` rendait un `<body>` vide sur les 58 pages ;
 *   - `loading.jsx` a la racine gelait le statut HTTP a 200 (soft 404).
 * Aucun des deux n'etait visible dans le code. Ce script verifie donc le HTML
 * reellement renvoye par HTTP.
 *
 * Pour chaque URL indexable, controle :
 *   1. statut HTTP 200 ;
 *   2. exactement un `<h1>` ;
 *   3. `<title>` present ;
 *   4. canonical absolu, en HTTPS, auto-referential ;
 *   5. meta robots indexable (pas de noindex sur une page du sitemap) ;
 *   6. aucune meta `keywords` (ignoree par Google depuis 2009) ;
 *   7. blocs JSON-LD parsables ;
 *   8. volume de texte visible minimal.
 *
 * Plus, en fin de run, des sondes de statut :
 *   - un produit inexistant doit repondre 404, pas 200 (soft 404) ;
 *   - un ObjectId doit repondre 308 vers le slug propre ;
 *   - une categorie, un article et un guide de prix inexistants : 404.
 *
 * Detecte aussi les titres et descriptions dupliques entre pages.
 *
 * Usage :
 *   node scripts/seo-check.mjs                      # contre http://localhost:3000
 *   node scripts/seo-check.mjs http://localhost:3117
 *   node scripts/seo-check.mjs <url> --full          # toutes les fiches produit
 *   node scripts/seo-check.mjs <url> --products=100  # echantillon de produits
 *
 * Variables d'env : SEO_BASE_URL, SEO_API_BASE.
 * Sortie : code 1 si une regle est violee.
 */

const argBase = process.argv.slice(2).find((a) => !a.startsWith('-'));
const full = process.argv.includes('--full');
const productLimitArg = process.argv.slice(2).find((a) => a.startsWith('--products='));

const BASE = (argBase || process.env.SEO_BASE_URL || 'http://localhost:3000').replace(/\/+$/, '');
const API = (process.env.SEO_API_BASE || 'https://tekalis.onrender.com/api/v1').replace(/\/+$/, '');
const PRODUCT_LIMIT = Number(productLimitArg?.split('=')[1] || (full ? Infinity : 25));
const CONCURRENCY = 8;
const MIN_VISIBLE = 2000;
const CANONICAL_HOST = 'https://tekalis.com';

const STATIC_PATHS = [
  '/', '/products', '/blog', '/prix', '/tendances', '/apropos', '/contact',
  '/faq', '/livraison', '/retours', '/garanties', '/mentions-legales',
  '/cgv', '/politique', '/cookies',
];

/** Pages privates : doivent rester accessibles au crawler pour porter noindex. */
const PRIVATE_PATHS = ['/login', '/register', '/cart', '/wishlist', '/checkout'];

/*
 * `/wishlist` et `/checkout` sont proteges par le middleware : un visiteur non
 * connecte est renvoye vers `/login` en 307. C'est le comportement attendu (le
 * crawler n'est pas connecte non plus), on accepte donc les deux cas.
 */
const AUTH_GUARDED = new Set(['/wishlist', '/checkout']);

const errors = [];
const warnings = [];
const seenTitles = new Map();
const seenDescriptions = new Map();

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

async function mapWithConcurrency(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await worker(items[index], index);
    }
  });
  await Promise.all(runners);
  return results;
}

async function checkUrl(pathname, { expectNoindex = false } = {}) {
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

  // 2. Un seul H1
  const h1Count = (html.match(/<h1[\s>]/gi) || []).length;
  if (h1Count !== 1) {
    fail(scope, 'h1', `${h1Count} <h1> detecte(s), 1 attendu`);
  }

  // 3. Titre
  const title = decode(matchOne(html, /<title[^>]*>([\s\S]*?)<\/title>/i) || '');
  if (!title) fail(scope, 'title', 'absent');
  if (title.length > 70) warn(scope, 'title', `${title.length} caracteres (> 70, risque de troncature)`);

  // 4. Canonical
  const canonical = matchOne(html, /<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)
    || matchOne(html, /<link[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["']/i);
  if (!canonical) {
    fail(scope, 'canonical', 'absent');
  } else if (canonical !== CANONICAL_HOST && !canonical.startsWith(`${CANONICAL_HOST}/`)) {
    fail(scope, 'canonical', `hote inattendu : ${canonical}`);
  } else {
    // Self-referential : on compare les chemins, l'hote canonique est absolu.
    let canonicalPath = null;
    try {
      canonicalPath = new URL(canonical).pathname;
    } catch {
      canonicalPath = null;
    }
    if (canonicalPath && canonicalPath !== pathname) {
      warn(scope, 'canonical', `pointe ailleurs que l'URL courante : ${canonical}`);
    }
  }

  // 5. Meta robots
  const robots = matchOne(html, /<meta[^>]*name=["']robots["'][^>]*content=["']([^"']*)["']/i) || '';
  const noindex = /noindex/i.test(robots);
  if (expectNoindex && !noindex) {
    fail(scope, 'robots', 'page privee sans noindex');
  }
  if (!expectNoindex && noindex) {
    fail(scope, 'robots', `noindex sur une page indexable du sitemap (${robots})`);
  }

  // 6. Meta keywords
  if (/name=["']keywords["']/i.test(html)) {
    fail(scope, 'keywords', 'meta keywords present (ignoree par Google)');
  }

  // 7. JSON-LD parsable
  const jsonLd = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  for (const [, raw] of jsonLd) {
    try {
      JSON.parse(raw.trim());
    } catch (err) {
      fail(scope, 'json-ld', `JSON invalide : ${err.message}`);
    }
  }

  // 8. Volume de texte visible
  if (!expectNoindex && visible < MIN_VISIBLE) {
    fail(scope, 'contenu', `${visible} caracteres visibles (< ${MIN_VISIBLE}) : page vide au rendu`);
  }

  const description = decode(
    matchOne(html, /<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) || ''
  );
  if (!description) fail(scope, 'description', 'absente');
  else if (description.length > 160) warn(scope, 'description', `${description.length} caracteres (> 160)`);

  if (title) {
    if (seenTitles.has(title)) fail(scope, 'title', `duplique avec ${seenTitles.get(title)}`);
    else seenTitles.set(title, scope);
  }
  if (description) {
    if (seenDescriptions.has(description)) warn(scope, 'description', `duplique avec ${seenDescriptions.get(description)}`);
    else seenDescriptions.set(description, scope);
  }

  return { scope, status: res.status, h1: h1Count, title, visible, jsonLd: jsonLd.length, robots: robots || 'index, follow' };
}

// ---------------------------------------------------------------------------
// Collecte des URL depuis l'API
// ---------------------------------------------------------------------------

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  return res.json();
}

async function collect() {
  const paths = [...STATIC_PATHS];
  const noteApiError = (what, err) => warn('collecte', 'api', `${what} indisponible : ${err.message}`);

  let categories = [];
  try {
    const data = await fetchJson(`${API}/categories`);
    categories = data?.categories || [];
  } catch (err) {
    noteApiError('categories', err);
  }

  let products = [];
  try {
    const data = await fetchJson(`${API}/products?page=1&limit=200&fields=slug,status`);
    products = data?.data || [];
  } catch (err) {
    noteApiError('produits', err);
  }

  let articles = [];
  try {
    const data = await fetchJson(`${API}/articles?limit=200&fields=slug`);
    articles = (data?.articles || data?.data || []).filter((a) => a.slug);
  } catch (err) {
    noteApiError('articles', err);
  }

  const categoryPaths = categories.map((c) => `/category/${c.slug}`);
  const productPaths = products
    .filter((p) => p.status !== 'discontinued')
    .slice(0, PRODUCT_LIMIT)
    .map((p) => `/products/${p.slug}`);
  const articlePaths = articles.map((a) => `/blog/${a.slug}`);

  return {
    paths: [...paths, ...categoryPaths, ...productPaths, ...articlePaths],
    privatePaths: PRIVATE_PATHS,
    products,
    counts: { categories: categories.length, products: products.length, articles: articles.length },
  };
}

/** Sondes : le statut HTTP est-il reellement correct ? */
async function checkStatuses(products) {
  const probes = [];

  probes.push({
    label: 'produit inexistant',
    pathname: '/products/zzz-produit-qui-nexiste-pas-000',
    expect: (status) => status === 404,
    detail: 'un 404 evite le soft 404',
  });
  probes.push({
    label: 'categorie inexistante',
    pathname: '/category/zzz-categorie-inexistante',
    expect: (status) => status === 404,
    detail: 'un 404 evite le soft 404',
  });
  probes.push({
    label: 'article inexistant',
    pathname: '/blog/zzz-article-inexistant',
    expect: (status) => status === 404,
    detail: 'un 404 evite le soft 404',
  });
  probes.push({
    label: 'guide de prix inexistant',
    pathname: '/prix/zzz-guide-inexistant',
    expect: (status) => status === 404,
    detail: 'un 404 evite le soft 404',
  });

  const sample = products.find((p) => p._id && p.slug);
  if (sample) {
    probes.push({
      label: 'produit par ObjectId',
      pathname: `/products/${sample._id}`,
      expect: (status) => status === 308 || status === 301,
      detail: 'redirection permanente vers le slug propre',
    });
  }

  const results = [];
  for (const probe of probes) {
    let status = 0;
    let location = null;
    try {
      const res = await fetch(`${BASE}${probe.pathname}`, { redirect: 'manual' });
      status = res.status;
      location = res.headers.get('location');
    } catch (err) {
      fail(probe.label, 'requete', err.message);
      continue;
    }
    const ok = probe.expect(status);
    if (!ok) {
      fail(probe.label, 'statut', `HTTP ${status} — ${probe.detail}`);
    }
    results.push({ ...probe, status, location, ok });
  }
  return results;
}

// ---------------------------------------------------------------------------

console.log(`Base auditee : ${BASE}`);
console.log('Collecte des URL depuis l\'API...');

const { paths, privatePaths, products, counts } = await collect();
console.log(
  `API : ${counts.categories} categories, ${counts.products} produits, ${counts.articles} articles`
);
console.log(
  `A auditer : ${STATIC_PATHS.length} pages statiques, ${paths.length - STATIC_PATHS.length} dynamiques, ` +
  `${privatePaths.length} privees, ${PRODUCT_LIMIT === Infinity ? 'tous' : PRODUCT_LIMIT} produits en echantillon\n`
);

console.log('Audit des pages indexables...');
const rows = await mapWithConcurrency(paths, CONCURRENCY, (p) => checkUrl(p));
const ok = rows.filter(Boolean).length;
console.log(`  ${ok}/${paths.length} pages conformes\n`);

console.log('Audit des pages privees (noindex attendu)...');
for (const p of privatePaths) {
  if (AUTH_GUARDED.has(p)) {
    // Redirection 307 vers /login attendue pour un visiteur non connecte.
    try {
      const res = await fetch(`${BASE}${p}`, { redirect: 'manual' });
      if (res.status === 307 || res.status === 302) {
        console.log(`  307  ${p} -> ${res.headers.get('location')} (garde d'authentification)`);
      } else {
        await checkUrl(p, { expectNoindex: true });
      }
    } catch (err) {
      fail(p, 'requete', err.message);
    }
  } else {
    await checkUrl(p, { expectNoindex: true });
  }
}

console.log('Sondes de statut HTTP...');
const probes = await checkStatuses(products);
for (const probe of probes) {
  console.log(
    `  ${probe.ok ? 'OK  ' : 'ECHEC'} ${probe.label.padEnd(26)} HTTP ${probe.status}` +
    (probe.location ? ` -> ${probe.location}` : '')
  );
}

// ---------------------------------------------------------------------------

const title = 'Controle SEO';
console.log(`\n${'='.repeat(72)}\n${title} — ${BASE}\n${'='.repeat(72)}`);

if (rows.some(Boolean)) {
  console.log('\nDetail des pages auditees :');
  for (const r of rows.filter(Boolean)) {
    console.log(
      `  ${r.status}  h1=${r.h1}  jsonld=${String(r.jsonLd).padStart(2)}  ` +
      `visible=${String(r.visible).padStart(7)}  ${r.title.slice(0, 46)}`
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
  console.log('\nControle SEO : ECHEC');
  process.exit(1);
}

console.log('\nControle SEO : OK');