/**
 * lib/solar/index.js
 * API publique du moteur solaire.
 */
export * from './constants.js';
export * from './compute.js';
export * from './appliances.js';
export { filterSolarProducts, findMatchingKits } from './matching.js';
export { buildKitPresets } from './presets.js';
