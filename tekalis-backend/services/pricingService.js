// ===============================================
// 10. services/pricingService.js
// ===============================================
const Settings = require("../models/Settings");
const PromoCode = require("../models/PromoCode");

class PricingService {
  // Calculer le prix total d'une commande
  static async calculateOrderTotal(items, promoCode = null, userId = null) {
    try {
      // Calculer le sous-total
      let subtotal = 0;
      for (const item of items) {
        subtotal += item.price * item.quantity;
      }
      
      // Récupérer les paramètres
      const settings = await Settings.findById("site_settings");
      
      // Frais de livraison
      let shippingCost = settings?.shipping?.standardCost || 2500;
      if (subtotal >= (settings?.shipping?.freeShippingThreshold || 50000)) {
        shippingCost = 0;
      }
      
      // Réduction promo
      let discount = 0;
      let promoError = null;
      
      if (promoCode) {
        const promo = await PromoCode.findOne({ 
          code: promoCode.toUpperCase(),
          isActive: true
        });
        
        if (promo) {
          const validity = promo.isValid();
          
          if (validity.valid) {
            // Vérifier l'utilisation par l'utilisateur
            if (userId) {
              const userUsageCount = promo.usedBy.filter(
                u => u.user.toString() === userId.toString()
              ).length;
              
              if (userUsageCount >= promo.usageLimitPerUser) {
                promoError = "Vous avez déjà utilisé ce code";
              }
            }
            
            if (!promoError) {
              const discountResult = promo.calculateDiscount(subtotal);
              if (discountResult.error) {
                promoError = discountResult.error;
              } else {
                discount = discountResult.discount;
              }
            }
          } else {
            promoError = validity.reason;
          }
        } else {
          promoError = "Code promo invalide";
        }
      }
      
      // Taxes (si applicable)
      let tax = 0;
      if (settings?.tax?.enabled) {
        const taxableAmount = subtotal - discount;
        tax = Math.round(taxableAmount * (settings.tax.rate / 100));
      }
      
      // Total final
      const total = subtotal - discount + shippingCost + tax;
      
      return {
        subtotal: Math.round(subtotal),
        discount: Math.round(discount),
        shippingCost,
        tax,
        total: Math.round(total),
        promoError
      };
    } catch (error) {
      console.error("Erreur calculateOrderTotal:", error);
      throw error;
    }
  }
  
  // Calculer les points de fidélité
  static calculateLoyaltyPoints(amount, settings = null) {
    if (!settings?.loyalty?.enabled) return 0;
    
    const pointsPerFCFA = settings.loyalty.pointsPerFCFA || 0.001;
    return Math.floor(amount * pointsPerFCFA);
  }
  
  // Convertir les points en réduction
  static pointsToDiscount(points, settings = null) {
    if (!settings?.loyalty?.enabled) return 0;
    
    const minPoints = settings.loyalty.minPointsToRedeem || 100;
    if (points < minPoints) return 0;
    
    const redemptionRate = settings.loyalty.redemptionRate || 1;
    return points * redemptionRate;
  }
}

module.exports = PricingService;