const Product = require("../models/Product"); // ← Import manquant corrigé

const configuratorService = {
  /**
   * Recommander des produits selon budget et usage
   * @param {Object} filters - { budget, usage, preferences }
   */
  async recommendProducts(filters) {
    const { budget, usage, preferences } = filters;

    // ─── Fourchettes de prix ───────────────────────────────────────────────────
    let priceRange = {};
    if (budget === "0-800") {
      priceRange = { $gte: 0, $lte: 800000 };
    } else if (budget === "800-1200") {
      priceRange = { $gte: 800000, $lte: 1200000 };
    } else if (budget === "1200+") {
      priceRange = { $gte: 1200000 };
    } else if (typeof budget === "object" && budget.min !== undefined) {
      // Support format { min, max }
      priceRange = {};
      if (budget.min !== undefined) priceRange.$gte = Number(budget.min);
      if (budget.max !== undefined) priceRange.$lte = Number(budget.max);
    }

    // ─── Critères selon l'usage ────────────────────────────────────────────────
    let specs = {};
    switch (usage) {
      case "gaming":
        specs = {
          "specs.graphics": { $exists: true, $ne: null },
          "specs.ram": { $in: ["16GB", "32GB", "64GB"] }
        };
        break;
      case "creation":
        specs = {
          "specs.ram": { $in: ["16GB", "32GB", "64GB"] }
        };
        break;
      case "bureautique":
        specs = {
          "specs.ram": { $in: ["8GB", "16GB"] }
        };
        break;
      case "etudiant":
        specs = {
          "specs.ram": { $in: ["8GB", "16GB"] }
        };
        break;
      default:
        break;
    }

    // ─── Construction de la requête ────────────────────────────────────────────
    const query = {
      stock: { $gt: 0 },
      status: "available",
      ...specs
    };

    if (Object.keys(priceRange).length > 0) {
      query.price = priceRange;
    }

    // Préférences de marque
    if (preferences?.brand && preferences.brand.length > 0) {
      query.brand = { $in: preferences.brand };
    }

    // Préférences processeur
    if (preferences?.processor) {
      query["specs.processorBrand"] = preferences.processor;
    }

    // Préférences RAM
    if (preferences?.ram) {
      query["specs.ram"] = preferences.ram;
    }

    const products = await Product.find(query)
      .sort({ "rating.average": -1, salesCount: -1 })
      .limit(12)
      .populate("category", "name")
      .lean();

    // ─── Classer les produits ──────────────────────────────────────────────────
    const excellent = products.filter(p => (p.rating?.average || 0) >= 4.5).slice(0, 4);
    const good = products
      .filter(p => (p.rating?.average || 0) >= 4 && (p.rating?.average || 0) < 4.5)
      .slice(0, 4);
    const budgetChoice = [...products]
      .sort((a, b) => a.price - b.price)
      .slice(0, 4);

    return {
      excellent,
      good,
      budget: budgetChoice,
      total: products.length
    };
  }
};

module.exports = configuratorService;
