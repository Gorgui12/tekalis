/**
 * lib/solar/compute.js
 * Moteur de calcul pur - fonctions pures, testables.
 */
import { DEFAULTS, DOD_BY_CHEM, VOLTAGE_RULE } from './constants.js';

export function dailyEnergyWh(items) {
  // items: [{qty,w,hours,duty}]
  let sum = 0;
  for (const it of items || []) {
    const qty = Number(it.qty || 0);
    const w = Number(it.w || 0);
    const h = Number(it.hours || 0);
    const duty = it.duty != null ? Number(it.duty) : 1.0;
    if (qty <= 0 || w <= 0 || h <= 0) continue;
    sum += qty * w * h * duty;
  }
  return Math.round(sum * 100) / 100;
}

export function maxSurgeWatts(items) {
  // find item with largest w * (surgeFactor-1) contribution + base? formula: P_sur = P_simult + max(surgeFactor-1)*W_max_motor
  const simul = simultaneousPowerW(items);
  let maxExtra = 0;
  for (const it of items || []) {
    const qty = Number(it.qty || 0);
    const w = Number(it.w || 0);
    const sf = it.surgeFactor != null ? Number(it.surgeFactor) : 1.0;
    if (qty <= 0 || w <= 0) continue;
    const extra = (sf - 1) * w; // worst single motor extra
    if (extra > maxExtra) maxExtra = extra;
  }
  return Math.round((simul + maxExtra) * 100) / 100;
}

export function simultaneousPowerW(items, sfSim = DEFAULTS.simultaneityFactor) {
  let sum = 0;
  for (const it of items || []) {
    const qty = Number(it.qty || 0);
    const w = Number(it.w || 0);
    if (qty <= 0 || w <= 0) continue;
    sum += qty * w;
  }
  const res = sum * Number(sfSim || DEFAULTS.simultaneityFactor);
  return Math.round(res * 100) / 100;
}

export function requiredInverterContinuousW(Psimult, oversize = DEFAULTS.inverterOversize) {
  const w = Psimult * Number(oversize || DEFAULTS.inverterOversize);
  return Math.ceil(w);
}

export function requiredInverterPeakW(Psurge) {
  return Math.ceil(Psurge);
}

export function systemVoltageFromVA(Pva) {
  const p = Number(Pva || 0);
  if (p <= VOLTAGE_RULE.threshold12) return 12;
  if (p <= VOLTAGE_RULE.threshold24) return 24;
  return 48;
}

export function batteryCapacityWh(Eday, daysAutonomy, dod, etaInv = DEFAULTS.etaInv) {
  const d = Number(daysAutonomy || 0);
  if (d <= 0) return 0;
  const e = Number(Eday || 0);
  const doD = dod != null ? Number(dod) : DOD_BY_CHEM.default;
  const eta = Number(etaInv || DEFAULTS.etaInv);
  const res = (e * d) / (doD * eta);
  return Math.round(res * 100) / 100;
}

export function batteryCapacityAh(Wh, Vsys) {
  const v = Number(Vsys || 0);
  if (v <= 0) return 0;
  const ah = Number(Wh || 0) / v;
  return Math.ceil(ah);
}

export function pvPowerNeededW(Eday, psf = DEFAULTS.psfDefault, pr = DEFAULTS.pr, etaInv = DEFAULTS.etaInv) {
  const e = Number(Eday || 0);
  const p = Number(psf || DEFAULTS.psfDefault);
  const r = Number(pr || DEFAULTS.pr);
  const eta = Number(etaInv || DEFAULTS.etaInv);
  if (p <= 0) return Math.ceil(e / (r * eta));
  const res = (e / eta) / (p * r);
  return Math.ceil(res);
}

export function panelsCountNeeded(pvNeededW, panelW) {
  const p = Number(panelW || 0);
  if (p <= 0) return 0;
  return Math.ceil(Number(pvNeededW || 0) / p);
}

export function mpptMinCurrentA(pvNeededW, Vsys, sf = DEFAULTS.mpptSafetyFactor) {
  const v = Number(Vsys || 0);
  if (v <= 0) return 0;
  const a = (Number(pvNeededW || 0) / v) * Number(sf || DEFAULTS.mpptSafetyFactor);
  return Math.ceil(a);
}
