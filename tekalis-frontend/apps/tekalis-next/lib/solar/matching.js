/**
 * lib/solar/matching.js
 * Selection de produits reels depuis le catalogue avec regles de compatibilite.
 * Fonctions pures - aucun acces reseau, aucun effet de bord.
 *
 * Regles de compatibilite (documentees SOLAR_DECISIONS.md) :
 * - onduleur : inverterContinuousW >= Pcont ; inverterPeakW >= Ppeak si connu ;
 *   systemVoltageV doit valoir Vsys si connu (tension exacte).
 * - batterie : tension unitaire doit diviser Vsys (mise en serie exacte),
 *   capacite Ah cumulee (apres DoD de la chimie) >= besoin ; stock >= unites.
 * - panneau : puissance cumulee >= besoin ; si tension connue < 1,1*Vsys,
 *   mise en serie imposee ; stock >= unites. Voc : a verifier (donnees absentes).
 * - regulateur : requis si l'onduleur choisi n'a pas de MPPT integre
 *   (inverterType !== 'hybrid') ; mpptMaxA >= courant requis ; systemVoltageV >= Vsys.
 */
import { DEFAULTS, DOD_BY_CHEM, WARNINGS } from './constants.js';
import { batteryCapacityWh, mpptMinCurrentA } from './compute.js';

const REQUIRED_ROLES = ['inverter', 'battery', 'panel'];

function solar(p) {
  return p?.solar || {};
}

function isAvailable(p) {
  if (!p) return false;
  if (p.status && p.status !== 'available') return false;
  if (typeof p.stock === 'number' && p.stock <= 0) return false;
  return true;
}

export function filterSolarProducts(products) {
  return (products || []).filter((p) => isAvailable(p) && solar(p).role);
}

function ratingOf(p) {
  const r = p?.rating;
  if (typeof r === 'number') return r;
  if (r && typeof r.average === 'number') return r.average;
  return 0;
}

/** Spec technique "plus grand" selon le role (pour le profil premium). */
function specScore(p) {
  const s = solar(p);
  if (s.role === 'battery') return (s.voltageV || 0) * (s.capacityAh || 0);
  if (s.role === 'panel') return s.powerW || 0;
  if (s.role === 'inverter') return s.inverterContinuousW || s.powerW || 0;
  if (s.role === 'controller') return s.mpptMaxA || 0;
  return 0;
}

/**
 * Besoin de dimensionnement a partir des appareils et du mode.
 * @param {Array} items [{qty,w,hours,duty,essential,surgeFactor}]
 * @param {Object} opts { mode, outageHours, autonomyDays, psf, etaInv }
 */
export function buildNeed(items, opts = {}) {
  const {
    mode = 'autonome',
    outageHours = DEFAULTS.outageHoursDefault,
    autonomyDays = DEFAULTS.autonomyDaysDefault,
    psf = DEFAULTS.psfDefault,
    pr = DEFAULTS.pr,
    etaInv = DEFAULTS.etaInv,
  } = opts;

  const list = (items || []).filter((it) => Number(it.qty) > 0 && Number(it.w) > 0 && Number(it.hours) > 0);
  let used = list;
  let hoursCap = null;
  if (mode === 'secours') {
    used = list.filter((it) => it.essential !== false);
    hoursCap = Number(outageHours) || DEFAULTS.outageHoursDefault;
  }
  const capped = hoursCap != null ? used.map((it) => ({ ...it, hours: Math.min(Number(it.hours), hoursCap) })) : used;

  const dailyEnergy = (arr) => {
    let sum = 0;
    for (const it of arr) {
      const duty = it.duty != null ? Number(it.duty) : 1.0;
      sum += Number(it.qty) * Number(it.w) * Number(it.hours) * duty;
    }
    return Math.round(sum * 100) / 100;
  };

  const Eday = dailyEnergy(capped);
  const Psim = Math.round((capped.reduce((s, it) => s + Number(it.qty) * Number(it.w), 0) * DEFAULTS.simultaneityFactor) * 100) / 100;
  let maxExtra = 0;
  for (const it of capped) {
    const sf = it.surgeFactor != null ? Number(it.surgeFactor) : 1.0;
    const extra = (sf - 1) * Number(it.w);
    if (extra > maxExtra) maxExtra = extra;
  }
  const Psurge = Math.round((Psim + maxExtra) * 100) / 100;
  const Pcont = Math.ceil(Psim * DEFAULTS.inverterOversize);
  const Ppeak = Math.ceil(Psurge);
  const Vsys = Pcont <= 1000 ? 12 : Pcont <= 3000 ? 24 : 48;
  const pvNeededW = Math.ceil((Eday / etaInv) / (psf * pr));
  const mpptRequiredA = Math.ceil((pvNeededW / Vsys) * DEFAULTS.mpptSafetyFactor);

  return { mode, Eday, Psim, Psurge, Pcont, Ppeak, Vsys, pvNeededW, mpptRequiredA, daysAutonomy: Number(autonomyDays) || DEFAULTS.autonomyDaysDefault, psf, pr, etaInv, itemCount: capped.length };
}

