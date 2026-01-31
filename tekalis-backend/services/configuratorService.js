// ===============================================
// 10. SERVICE - configuratorService.js
// Logique du configurateur PC
// ===============================================
const configuratorService = {
  // Recommander des produits selon budget et usage
  async recommendProducts(filters) {
    const { budget, usage, preferences } = filters;
    
    // Budget ranges
    let priceRange = {};
    if (budget === "0-800") {
      priceRange = { $gte: 0, $lte: 800000 };
    } else if (budget === "800-1200") {
      priceRange = { $gte: 800000, $lte: 1200000 };
    } else if (budget === "1200+") {
      priceRange = { $gte: 1200000 };
    }
    
    // Critères selon l'usage
    let specs = {};
    switch (usage) {
      case "gaming":
        specs = {
          "specs.processorBrand": { $in: ["Intel", "AMD"] },
          "specs.graphics": { $exists: true },
          "specs.ram": { $in: ["16GB", "32GB", "64GB"] }
        };
        break;
      case "creation":
        specs = {
          "specs.processorBrand": { $in: ["Intel", "AMD", "Apple"] },
          "specs.ram": { $in: ["16GB", "32GB", "64GB"] },
          "specs.screen": { $regex: /1[5-7]/ }
        };
        break;
      case "bureautique":
        specs = {
          "specs.ram": { $in: ["8GB", "16GB"] },
          "specs.storageType": { $in: ["SSD", "NVMe"] }
        };
        break;
      case "etudiant":
        specs = {
          "specs.ram": { $in: ["8GB", "16GB"] },
          "specs.screen": { $regex: /1[3-5]/ }
        };
        break;
    }
    
    // Construire la requête
    const query = {
      price: priceRange,
      ...specs,
      stock: { $gt: 0 },
      status: "available"
    };
    
    // Ajouter préférences
    if (preferences && preferences.brand) {
      query.brand = { $in: preferences.brand };
    }
    
    const products = await Product.find(query)
      .sort({ "rating.average": -1, salesCount: -1 })
      .limit(10)
      .populate("category", "name");
    
    // Classer les produits
    const recommendations = {
      excellent: products.filter(p => p.rating.average >= 4.5).slice(0, 3),
      good: products.filter(p => p.rating.average >= 4 && p.rating.average < 4.5).slice(0, 3),
      budget: products.sort((a, b) => a.price - b.price).slice(0, 3)
    };
    
    return recommendations;
  }
};

module.exports = configuratorService;
