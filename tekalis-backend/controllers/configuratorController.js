// ===============================================
// 11. CONTROLLER - configuratorController.js
// ===============================================
const configuratorService = require("../services/configuratorService");

exports.getRecommendations = async (req, res) => {
  try {
    const { budget, usage, brand, processor, ram, screen } = req.body;
    
    if (!budget || !usage) {
      return res.status(400).json({ 
        message: "Budget et usage sont requis" 
      });
    }
    
    const filters = {
      budget,
      usage,
      preferences: {
        brand: brand ? brand.split(",") : null,
        processor,
        ram,
        screen
      }
    };
    
    const recommendations = await configuratorService.recommendProducts(filters);
    
    res.status(200).json({
      success: true,
      filters,
      recommendations
    });
  } catch (error) {
    console.error("❌ Erreur configurator:", error);
    res.status(500).json({ message: error.message });
  }
};
