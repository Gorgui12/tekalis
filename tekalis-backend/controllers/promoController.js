// ===============================================
// controllers/promoController.js
// Validation d'un code promo sans dépendre d'un panier serveur.
// Le panier de la boutique est géré côté client (Redux) : cette route
// permet à l'UI de vérifier un code et d'afficher la remise, tandis que
// le montant réel est revalidé côté serveur à la création de la commande.
// ===============================================
const PromoCode = require("../models/PromoCode");

// ===============================================
// POST /api/v1/promo/validate
// Body: { code, subtotal }
// ===============================================
exports.validatePromoCode = async (req, res) => {
  try {
    const { code, subtotal } = req.body;

    if (!code || String(code).trim() === "") {
      return res.status(400).json({ success: false, message: "Code promo requis" });
    }

    const amount = Number(subtotal) || 0;

    const promo = await PromoCode.findOne({
      code: String(code).trim().toUpperCase(),
      isActive: true
    });

    if (!promo) {
      return res.status(400).json({ success: false, message: "Code promo invalide ou expiré" });
    }

    const validity = promo.isValid();
    if (!validity.valid) {
      return res.status(400).json({ success: false, message: validity.reason });
    }

    if (req.user) {
      const userUsageCount = promo.usedBy.filter(
        u => u.user && u.user.toString() === req.user._id.toString()
      ).length;

      if (userUsageCount >= (promo.usageLimitPerUser || 1)) {
        return res.status(400).json({ success: false, message: "Vous avez déjà utilisé ce code" });
      }
    }

    const discountResult = promo.calculateDiscount(amount);
    if (discountResult.error) {
      return res.status(400).json({ success: false, message: discountResult.error });
    }

    res.status(200).json({
      success: true,
      code: promo.code,
      description: promo.description,
      type: promo.type,
      discount: promo.discount,
      maxDiscount: promo.maxDiscount,
      discountAmount: amount > 0 ? discountResult.discount : null,
      minAmount: promo.minAmount
    });
  } catch (error) {
    console.error("❌ Erreur validatePromoCode:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
