/**
 * scripts/generate-sitemap.mjs
 *
 * Script de génération du sitemap statique dans /public.
 * Appelé automatiquement par le script "postbuild" de package.json.
 *
 * Utilisation :
 *   node scripts/generate-sitemap.mjs
 *   # ou via npm : "postbuild": "node scripts/generate-sitemap.mjs && react-snap"
 *
 * Variables d'environnement (dans .env) :
 *   VITE_API_URL=http://localhost:5000   (dev)
 *   VITE_API_URL=https://api.tekalis.com (prod)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Config ────────────────────────────────────────────────────────────────────
const SITE_URL = process.env.VITE_SITE_URL || "https://tekalis.com";
const API_BASE =
  process.env.VITE_API_URL?.replace(/\/api\/v1\/?$/, "") ||
  "http://localhost:5000";
const OUTPUT_PATH = path.resolve(__dirname, "../public/sitemap.xml");

// ── Pages statiques ───────────────────────────────────────────────────────────
const STATIC_PAGES = [
  { loc: "/",             changefreq: "daily",   priority: "1.0" },
  { loc: "/products",     changefreq: "daily",   priority: "0.9" },
  { loc: "/blog",         changefreq: "weekly",  priority: "0.8" },
  { loc: "/configurator", changefreq: "monthly", priority: "0.7" },
  { loc: "/apropos",      changefreq: "monthly", priority: "0.5" },
  { loc: "/contact",      changefreq: "monthly", priority: "0.5" },
];

// ── Catégories SEO ────────────────────────────────────────────────────────────
const CATEGORY_SLUGS = [
  "smartphones",
  "laptops",
  "gaming",
  "tv",
  "electromenager",
  "climatiseurs",
  "energie-solaire",
  "accessoires",
  "audio",
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const toDate = (d) =>
  (d ? new Date(d) : new Date()).toISOString().split("T")[0];

const xmlEscape = (str) =>
  String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const urlBlock = ({ loc, lastmod, changefreq, priority }) =>
  `  <url>\n` +
  `    <loc>${xmlEscape(SITE_URL + loc)}</loc>\n` +
  `    <lastmod>${lastmod || toDate()}</lastmod>\n` +
  `    <changefreq>${changefreq}</changefreq>\n` +
  `    <priority>${priority}</priority>\n` +
  `  </url>`;

// ── Fetch avec fallback silencieux ────────────────────────────────────────────
async function fetchJSON(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`  ⚠️  Impossible de joindre ${url} : ${err.message}`);
    return null;
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function generate() {
  console.log("\n🗺️  Génération du sitemap Tekalis...");
  console.log(`   API : ${API_BASE}`);
  console.log(`   Sortie : ${OUTPUT_PATH}\n`);

  const today = toDate();
  const urls = [];

  // 1. Pages statiques
  for (const page of STATIC_PAGES) {
    urls.push(urlBlock({ ...page, lastmod: today }));
  }
  console.log(`  ✅ ${STATIC_PAGES.length} pages statiques`);

  // 2. Catégories
  for (const slug of CATEGORY_SLUGS) {
    urls.push(
      urlBlock({
        loc: `/category/${slug}`,
        lastmod: today,
        changefreq: "daily",
        priority: "0.9",
      })
    );
  }
  console.log(`  ✅ ${CATEGORY_SLUGS.length} catégories`);

  // 3. Produits — via le endpoint dédié
  const productsData = await fetchJSON(`${API_BASE}/api/v1/sitemap.xml`);
  // Si le backend expose /api/v1/sitemap-products (JSON), on l'utilise
  const productsFallback = await fetchJSON(
    `${API_BASE}/api/v1/products?limit=9999&fields=_id,slug,updatedAt`
  );

  const products =
    (productsFallback?.products ||
      productsFallback?.data ||
      (Array.isArray(productsFallback) ? productsFallback : null)) ?? [];

  for (const p of products) {
    const loc = p.slug ? `/produit/${p.slug}` : `/products/${p._id}`;
    urls.push(
      urlBlock({
        loc,
        lastmod: toDate(p.updatedAt || p.createdAt),
        changefreq: "weekly",
        priority: "0.8",
      })
    );
  }
  console.log(`  ✅ ${products.length} produits`);

  // 4. Articles de blog
  const articlesData = await fetchJSON(
    `${API_BASE}/api/v1/articles?limit=9999&fields=slug,updatedAt`
  );
  const articles =
    articlesData?.articles ||
    articlesData?.data ||
    (Array.isArray(articlesData) ? articlesData : []);

  for (const a of articles) {
    if (!a.slug) continue;
    urls.push(
      urlBlock({
        loc: `/blog/${a.slug}`,
        lastmod: toDate(a.updatedAt || a.createdAt),
        changefreq: "monthly",
        priority: "0.6",
      })
    );
  }
  console.log(`  ✅ ${articles.length} articles de blog`);

  // ── Écriture du fichier ───────────────────────────────────────────────────
  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<!-- Généré le ${new Date().toISOString()} — ${urls.length} URLs -->\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.join("\n") +
    `\n</urlset>\n`;

  fs.writeFileSync(OUTPUT_PATH, xml, "utf8");

  console.log(`\n  🎉 sitemap.xml généré : ${urls.length} URLs`);
  console.log(`     ${OUTPUT_PATH}\n`);
}

generate().catch((err) => {
  console.error("Erreur fatale :", err);
  process.exit(1);
});
