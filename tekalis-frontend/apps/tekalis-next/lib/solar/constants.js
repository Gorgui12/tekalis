/**
 * lib/solar/constants.js
 * Paramètres indicatifs à faire valider par un technicien.
 * Chaque valeur est justifiée et doit être revue avant dimensionnement définitif.
 */
export const DEFAULTS = {
  simultaneityFactor: 0.7,        // Facteur de simultanéité
  inverterOversize: 1.25,         // Surcharge sécurité onduleur (continu)
  mpptSafetyFactor: 1.25,         // Marge courant MPPT
  pr: 0.75,                       // Performance Ratio (poussière, chaleur, câbles...)
  etaInv: 0.90,                   // Rendement onduleur
  psfDefault: 5.0,                // PSH par défaut (prudence) si région inconnue
  autonomyDaysDefault: 1,         // Autonomie par défaut (hors réseau)
  outageHoursDefault: 4,          // Heures coupure Senelec (secours)
  comfortMargin: 0.30,            // Marge Confort (+30%)
  comfortAutonomyExtra: 0.5,     // +0,5j autonomie Confort
};

export const DOD_BY_CHEM = {
  gel: 0.5,
  agm: 0.5,
  'lead-acid': 0.5,
  lithium: 0.8,
  // si inconnu -> prudent
  default: 0.5,
};

export const VOLTAGE_RULE = {
  // <= 1000 VA -> 12V ; <= 3000 VA -> 24V ; > 3000 VA -> 48V
  threshold12: 1000,
  threshold24: 3000,
};

export const WARNINGS = {
  indicative: 'Estimation indicative, à faire valider par un technicien avant achat ou installation.',
  resistive: 'Appareil très gourmand en énergie (résistif). Vérifier la faisabilité.',
  noExactMatch: 'Aucune combinaison complète de produits en stock/compatibles. Affichage dimensionnement indicatif uniquement.',
};
