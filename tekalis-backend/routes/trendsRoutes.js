// ============================================================
// routes/trendsRoutes.js — Tendances de recherche Google
//
//  GET /api/v1/trends/suggestions   (publique) — suggestions en cache
//  GET /api/v1/trends/refresh       (admin)    — relance le fetch Google
//  GET /api/v1/trends/stats         (admin)    — KPIs de couverture
//  POST /api/v1/trends/seed         (admin)    — ajoute une seed de recherche
//
// Le cache est stocké dans models/Trend.js (TTL 90 jours). Un
// auto-refresh en arrière-plan relance le fetch toutes les ~12h si
// le données sont périmées (compatible hébergement free sans cron).
// ============================================================
const express = require("express");
const router = express.Router();

const Trend = require("../models/Trend");
const Product = require("../models/Product");
const { verifyToken, isAdmin } = require("../middlewares/authMiddleware");
const { escapeRegex } = require("../utils/regexEscape");
const googleAutocomplete = require("../services/googleAutocomplete");

// ── Guides de prix connus (miroir de lib/utils/prixGuides.js côté frontend) ──
const KNOWN_GUIDES = [
  { slug: "iphone-12-prix-dakar", keywords: ["iphone 12"] },
  { slug: "iphone-13-prix-dakar", keywords: ["iphone 13"] },
  { slug: "samsung-galaxy-s24-ultra-prix-fcfa", keywords: ["s24 ultra", "samsung s24"] },
  { slug: "samsung-galaxy-a25-prix-fcfa", keywords: ["galaxy a25", "samsung a25", "samsung a 25"] },
  { slug: "samsung-galaxy-s23-fe-prix-senegal", keywords: ["s23 fe", "galaxy s23 fe"] },
  { slug: "samsung-galaxy-a55-prix-fcfa", keywords: ["galaxy a55", "samsung a55"] },
  { slug: "samsung-moins-de-30000-fcfa", keywords: ["30000", "30 000"] },
];

// ── Mots vides (normalisés, sans accents) pour l'extraction de mots-clés ─────
const STOPWORDS = new Set([
  "le", "la", "les", "des", "du", "de", "un", "une", "dans", "pour",
  "a", "au", "aux", "en", "et", "ou", "qui", "est", "sont", "avec",
  "prix", "combien", "coute", "vaut", "dakar", "senegal", "fcfa",
  "pas", "cher", "neuf", "acheter", "marche", "meilleur", "bon",
  "telephone", "smartphone", "samsung", "iphone",
  "quel", "indiquer", "veuillez", "lequel",
]);

const normalize = (s) =>
  String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

// ── Groupe d'affichage dérivé de la seed d'origine ───────────────────────────
function groupOf(seed) {
  const s = normalize(seed);
  if (s.includes("iphone")) return "iPhone";
  if (s.includes("samsung")) return "Samsung";
  if (s.includes("ecouteur") || s.includes("coque") || s.includes("accessoire")) return "Accessoires";
  if (s.includes("telephone") || s.includes("smartphone")) return "Téléphones";
  return "Téléphones";
}

// ── Extraction des mots-clés significatifs d'une suggestion ──────────────────
function extractKeywords(query) {
  const words = normalize(query)
    .split(/[^a-z0-9]+/)
    .filter((w) => w && !STOPWORDS.has(w));
  return words.slice(0, 3);
}

// ── Correspondance guide de prix ─────────────────────────────────────────────
function matchGuide(query) {
  const q = normalize(query);
  for (const guide of KNOWN_GUIDES) {
    if (guide.keywords.some((k) => q.includes(k))) return guide.slug;
  }
  return null;
}

// ── Correspondance produit catalogue (1 ou 2 mots-clés) ──────────────────────
async function matchProduct(query) {
  const keywords = extractKeywords(query);
  if (keywords.length === 0) return null;

  const attempts = [];
  if (keywords.length >= 2) attempts.push(keywords.slice(0, 2).join(" "));
  attempts.push(keywords[0]);

  for (const term of attempts) {
    try {
      const safe = escapeRegex(term);
      const product = await Product.findOne({
        $or: [
          { name: { $regex: safe, $options: "i" } },
          { brand: { $regex: safe, $options: "i" } },
        ],
        status: { $ne: "discontinued" },
      })
        .select("slug name _id")
        .lean();
      if (product) return { slug: product.slug || product._id, name: product.name };
    } catch {
      // on tente la combinaison suivante
    }
  }
  return null;
}

// ── Cross-référence guides + produits sur toutes les tendances ───────────────
async function crossReferenceAll() {
  let covered = 0;
  const trends = await Trend.find({ isSeed: { $ne: true } });
  for (const t of trends) {
    const guideSlug = matchGuide(t.query);
    const productMatch = await matchProduct(t.query);
    const hasCover = Boolean(guideSlug || productMatch);
    if (hasCover) covered++;
    await Trend.updateOne(
      { _id: t._id },
      {
        $set: {
          hasGuide: Boolean(guideSlug),
          guideSlug: guideSlug || null,
          hasProduct: Boolean(productMatch),
          productSlug: productMatch?.slug || null,
          hasCover,
        },
      }
    );
  }
  return covered;
}

// ── Upsert les suggestions récupérées ────────────────────────────────────────
async function upsertSuggestions(results) {
  let created = 0;
  for (const r of results) {
    const res = await Trend.updateOne(
      { query: r.query },
      {
        $setOnInsert: { firstSeen: new Date(), detectionCount: 1, seed: r.seed },
        $set: { lastSeen: new Date(), seed: r.seed, hasCover: false },
        $inc: { detectionCount: 1 },
      },
      { upsert: true }
    );
    if (res.upsertedCount > 0) created++;
  }
  return created;
}

