/**
 * routes/productFeed.js
 *
 * GET /api/v1/merchant/products.xml — Feed XML Google Merchant Center
 *
 * Format : Google Shopping XML (https://support.google.com/merchants/answer/160589)
 * Champ d'usage : catalalogué dans Google Merchant > Flux de produits.
 *
 * À monter dans server.js AVANT le rate-limiter (comme le sitemap) :
 *   app.use(API_PREFIX, require("./routes/productFeed"));
 */

const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const Category = require("../models/Category");

const SITE_URL = process.env.SITE_URL || "https://tekalis.com";
const CURRENCY = "XOF";

// Statuts Tekalis → disponibilité Google Shopping
const GOOGLE_AVAILABILITY = {
  available: "in_stock",
  preorder: "preorder",
  outofstock: "out_of_stock",
  discontinued: "out_of_stock",
};

const xmlEscape = (str) =>
  String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

// Champs obligatoires conditionnels : seul <g:mpn> (ou <g:gtin>) est requis
// avec <g:brand>. Google exige identifier_exists=false si ni gtin ni mpn.
const itemBlock = (p) => {
  const title = xmlEscape(p.name);
  const desc = xmlEscape(
    (p.metaDescription || p.description || "").slice(0, 5000)
  );
  const link = `${SITE_URL}/products/${p.slug || p._id}`;
  const primaryImage =
    (p.images?.find((img) => img.isPrimary)?.url || p.images?.[0]?.url) || "";
  const price = Number(p.price) || 0;
  const comparePrice = Number(p.comparePrice) || 0;
  const availability = GOOGLE_AVAILABILITY[p.status] || "in_stock";
  const brand = xmlEscape(p.brand || "Tekalis");
  const gtin = p.gtin ? `<g:gtin>${xmlEscape(p.gtin)}</g:gtin>` : "";
  const mpn = p.mpn ? `<g:mpn>${xmlEscape(p.mpn)}</g:mpn>` : "";
  const identifierExists = gtin || mpn ? "" : "<g:identifier_exists>false</g:identifier_exists>";
  const weight = p.weight > 0 ? `<g:shipping_weight>${p.weight} kg</g:shipping_weight>` : "";
  const salePrice = comparePrice > price
    ? `<g:sale_price>${comparePrice} ${CURRENCY}</g:sale_price>
     <g:sale_price_effective_date>${new Date().toISOString().split("T")[0]}T00:00:00+00:00/${new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0]}T23:59:59+00:00</g:sale_price_effective_date>`
    : "";
  const category = p.category?.name
    ? `<g:google_product_category><![CDATA[${p.category.name}]]></g:google_product_category>`
    : "";

  return `<item>
    <g:id>${xmlEscape(p._id)}</g:id>
    <g:title>${title}</g:title>
    <g:description>${desc}</g:description>
    <g:link>${xmlEscape(link)}</g:link>
    <g:image_link>${xmlEscape(primaryImage)}</g:image_link>
    <g:price>${price} ${CURRENCY}</g:price>
    ${salePrice}
    <g:availability>${availability}</g:availability>
    <g:condition>${xmlEscape(p.condition || "new")}</g:condition>
    <g:brand>${brand}</g:brand>
    ${gtin}
    ${mpn}
    ${identifierExists}
    ${category}
    ${weight}
    <g:country>SN</g:country>
    <g:channel>online</g:channel>
  </item>`;
};

router.get("/merchant/products.xml", async (req, res) => {
  try {
    const products = await Product.find(
      { status: { $ne: "discontinued" } }
    )
      .populate("category", "name")
      .lean();

    const items = products.filter((p) => p.images?.length).map(itemBlock);

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Tekalis — Catalogue produits</title>
    <link>${SITE_URL}</link>
    <description>Boutique électronique et high-tech au Sénégal — Dakar</description>
${items.join("\n")}
  </channel>
</rss>`;

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600, stale-while-revalidate=1800");
    res.status(200).send(xml);
  } catch (err) {
    console.error("❌ Erreur génération feed Merchant:", err);
    res.status(500).json({ message: "Erreur génération feed" });
  }
});

module.exports = router;