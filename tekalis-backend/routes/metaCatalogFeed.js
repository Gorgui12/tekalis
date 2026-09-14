/**
 * routes/metaCatalogFeed.js
 *
 * GET /api/v1/meta/catalog.xml — Feed XML Catalog Dynamique Meta
 *
 * Format : RSS/Atom conforme à Meta Commerce Manager.
 * Champ clé : <g:product_type> = chemin hiérarchique de la catégorie
 * (ex. "Electronique > Laptops"), utilisé pour créer des Product Sets
 * et cibler des catégories dans Ads Manager (objectif Catalog Sales).
 *
 * À monter dans server.js AVANT le rate-limiter (comme le sitemap) :
 *   app.use(API_PREFIX, require("./routes/metaCatalogFeed"));
 */

const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const Category = require("../models/Category");

const SITE_URL = process.env.SITE_URL || "https://tekalis.com";
const CURRENCY = "XOF";

// Statuts Tekalis → disponibilité Meta
const META_AVAILABILITY = {
  available: "in stock",
  preorder: "preorder",
  outofstock: "out of stock",
  discontinued: "out of stock",
};

const xmlEscape = (str) =>
  String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

// Construit le chemin catégorie hiérarchique "Racine > Parent > Enfant"
async function buildCategoryPath(categoryId) {
  const names = [];
  let currentId = categoryId;

  while (currentId) {
    const cat = await Category.findById(currentId).select("name parent").lean();
    if (!cat) break;
    names.unshift(cat.name);
    currentId = cat.parent;
  }

  return names;
}

const itemBlock = (p, categoryPath) => {
  const title = xmlEscape(p.name);
  const desc = xmlEscape(
    (p.metaDescription || p.description || "").slice(0, 5000)
  );
  const link = `${SITE_URL}/products/${p.slug || p._id}`;
  const primaryImage =
    (p.images?.find((img) => img.isPrimary)?.url || p.images?.[0]?.url) || "";
  const price = Number(p.price) || 0;
  const comparePrice = Number(p.comparePrice) || 0;
  const availability = META_AVAILABILITY[p.status] || "in stock";
  const condition = xmlEscape(p.condition || "new");
  const brand = xmlEscape(p.brand || "Tekalis");
  const gtin = p.gtin ? `<g:gtin>${xmlEscape(p.gtin)}</g:gtin>` : "";
  const mpn = p.mpn ? `<g:mpn>${xmlEscape(p.mpn)}</g:mpn>` : "";
  const salePrice =
    comparePrice > price
      ? `<g:sale_price>${comparePrice} ${CURRENCY}</g:sale_price>`
      : "";
  const productType = categoryPath.length
    ? `<g:product_type>${xmlEscape(categoryPath.join(" > "))}</g:product_type>`
    : "";

  return `<item>
    <g:id>${xmlEscape(p._id)}</g:id>
    <g:title>${title}</g:title>
    <g:description>${desc}</g:description>
    <g:link>${xmlEscape(link)}</g:link>
    <g:image_link>${xmlEscape(primaryImage)}</g:image_link>
    <g:availability>${availability}</g:availability>
    <g:price>${price} ${CURRENCY}</g:price>
    ${salePrice}
    <g:condition>${condition}</g:condition>
    <g:brand>${brand}</g:brand>
    ${productType}
    ${gtin}
    ${mpn}
    <g:channel>online</g:channel>
  </item>`;
};

router.get("/meta/catalog.xml", async (req, res) => {
  try {
    const products = await Product.find(
      { status: { $ne: "discontinued" } }
    )
      .populate("category", "name")
      .lean();

    const items = [];
    const pathCache = new Map();

    for (const p of products) {
      if (!p.images?.length) continue;

      const category = p.category?.[0];
      const cacheKey = String(category?._id || "none");
      if (!pathCache.has(cacheKey)) {
        pathCache.set(cacheKey, await buildCategoryPath(category?._id));
      }

      items.push(itemBlock(p, pathCache.get(cacheKey)));
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Tekalis — Catalogue Meta</title>
    <link>${SITE_URL}</link>
    <description>Boutique électronique et high-tech au Sénégal — Dakar</description>
${items.join("\n")}
  </channel>
</rss>`;

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600, stale-while-revalidate=1800");
    res.status(200).send(xml);
  } catch (err) {
    console.error("❌ Erreur génération feed Meta Catalog:", err);
    res.status(500).json({ message: "Erreur génération feed" });
  }
});

module.exports = router;