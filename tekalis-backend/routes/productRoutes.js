const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const Category = require("../models/Category");

// ══════════════════════════════════════════════════════════════
// Utilitaire : résoudre les catégories (string → ObjectId)
// Crée la catégorie si elle n'existe pas encore
// ══════════════════════════════════════════════════════════════
const resolveCategoryIds = async (categoryInput) => {
  if (!categoryInput || categoryInput.length === 0) return [];

  const resolvedIds = [];

  for (const cat of categoryInput) {
    if (/^[a-f\d]{24}$/i.test(String(cat))) {
      resolvedIds.push(cat);
      continue;
    }

    let found = await Category.findOne({
      name: { $regex: new RegExp(`^${cat.trim()}$`, "i") }
    });

    if (!found) {
      found = await Category.create({
        name: cat.trim(),
        slug: cat.trim().toLowerCase().replace(/\s+/g, "-"),
      });
      console.log(`✅ Catégorie créée automatiquement : ${cat}`);
    }

    resolvedIds.push(found._id);
  }

  return resolvedIds;
};

// ══════════════════════════════════════════════════════════════
// POST /api/v1/products — Créer un produit
// ══════════════════════════════════════════════════════════════
router.post("/", async (req, res) => {
  try {
    const data = req.body;

    const categoryIds = await resolveCategoryIds(data.category || []);
    const images = (data.images || []).filter(img => img.url && img.url.trim() !== "");

    const productData = {
      ...data,
      category: categoryIds,
      images: images.length > 0 ? images : [],
      price: Number(data.price) || 0,
      comparePrice: data.comparePrice ? Number(data.comparePrice) : undefined,
      stock: Number(data.stock) || 0,
    };

    if (!productData.slug && productData.name) {
      productData.slug = productData.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
    }

    const product = await Product.create(productData);

    return res.status(201).json({
      success: true,
      data: product,
      message: "Produit créé avec succès",
    });

  } catch (error) {
    console.error("❌ Erreur création produit:", error);

    if (error.code === 11000 && error.keyPattern?.slug) {
      return res.status(409).json({
        success: false,
        message: `Un produit avec ce slug existe déjà : ${error.keyValue?.slug}`,
      });
    }

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: "Données invalides",
        details: messages,
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Erreur serveur",
    });
  }
});

// ══════════════════════════════════════════════════════════════
// POST /api/v1/products/bulk — Import en masse
// ⚠️  Doit être AVANT la route /:id pour éviter la confusion
// ══════════════════════════════════════════════════════════════
router.post("/bulk", async (req, res) => {
  try {
    const { products } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ success: false, message: "Aucun produit fourni" });
    }

    const results = { success: [], failed: [] };

    for (const data of products) {
      try {
        const categoryIds = await resolveCategoryIds(data.category || []);
        const images = (data.images || []).filter(img => img.url?.trim());

        const productData = {
          ...data,
          category: categoryIds,
          images,
          price: Number(data.price) || 0,
          stock: Number(data.stock) || 0,
        };

        if (!productData.slug && productData.name) {
          productData.slug = productData.name
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .trim();
        }

        const product = await Product.create(productData);
        results.success.push({ name: product.name, id: product._id });

      } catch (err) {
        results.failed.push({
          name: data.name || "?",
          error: err.code === 11000 ? "Slug dupliqué" : err.message,
        });
      }
    }

    return res.status(207).json({
      success: true,
      summary: {
        total: products.length,
        imported: results.success.length,
        failed: results.failed.length,
      },
      results,
    });

  } catch (error) {
    console.error("❌ Erreur bulk import:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ══════════════════════════════════════════════════════════════
// GET /api/v1/products — Liste avec filtres, tri, pagination
// ══════════════════════════════════════════════════════════════
router.get("/", async (req, res) => {
  try {
    const {
      sort = "newest",
      page = 1,
      limit = 20,
      search,
      category,
      brand,
      status,
      minPrice,
      maxPrice,
      featured,
    } = req.query;

    // ── Filtres ───────────────────────────────────────────────
    const filter = {};

    if (search) {
      filter.$or = [
        { name:        { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { brand:       { $regex: search, $options: "i" } },
      ];
    }
    if (category)          filter.category  = category;
    if (brand)             filter.brand     = { $regex: new RegExp(brand, "i") };
    if (status)            filter.status    = status;
    if (featured === "true") filter.isFeatured = true;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // ── Tri ───────────────────────────────────────────────────
    const sortMap = {
      newest:     { createdAt: -1 },
      oldest:     { createdAt:  1 },
      price_asc:  { price:      1 },
      price_desc: { price:     -1 },
      rating:     { "rating.average": -1 },
      bestseller: { salesCount: -1 },
      name_asc:   { name:       1 },
      name_desc:  { name:      -1 },
    };
    const sortQuery = sortMap[sort] || sortMap.newest;

    // ── Pagination ────────────────────────────────────────────
    const pageNum  = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip     = (pageNum - 1) * limitNum;

    // ── Requête ───────────────────────────────────────────────
    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(sortQuery)
        .skip(skip)
        .limit(limitNum)
        .populate("category", "name slug")
        .lean(),
      Product.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: products,
      pagination: {
        total,
        page:       pageNum,
        limit:      limitNum,
        totalPages: Math.ceil(total / limitNum),
        hasNext:    pageNum < Math.ceil(total / limitNum),
        hasPrev:    pageNum > 1,
      },
    });

  } catch (error) {
    console.error("❌ Erreur récupération produits:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ══════════════════════════════════════════════════════════════
// GET /api/v1/products/:id — Détail d'un produit (id ou slug)
// ══════════════════════════════════════════════════════════════
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Accepte un ObjectId OU un slug
    const query = /^[a-f\d]{24}$/i.test(id) ? { _id: id } : { slug: id };

    const product = await Product.findOne(query)
      .populate("category", "name slug")
      .lean();

    if (!product) {
      return res.status(404).json({ success: false, message: "Produit introuvable" });
    }

    // Incrémenter vues de façon non bloquante
    Product.findByIdAndUpdate(product._id, { $inc: { viewCount: 1 } }).exec();

    return res.status(200).json({ success: true, data: product });

  } catch (error) {
    console.error("❌ Erreur récupération produit:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ══════════════════════════════════════════════════════════════
// PUT /api/v1/products/:id — Mettre à jour un produit
// ══════════════════════════════════════════════════════════════
router.put("/:id", async (req, res) => {
  try {
    const data = req.body;
    const categoryIds = await resolveCategoryIds(data.category || []);
    const images = (data.images || []).filter(img => img.url?.trim());

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { ...data, category: categoryIds, images },
      { new: true, runValidators: true }
    ).populate("category", "name slug");

    if (!updated) {
      return res.status(404).json({ success: false, message: "Produit introuvable" });
    }

    return res.status(200).json({
      success: true,
      data: updated,
      message: "Produit mis à jour avec succès",
    });

  } catch (error) {
    console.error("❌ Erreur mise à jour produit:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: "Données invalides", details: messages });
    }

    return res.status(500).json({ success: false, message: error.message });
  }
});

// ══════════════════════════════════════════════════════════════
// DELETE /api/v1/products/:id — Supprimer un produit
// ══════════════════════════════════════════════════════════════
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Produit introuvable" });
    }

    return res.status(200).json({
      success: true,
      message: "Produit supprimé avec succès",
    });

  } catch (error) {
    console.error("❌ Erreur suppression produit:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;