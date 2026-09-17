// ===============================================
// utils/categoryVisibility.js
// Visibilité produit liée aux catégories actives.
//
// Règle métier : quand une catégorie est désactivée dans l'admin,
// TOUS ses produits deviennent inactifs (plus visibles, plus
// achetables). Une seule catégorie inactive suffit pour masquer le
// produit, même s'il appartient aussi à une catégorie active.
// ===============================================
const Category = require("../models/Category");

// Récupère les _id des catégories inactives.
const getInactiveCategoryIds = async () => {
  return Category.find({ isActive: false }).distinct("_id");
};

// Vérifie si un produit (ou la liste de ses catégories) est rattaché à
// une catégorie inactive. Accepte des ObjectId ou des documents
// peuplés ({ _id, name, ... }).
const isProductInInactiveCategory = (categoryList = [], inactiveIds = []) => {
  if (!inactiveIds.length || !categoryList.length) return false;
  const inactive = new Set(inactiveIds.map(id => String(id)));
  for (const cat of categoryList) {
    const catId = cat && cat._id ? cat._id : cat;
    if (catId && inactive.has(String(catId))) return true;
  }
  return false;
};

// Enrichit un filtre Mongo (muté) pour exclure les produits rattachés à
// une catégorie inactive. Compatible avec un filtre.category existant.
const applyActiveCategoryFilter = (filter = {}, inactiveIds = []) => {
  if (!inactiveIds.length) return filter;
  const condition = { category: { $nin: inactiveIds } };
  if (filter.$and) {
    filter.$and = [...filter.$and, condition];
  } else if (filter.category) {
    filter.$and = [condition, { category: filter.category }];
    delete filter.category;
  } else {
    filter.category = { $nin: inactiveIds };
  }
  return filter;
};

module.exports = {
  getInactiveCategoryIds,
  isProductInInactiveCategory,
  applyActiveCategoryFilter
};