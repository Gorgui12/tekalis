/**
 * Calcule le montant de la remise d'un code promo pour un sous-total donné.
 * `promo` provient de POST /promo/validate:
 *   { code, type: "percentage" | "fixed", discount, maxDiscount }
 */
export function computePromoDiscount(promo, subtotal) {
  if (!promo || !subtotal || subtotal <= 0) return 0;

  if (promo.type === "fixed") {
    return Math.min(promo.discount || 0, subtotal);
  }

  let discount = subtotal * ((promo.discount || 0) / 100);
  if (promo.maxDiscount) discount = Math.min(discount, promo.maxDiscount);
  return Math.round(discount);
}