// ── Auto-refresh si les données ont plus de 12h ──────────────────────────────
let refreshing = false;
async function autoRefreshIfStale() {
  if (refreshing) return;
  try {
    const latest = await Trend.findOne({ isSeed: { $ne: true } })
      .sort({ lastSeen: -1 })
      .select("lastSeen")
      .lean();
    const stale = !latest || Date.now() - new Date(latest.lastSeen).getTime() > 12 * 60 * 60 * 1000;
    if (!stale) return;

    refreshing = true;
    console.log("[Trends] Auto-refresh — données périmées (> 12h)");
    const seeds = await googleAutocomplete.getActiveSeeds(Trend);
    const { results } = await googleAutocomplete.fetchAllTrends(seeds);
    await upsertSuggestions(results);
    const covered = await crossReferenceAll();
    console.log(`[Trends] Auto-refresh terminé : ${results.length} suggestions, ${covered} couvertes`);
  } catch (err) {
    console.error("[Trends] Auto-refresh échoué:", err.message);
  } finally {
    refreshing = false;
  }
}

// ═════════════════════════════════════════════════════════════════════
// GET /suggestions — publique
// ═════════════════════════════════════════════════════════════════════
router.get("/suggestions", async (req, res) => {
  try {
    const { new: onlyNew = "0", limit = 100, q } = req.query;

    // Déclenche un refresh en arrière-plan si les données sont périmées
    autoRefreshIfStale().catch(() => {});

    const filter = { isSeed: { $ne: true } };
    if (onlyNew === "1") {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      filter.firstSeen = { $gte: sevenDaysAgo };
    }
    if (q) filter.query = { $regex: escapeRegex(q), $options: "i" };

    const items = await Trend.find(filter)
      .sort({ lastSeen: -1 })
      .limit(Math.min(200, Number(limit) || 100))
      .lean();

    const suggestions = items.map((t) => ({
      query: t.query,
      seed: t.seed,
      group: groupOf(t.seed),
      firstSeen: t.firstSeen,
      lastSeen: t.lastSeen,
      detectionCount: t.detectionCount,
      isNew: Date.now() - new Date(t.firstSeen).getTime() < 7 * 24 * 60 * 60 * 1000,
      hasGuide: Boolean(t.hasGuide),
      guideSlug: t.guideSlug || null,
      hasProduct: Boolean(t.hasProduct),
      productSlug: t.productSlug || null,
      hasCover: Boolean(t.hasCover || t.hasGuide || t.hasProduct),
    }));

    res.json({ success: true, suggestions, total: suggestions.length, generatedAt: new Date() });
  } catch (error) {
    console.error("[Trends] /suggestions:", error.message);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// ═════════════════════════════════════════════════════════════════════
// GET /stats — admin
// ═════════════════════════════════════════════════════════════════════
router.get("/stats", verifyToken, isAdmin, async (req, res) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const baseFilter = { isSeed: { $ne: true } };

    const [total, recentAgg, coveredAgg, byGroupAgg] = await Promise.all([
      Trend.countDocuments(baseFilter),
      Trend.aggregate([
        { $match: { ...baseFilter, firstSeen: { $gte: sevenDaysAgo } } },
        { $count: "n" },
      ]),
      Trend.aggregate([
        { $match: { ...baseFilter, hasCover: true } },
        { $count: "n" },
      ]),
      Trend.aggregate([
        { $match: baseFilter },
        { $project: { group: { $literal: "Téléphones" } } },
        { $group: { _id: "$group", count: { $sum: 1 } } },
      ]),
    ]);

    const recent = recentAgg.length ? recentAgg[0].n : 0;
    const covered = coveredAgg.length ? coveredAgg[0].n : 0;

    res.json({
      success: true,
      stats: {
        total,
        recent,
        covered,
        uncovered: total - covered,
        coverageRate: total > 0 ? Math.round((covered / total) * 100) : 0,
        byGroup: byGroupAgg,
      },
      generatedAt: new Date(),
    });
  } catch (error) {
    console.error("[Trends] /stats:", error.message);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// ═════════════════════════════════════════════════════════════════════
// GET /refresh — admin : relance manuelle
// ═════════════════════════════════════════════════════════════════════
router.get("/refresh", verifyToken, isAdmin, async (req, res) => {
  try {
    const seeds = await googleAutocomplete.getActiveSeeds(Trend);
    const { results, errors, total } = await googleAutocomplete.fetchAllTrends(seeds);
    const created = await upsertSuggestions(results);
    const covered = await crossReferenceAll();

    res.json({
      success: true,
      summary: { total, created, covered, errors, generatedAt: new Date() },
    });
  } catch (error) {
    console.error("[Trends] /refresh:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ═════════════════════════════════════════════════════════════════════
// POST /seed — admin : ajoute une seed de recherche
// ═════════════════════════════════════════════════════════════════════
router.post("/seed", verifyToken, isAdmin, async (req, res) => {
  try {
    const query = String(req.body?.query || "").trim().toLowerCase();
    if (!query) {
      return res.status(400).json({ success: false, message: "La seed est requise" });
    }

    await Trend.updateOne(
      { query },
      { $set: { query, isSeed: true, lastSeen: new Date() }, $setOnInsert: { firstSeen: new Date() } },
      { upsert: true }
    );

    res.json({ success: true, message: `Seed ajoutée : ${query}` });
  } catch (error) {
    console.error("[Trends] /seed:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;