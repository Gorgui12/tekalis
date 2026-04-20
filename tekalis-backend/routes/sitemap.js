/**
 * routes/sitemap.js
 *
 * Route Express qui génère un sitemap XML dynamique.
 * À monter dans app.js AVANT les autres routes :
 *   const sitemapRouter = require('./routes/sitemap');
 *   app.use('/api/v1', sitemapRouter);
 *
 * Endpoint exposé : GET /api/v1/sitemap.xml
 */

const express = require("express");
const router = express.Router();
const Product = require("../models/Product");   // adapter si ton modèle est ailleurs
const Article = require("../models/Article");   // idem

const SITE_URL = process.env.SITE_URL || "https://tekalis.com";

// ── Pages statiques ──────────────────────────────────────────────────────────
const STATIC_PAGES = [
  { loc: "/",              changefreq: "daily",   priority: "1.0" },
  { loc: "/products",      changefreq: "daily",   priority: "0.9" },
  { loc: "/blog",          changefreq: "weekly",  priority: "0.8" },
  { loc: "/configurator",  changefreq: "monthly", priority: "0.7" },
  { loc: "/apropos",       changefreq: "monthly", priority: "0.5" },
  { loc: "/contact",       changefreq: "monthly", priority: "0.5" },
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

// ── Helper : formater une date en YYYY-MM-DD ──────────────────────────────────
const toDate = (d) =>
  (d ? new Date(d) : new Date()).toISOString().split("T")[0];

// ── Helper : échapper les caractères XML spéciaux ────────────────────────────
const xmlEscape = (str) =>
  String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

// ── Construire un bloc <url> ──────────────────────────────────────────────────
const urlBlock = ({ loc, lastmod, changefreq, priority }) => `
  <url>
    <loc>${xmlEscape(SITE_URL + loc)}</loc>
    <lastmod>${lastmod || toDate()}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;

// ── GET /api/v1/sitemap.xml ───────────────────────────────────────────────────
router.get("/sitemap.xml", async (req, res) => {
  try {
    // 1. Produits publiés
    const products = await Product.find(
      { stock: { $gt: 0 } },
      { _id: 1, slug: 1, updatedAt: 1, createdAt: 1 }
    ).lean();

    // 2. Articles publiés
    const articles = await Article.find(
      { stock: { $gt: 0 } },
      { slug: 1, updatedAt: 1, createdAt: 1 }
    ).lean();

    // ── Construction du XML ───────────────────────────────────────────────
    const urls = [
      // Pages statiques
      ...STATIC_PAGES.map(urlBlock),

      // Catégories
      ...CATEGORY_SLUGS.map((slug) =>
        urlBlock({
          loc: `/category/${slug}`,
          changefreq: "daily",
          priority: "0.9",
        })
      ),

      // Produits individuels
      ...products.map((p) => {
        // Préférer le slug SEO-friendly si disponible, sinon l'_id
        const path = p.slug ? `/produit/${p.slug}` : `/products/${p._id}`;
        return urlBlock({
          loc: path,
          lastmod: toDate(p.updatedAt || p.createdAt),
          changefreq: "weekly",
          priority: "0.8",
        });
      }),

      // Articles de blog
      ...articles.map((a) =>
        urlBlock({
          loc: `/blog/${a.slug}`,
          lastmod: toDate(a.updatedAt || a.createdAt),
          changefreq: "monthly",
          priority: "0.6",
        })
      ),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("")}
</urlset>`;

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    // Cache 1 heure côté CDN/proxy, revalidation après 30 min
    res.setHeader("Cache-Control", "public, max-age=3600, stale-while-revalidate=1800");
    res.status(200).send(xml);
  } catch (err) {
    console.error("Sitemap generation error:", err);
    res.status(500).json({ message: "Erreur génération sitemap" });
  }
});

module.exports = router;