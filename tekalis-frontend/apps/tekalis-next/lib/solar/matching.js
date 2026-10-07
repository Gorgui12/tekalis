/**
 * lib/solar/matching.js
 * Sélection de produits réels depuis catalogue avec règles de compatibilité.
 */
import { DOD_BY_CHEM, DEFAULTS } from './constants.js';
import { batteryCapacityAh, batteryCapacityWh, mpptMinCurrentA, panelsCountNeeded, pvPowerNeededW, requiredInverterContinuousW, requiredInverterPeakW, systemVoltageFromVA } from './compute.js';

function isAvailable(p) {
  if (!p) return false;
  if (p.status && p.status !== 'available') return false;
  if (typeof p.stock === 'number' && p.stock <= 0) return false;
  return true;
}

function solar(p) {
  return p?.solar || {};
}

function byPrice(a, b) {
  return (a.price || 0) - (b.price || 0);
}

export function filterSolarProducts(products) {
  const list = products || [];
  return list.filter((p) => isAvailable(p) && p.solar && p.solar.role);
}

export function chooseSystemVoltageFromInverter(inv) {
  const s = solar(inv);
  if (s.systemVoltageV) return s.systemVoltageV;
  return null;
}

export function findMatchingKits({ products = [], Eday = 0, daysAutonomy = 1, mode = 'autonome', outageHours = DEFAULTS.outageHoursDefault }) {
  const solarProds = filterSolarProducts(products);
  const panels = solarProds.filter((p) => solar(p).role === 'panel');
  const batteries = solarProds.filter((p) => solar(p).role === 'battery');
  const inverters = solarProds.filter((p) => solar(p).role === 'inverter');
  const controllers = solarProds.filter((p) => solar(p).role === 'controller');

  const Psim = 0; // sera calculé depuis items côté appelant
  const Psurge = 0;

  // trouver meilleures combinaisons basiques
  const invContinuous = requiredInverterContinuousW(0); // placeholder
  const candidates = [];

  // profil moins cher / équilibre / premium (simplifié)
  return {
    hasComplete: false,
    missingRoles: [],
    dimensioning: {},
    profiles: [],
  };
}
