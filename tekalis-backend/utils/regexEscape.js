// ===============================================
// utils/regexEscape.js
// Échappe les caractères spéciaux regex dans une entrée utilisateur
// avant de l'utiliser dans un filtre Mongo $regex.
// Empêche : injection de motifs coûteux (ReDoS) et détournement
// de la sémantique de la requête via des métacaractères regex.
// ===============================================

/**
 * Échappe les caractères spéciaux d'une regex JavaScript.
 * @param {string} input - Texte brut fourni par l'utilisateur
 * @returns {string} - Texte sûr à insérer dans un `new RegExp(...)`
 */
function escapeRegex(input) {
  if (typeof input !== "string") return "";
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Construit un filtre Mongo $regex insensible à la casse à partir
 * d'une entrée utilisateur non fiable.
 * @param {string} input
 * @returns {{ $regex: string, $options: string } | null}
 */
function safeRegexFilter(input) {
  if (!input || typeof input !== "string") return null;
  return { $regex: escapeRegex(input.trim()), $options: "i" };
}

module.exports = { escapeRegex, safeRegexFilter };