/** Transforme le besoin selon le niveau (Essentiel / Recommande / Confort). */
export function tierNeed(need, tier) {
  if (tier === 'confort') {
    const Eday = Math.round(need.Eday * (1 + DEFAULTS.comfortMargin) * 100) / 100;
    const pvNeededW = Math.ceil((Eday / need.etaInv) / (need.psf * need.pr));
    return {
      ...need,
      Eday,
      pvNeededW,
      mpptRequiredA: Math.ceil((pvNeededW / need.Vsys) * DEFAULTS.mpptSafetyFactor),
      daysAutonomy: need.daysAutonomy + DEFAULTS.comfortAutonomyExtra,
      tier: 'confort',
    };
  }
  return { ...need, tier };
}

function candidateInverters(need, prods) {
  return prods.filter((p) => {
    const s = solar(p);
    if (s.role !== 'inverter') return false;
    if ((s.inverterContinuousW || 0) < need.Pcont) return false;
    if (s.inverterPeakW != null && s.inverterPeakW < need.Ppeak) return false;
    if (s.systemVoltageV != null && s.systemVoltageV !== need.Vsys) return false;
    return true;
  });
}

function batteryPlan(p, need) {
  const s = solar(p);
  const v = Number(s.voltageV || 0);
  if (!v || need.Vsys % v !== 0) return null;
  const series = need.Vsys / v;
  const dod = DOD_BY_CHEM[s.chemistry] ?? DOD_BY_CHEM.default;
  const requiredWh = batteryCapacityWh(need.Eday, need.daysAutonomy, dod, need.etaInv);
  const requiredAh = requiredWh / need.Vsys;
  const strings = Math.ceil(requiredAh / Number(s.capacityAh || 1));
  if (strings <= 0) return null;
  const units = series * strings;
  if (typeof p.stock === 'number' && units > p.stock) return null;
  return { units, requiredWh, strings, series };
}

function panelPlan(p, need) {
  const s = solar(p);
  const w = Number(s.powerW || 0);
  if (!w) return null;
  let series = 1;
  if (s.voltageV && Number(s.voltageV) < need.Vsys * 1.1) {
    series = Math.ceil((need.Vsys * 1.1) / Number(s.voltageV));
  }
  const wPerString = series * w;
  const strings = Math.ceil(need.pvNeededW / wPerString);
  if (strings <= 0) return null;
  const units = series * strings;
  if (typeof p.stock === 'number' && units > p.stock) return null;
  return { units, strings, series };
}

function controllerPlan(p, need) {
  const s = solar(p);
  if ((s.mpptMaxA || 0) < need.mpptRequiredA) return null;
  if (s.systemVoltageV != null && s.systemVoltageV < need.Vsys) return null;
  return { units: 1 };
}

function candidateBatteries(need, prods) {
  const out = [];
  for (const p of prods) {
    if (solar(p).role !== 'battery') continue;
    const plan = batteryPlan(p, need);
    if (plan) out.push({ product: p, ...plan });
  }
  return out;
}

function candidatePanels(need, prods) {
  const out = [];
  for (const p of prods) {
    if (solar(p).role !== 'panel') continue;
    const plan = panelPlan(p, need);
    if (plan) out.push({ product: p, ...plan });
  }
  return out;
}

function candidateControllers(need, prods) {
  const out = [];
  for (const p of prods) {
    if (solar(p).role !== 'controller') continue;
    const plan = controllerPlan(p, need);
    if (plan) out.push({ product: p, ...plan });
  }
  return out;
}

