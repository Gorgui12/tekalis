/**
 * lib/solar/catalog.js
 * Couche de donnees solaire : fusionne les annotations `solar` (backend)
 * avec les overrides front (data/solar-overrides.json, alimentes par
 * scripts/solar-apply.mjs). Lecture seule, fonctions pures.
 */

/**
 * Applique les overrides (indexes par slug) aux produits de l'API.
 * Le champ produit.solar (backend) a la priorite.
 * @param {Array} products produits bruts de l'API
 * @param {Object} overrides { overrides: { [slug]: { ...solar } } } (de solar-overrides.json)
 * @returns {Array} produits annotes
 */
export function annotateWithOverrides(products, overrides) {
  const map = overrides?.overrides || {};
  return (products || []).map((p) => {
    const over = p?.slug ? map[p.slug] : null;
    if (!over) return p;
    if (p?.solar && p.solar.role) return p;
    return { ...p, solar: { ...(p?.solar || {}), ...over }, _solarSource: 'overrides' };
  });
}

/** Produits exploitables par le moteur : role defini, statut et stock valides. */
export function solarCatalog(products, overrides) {
  return annotateWithOverrides(products, overrides).filter(
    (p) => p?.solar?.role && p?.status === 'available' && (p?.stock ?? 0) > 0
  );
}
