// ===============================================
// 8. CONTROLLER - categoryController.js
// Logique complexe de filtration
// ===============================================
const Product = require("../models/Product");
const Category = require("../models/Category");
const { getInactiveCategoryIds, applyActiveCategoryFilter } = require("../utils/categoryVisibility");

exports.getProductsByCategory = async (req, res) => {
  try {
    const { slug } = req.params;
    const {
      page = 1,
      limit = 12,
      sort = "-createdAt",
      minPrice,
      maxPrice,
      brand,
      processor,
      ram,
      storage,
      screen,
      rating,
      inStock
    } = req.query;

    // Trouver la catégorie
    const category = await Category.findOne({ slug, isActive: true });
    if (!category) {
      return res.status(404).json({ message: "Catégorie introuvable" });
    }

    // Construction du filtre dynamique
    const filter = { category: category._id };
    
    // Filtres de prix
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    
    // Filtres de marque (multiple)
    if (brand) {
      filter.brand = { $in: brand.split(",") };
    }
    
    // Filtres de spécifications (Logique complexe)
    if (processor) {
      filter["specs.processorBrand"] = { $in: processor.split(",") };
    }
    
    if (ram) {
      // Ex: ram=8GB,16GB,32GB
      const ramValues = ram.split(",");
      filter["specs.ram"] = { $in: ramValues };
    }
    
    if (storage) {
      // Ex: storage=256GB,512GB,1TB
      const storageValues = storage.split(",");
      filter["specs.storage"] = { $in: storageValues };
    }
    
    if (screen) {
      // Ex: screen=13-14,15-16
      const screenRanges = screen.split(",");
      const screenFilters = screenRanges.map(range => {
        if (range === "13-14") return { "specs.screen": /^1[34]/ };
        if (range === "15-16") return { "specs.screen": /^1[56]/ };
        if (range === "17+") return { "specs.screen": /^(1[789]|[2-9][0-9])/ };
        return null;
      }).filter(Boolean);
      
      if (screenFilters.length > 0) {
        filter.$or = screenFilters;
      }
    }
    
    // Filtre de notation
    if (rating) {
      filter["rating.average"] = { $gte: Number(rating) };
    }
    
    // Stock disponible uniquement
    if (inStock === "true") {
      filter.stock = { $gt: 0 };
    }

    // Exclure les produits rattachés à une catégorie inactive
    const inactiveCategoryIds = await getInactiveCategoryIds();
    applyActiveCategoryFilter(filter, inactiveCategoryIds);

    // Tri
    let sortOption = {};
    switch (sort) {
      case "price-asc":
        sortOption = { price: 1 };
        break;
      case "price-desc":
        sortOption = { price: -1 };
        break;
      case "rating":
        sortOption = { "rating.average": -1, "rating.count": -1 };
        break;
      case "popular":
        sortOption = { salesCount: -1 };
        break;
      case "name":
        sortOption = { name: 1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    const products = await Product.find(filter)
      .populate("category", "name slug")
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Product.countDocuments(filter);

    // 🔍 Récupérer les options de filtres disponibles pour cette catégorie
    const availableFilters = await Product.aggregate([
      {
        $match: inactiveCategoryIds.length
          ? { $and: [{ category: category._id }, { category: { $nin: inactiveCategoryIds } }] }
          : { category: category._id }
      },
      {
        $group: {
          _id: null,
          brands: { $addToSet: "$brand" },
          processors: { $addToSet: "$specs.processorBrand" },
          rams: { $addToSet: "$specs.ram" },
          storages: { $addToSet: "$specs.storage" },
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      category: {
        name: category.name,
        slug: category.slug,
        seoDescription: category.seoDescription,
        banner: category.banner
      },
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      },
      availableFilters: availableFilters[0] || {}
    });
  } catch (error) {
    console.error("❌ Erreur getProductsByCategory:", error);
    res.status(500).json({ message: error.message });
  }
};

// Récupérer toutes les catégories (pour menu)
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ order: 1, name: 1 })
      .lean();
    
    // Organiser en hiérarchie
    const rootCategories = categories.filter(c => !c.parent);
    const categoriesWithChildren = rootCategories.map(root => ({
      ...root,
      children: categories.filter(c => 
        c.parent && c.parent.toString() === root._id.toString()
      )
    }));
    
    res.status(200).json({
      success: true,
      categories: categoriesWithChildren
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