const PROFILE_IDS = ['budget', 'equilibre', 'premium'];
const PROFILE_LABELS = { budget: 'Moins cher', equilibre: 'Equilibre', premium: 'Premium' };

/** Prix total de la ligne (prix unitaire x unites necessaires). */
function lineTotal(c) {
  return (c.product.price || 0) * (c.units || 1);
}

function rankCandidates(cands, profile) {
  const arr = cands.slice();
  if (profile === 'budget') return arr.sort((a, b) => lineTotal(a) - lineTotal(b));
  if (profile === 'equilibre')
    return arr.sort((a, b) => {
      const d = ratingOf(b.product) - ratingOf(a.product);
      return d !== 0 ? d : lineTotal(a) - lineTotal(b);
    });
  // premium : plus haute spec, puis la ligne la plus chere
  return arr.sort((a, b) => {
    const d = specScore(b.product) - specScore(a.product);
    return d !== 0 ? d : lineTotal(b) - lineTotal(a);
  });
}

/**
 * Selectionne les produits pour un besoin donne, en 3 profils.
 * @param {Object} args { products (annotes solar), need, maxBudget? }
 * @returns {Object} { need, hasComplete, missingRoles, profiles, warnings }
 */
export function findMatchingKits({ products = [], need, maxBudget = null }) {
  const prods = filterSolarProducts(products);
  const warnings = [WARNINGS.indicative];

  const inverters = candidateInverters(need, prods).map((p) => ({ product: p, units: 1 }));
  const batteries = candidateBatteries(need, prods);
  const panels = candidatePanels(need, prods);

  // Regulateur requis uniquement si AUCUN onduleur candidat n'a de MPPT integre
  const anyHybrid = inverters.some((c) => solar(c.product).inverterType === 'hybrid');
  const needController = !anyHybrid;
  const controllers = needController ? candidateControllers(need, prods) : [];

  const missingRoles = [];
  if (!inverters.length) missingRoles.push('inverter');
  if (!batteries.length) missingRoles.push('battery');
  if (!panels.length) missingRoles.push('panel');
  if (needController && !controllers.length) missingRoles.push('controller');

  if (inverters.some((c) => solar(c.product).inverterPeakW == null)) {
    warnings.push('Pic de démarrage des onduleurs non renseigne : a valider par un technicien.');
  }
  if (panels.some((p) => solar(p).panelVocV == null) || !inverters.some((c) => solar(c.product).mpptMaxVocV != null)) {
    warnings.push('Voc des panneaux / entree MPPT non renseigne : configuration serie a verifier par un technicien.');
  }

  const profiles = PROFILE_IDS.map((id) => {
    const lines = [];
    const rank = (cands) => rankCandidates(cands, id)[0] || null;

    const inv = rank(inverters);
    let needCtlForProfile = needController;
    if (inv) {
      lines.push({ role: 'inverter', product: inv.product, units: 1 });
      // onduleur hybride => MPPT integre, pas de regulateur necessaire
      needCtlForProfile = solar(inv.product).inverterType !== 'hybrid';
    }
    const bat = rank(batteries);
    if (bat) lines.push({ role: 'battery', product: bat.product, units: bat.units });
    const pan = rank(panels);
    if (pan) lines.push({ role: 'panel', product: pan.product, units: pan.units });
    if (needCtlForProfile) {
      const ctl = rank(controllers);
      if (ctl) lines.push({ role: 'controller', product: ctl.product, units: ctl.units });
    }

    const total = lines.reduce((s, l) => s + (l.product.price || 0) * l.units, 0);
    const complete =
      REQUIRED_ROLES.every((r) => lines.some((l) => l.role === r)) &&
      (!needCtlForProfile || lines.some((l) => l.role === 'controller'));
    const overBudget = maxBudget != null && total > Number(maxBudget);
    return {
      id,
      label: PROFILE_LABELS[id],
      lines,
      total,
      complete,
      overBudget,
      lineCount: lines.length,
    };
  });

  const hasComplete = profiles.some((p) => p.complete);
  if (!hasComplete) warnings.push(WARNINGS.noExactMatch);

  return { need, hasComplete, missingRoles, profiles, warnings, needController };
}
