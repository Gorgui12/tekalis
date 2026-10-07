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

/**
 * PSH (heures de plein soleil equivalent) par ville.
 * Source : PVGIS (Commission europeenne), annee 2020, base SARAH3,
 * collecte le 2026-10-07 - detail dans SOLAR_AUDIT.md section 7.
 * Valeurs a faire valider par un technicien (SOLAR_DECISIONS.md).
 * `prudent` (5.0) reste la valeur de conception par defaut : le rayonnement
 * journalier moyen n'est pas une garantie de jours de pluie/orage.
 */
export const PSH_BY_REGION = {
  prudent: { label: 'Prudence (5,0 h) - conseillé', psf: 5.0 },
  dakar: { label: 'Dakar', psf: 6.16 },
  thies: { label: 'Thiès', psf: 6.3 },
  'saint-louis': { label: 'Saint-Louis', psf: 6.47 },
  kaolack: { label: 'Kaolack', psf: 6.4 },
  diourbel: { label: 'Diourbel / Touba', psf: 6.44 },
  tambacounda: { label: 'Tambacounda', psf: 6.29 },
  ziguinchor: { label: 'Ziguinchor', psf: 5.98 },
};

export const WARNINGS = {
  indicative: 'Estimation indicative, à faire valider par un technicien avant achat ou installation.',
  resistive: 'Appareil très gourmand en énergie (résistif). Vérifier la faisabilité.',
  noExactMatch: 'Aucune combinaison complète de produits en stock/compatibles. Affichage dimensionnement indicatif uniquement.',
};
