import test from 'node:test';
import assert from 'node:assert/strict';
import { buildNeed, tierNeed, findMatchingKits, filterSolarProducts } from '../matching.js';

// Catalogue fixture representatif du catalogue reel (overrides solaire).
const PRODUCTS = [
  { slug: 'inv-5kw', name: 'Onduleur hybride 5kW', price: 377000, stock: 4, status: 'available', rating: { average: 4.8, count: 12 },
    solar: { role: 'inverter', powerW: 5000, inverterContinuousW: 5000, systemVoltageV: 48, inverterType: 'hybrid' } },
  { slug: 'inv-3kw', name: 'Onduleur hybride 3kW', price: 240500, stock: 6, status: 'available', rating: { average: 4.6, count: 30 },
    solar: { role: 'inverter', powerW: 3000, inverterContinuousW: 3000, systemVoltageV: 24, inverterType: 'hybrid' } },
  { slug: 'conv-1kw', name: 'Convertisseur 1000W', price: 32500, stock: 5, status: 'available',
    solar: { role: 'inverter', powerW: 1000, inverterContinuousW: 1000, inverterType: 'converter' } },
  { slug: 'bat-200', name: 'Batterie gel 12V 200Ah', price: 201500, stock: 10, status: 'available',
    solar: { role: 'battery', voltageV: 12, capacityAh: 200, chemistry: 'gel' } },
  { slug: 'bat-100', name: 'Batterie gel 12V 100Ah', price: 110500, stock: 10, status: 'available',
    solar: { role: 'battery', voltageV: 12, capacityAh: 100, chemistry: 'gel' } },
  { slug: 'pan-450', name: 'Panneau 450W', price: 62000, stock: 20, status: 'available',
    solar: { role: 'panel', powerW: 450 } },
  { slug: 'pan-100', name: 'Panneau 100W 18V', price: 18000, stock: 20, status: 'available',
    solar: { role: 'panel', powerW: 100, voltageV: 18 } },
  { slug: 'ctl-pwm', name: 'Regulateur PWM 30A', price: 25000, stock: 8, status: 'available',
    solar: { role: 'controller', systemVoltageV: 24, mpptMaxA: 30 } },
  // hors catalogue : stock nul / non solaire
  { slug: 'inv-rupture', name: 'Onduleur rupture', price: 99999, stock: 0, status: 'available',
    solar: { role: 'inverter', inverterContinuousW: 9000, systemVoltageV: 48, inverterType: 'hybrid' } },
  { slug: 'tv', name: 'TV LED', price: 50000, stock: 3, status: 'available' },
];

const HOME_ITEMS = [
  { qty: 5, w: 10, hours: 5, duty: 1.0, essential: true },
  { qty: 1, w: 70, hours: 4, duty: 1.0, essential: true },
  { qty: 1, w: 150, hours: 24, duty: 0.4, essential: true },
  { qty: 1, w: 900, hours: 6, duty: 0.8, essential: false, surgeFactor: 2.5 },
];

test('buildNeed - foyer basique : Eday, tension, PV', () => {
  const need = buildNeed(HOME_ITEMS, { mode: 'autonome', autonomyDays: 1 });
  assert.equal(need.Eday, 5 * 10 * 5 + 70 * 4 + 150 * 24 * 0.4 + 900 * 6 * 0.8);
  // Psim = (50+70+150+900)*0.7 = 819 ; Pcont = ceil(819*1.25) = 1024 -> 24V
  assert.equal(need.Psim, 1170 * 0.7);
  assert.equal(need.Pcont, Math.ceil(1170 * 0.7 * 1.25));
  assert.equal(need.Vsys, 24);
  assert.ok(need.pvNeededW > 0);
  assert.equal(need.mpptRequiredA, Math.ceil((need.pvNeededW / 24) * 1.25));
});

test('buildNeed - secours : filtre non-essentiels et borne les heures', () => {
  const need = buildNeed(HOME_ITEMS, { mode: 'secours', outageHours: 4 });
  // clim 900W non essentiel exclu ; toutes les heures bornees a 4h (dont LED 5h -> 4h)
  const expected = 5 * 10 * 4 + 70 * 4 + 150 * 4 * 0.4;
  assert.equal(need.Eday, expected);
  assert.equal(need.itemCount, 3);
});

test('tierNeed - confort augmente Eday de 30% et autonomie de 0.5j', () => {
  const base = buildNeed(HOME_ITEMS, { autonomyDays: 1 });
  const conf = tierNeed(base, 'confort');
  assert.equal(conf.Eday, Math.round(base.Eday * 1.3 * 100) / 100);
  assert.equal(conf.daysAutonomy, 1.5);
  assert.ok(conf.pvNeededW >= base.pvNeededW);
});

test('findMatchingKits - combinaison complete, 3 profils', () => {
  const need = buildNeed(HOME_ITEMS, { autonomyDays: 1 });
  const res = findMatchingKits({ products: PRODUCTS, need });
  assert.equal(res.hasComplete, true);
  assert.deepEqual(res.missingRoles, []);
  assert.equal(res.profiles.length, 3);
  for (const p of res.profiles) {
    assert.equal(p.complete, true);
    const roles = p.lines.map((l) => l.role);
    for (const r of ['inverter', 'battery', 'panel']) assert.ok(roles.includes(r), `${r} manquant dans ${p.id}`);
    // total coherent
    const sum = p.lines.reduce((s, l) => s + l.product.price * l.units, 0);
    assert.equal(p.total, sum);
    // jamais de produit hors stock
    for (const l of p.lines) assert.ok(l.product.stock >= l.units);
    assert.equal(p.overBudget, false);
  }
  // budget <= equilibre <= premium approximatif : budget n'est jamais le plus cher
  const budget = res.profiles.find((p) => p.id === 'budget');
  const premium = res.profiles.find((p) => p.id === 'premium');
  assert.ok(budget.total <= premium.total, `budget ${budget.total} <= premium ${premium.total}`);
});

test('findMatchingKits - onduleur choisi compatible en tension', () => {
  const need = buildNeed(HOME_ITEMS, { autonomyDays: 1 }); // Vsys 24
  const res = findMatchingKits({ products: PRODUCTS, need });
  for (const p of res.profiles) {
    const inv = p.lines.find((l) => l.role === 'inverter');
    assert.equal(inv.product.solar.systemVoltageV, 24);
  }
});

test('findMatchingKits - profil premium choisit la meilleure spec', () => {
  const need = buildNeed(HOME_ITEMS, { autonomyDays: 1 });
  const res = findMatchingKits({ products: PRODUCTS, need });
  const premium = res.profiles.find((p) => p.id === 'premium');
  const bat = premium.lines.find((l) => l.role === 'battery');
  assert.equal(bat.product.slug, 'bat-200'); // 12*200 > 12*100
});

test('findMatchingKits - hors tension exclu, rupture exclue', () => {
  const need = buildNeed(HOME_ITEMS, { autonomyDays: 1 }); // Vsys 24
  const res = findMatchingKits({ products: PRODUCTS, need });
  for (const p of res.profiles) {
    const inv = p.lines.find((l) => l.role === 'inverter');
    assert.notEqual(inv.product.slug, 'inv-5kw'); // 48V != 24V
    assert.notEqual(inv.product.slug, 'inv-rupture');
  }
});

test('findMatchingKits - catalogue vide : roles manquants', () => {
  const need = buildNeed(HOME_ITEMS, { autonomyDays: 1 });
  const res = findMatchingKits({ products: [], need });
  assert.equal(res.hasComplete, false);
  assert.ok(res.missingRoles.includes('inverter'));
  assert.ok(res.missingRoles.includes('battery'));
  assert.ok(res.missingRoles.includes('panel'));
  assert.ok(res.warnings.length >= 2); // indicative + noExactMatch
});

test('findMatchingKits - batterie 12V sur bus 24V : 2 unites en serie', () => {
  const need = buildNeed(HOME_ITEMS, { autonomyDays: 1 });
  const res = findMatchingKits({ products: PRODUCTS, need });
  const budget = res.profiles.find((p) => p.id === 'budget');
  const bat = budget.lines.find((l) => l.role === 'battery');
  assert.equal(bat.product.solar.voltageV, 12);
  assert.equal(bat.units % 2, 0); // serie de 2 exigee sur 24V
  // capacite couvrante : unites * Ah * dod(0.5) * eta(0.9) * 24V >= Eday * jours
  const s = bat.product.solar;
  const wh = bat.units * s.voltageV * s.capacityAh * 0.5 * 0.9;
  assert.ok(wh >= need.Eday * need.daysAutonomy, `${wh} >= ${need.Eday * need.daysAutonomy}`);
});

test('findMatchingKits - stock insuffisant => profil non complet', () => {
  const need = buildNeed(HOME_ITEMS, { autonomyDays: 1 });
  const prods = PRODUCTS.map((p) => (p.solar?.role === 'battery' ? { ...p, stock: 1 } : p));
  const res = findMatchingKits({ products: prods, need });
  // 1 batterie 12V ne couvre pas 24V*100Ah*0.45 >= besoin => strings insuffisants
  const budget = res.profiles.find((p) => p.id === 'budget');
  const batLine = budget.lines.find((l) => l.role === 'battery');
  if (batLine) assert.ok(batLine.units <= 1);
  else assert.ok(res.missingRoles.includes('battery'));
});

test('findMatchingKits - maxBudget marque overBudget', () => {
  const need = buildNeed(HOME_ITEMS, { autonomyDays: 1 });
  const res = findMatchingKits({ products: PRODUCTS, need, maxBudget: 1000 });
  const budget = res.profiles.find((p) => p.id === 'budget');
  assert.equal(budget.overBudget, true);
});

test('findMatchingKits - onduleur converter impose regulateur', () => {
  // besoin 12V : seul le convertisseur passe (ni 24V ni 48V)
  const items = [{ qty: 3, w: 10, hours: 5, duty: 1.0, essential: true }];
  const need = buildNeed(items, { autonomyDays: 1 });
  assert.equal(need.Vsys, 12);
  const res = findMatchingKits({ products: PRODUCTS, need });
  assert.equal(res.needController, true);
  const budget = res.profiles.find((p) => p.id === 'budget');
  assert.ok(budget.lines.some((l) => l.role === 'controller'));
});

test('findMatchingKits - besoin 48V : onduleur 48V requis, regulateur facultatif', () => {
  // puissance simultanee forte (48V) mais faible consommation journaliere
  const items = [{ qty: 50, w: 90, hours: 1, duty: 1.0, essential: true }];
  const need = buildNeed(items, { autonomyDays: 1 });
  assert.equal(need.Vsys, 48);
  const res = findMatchingKits({ products: PRODUCTS, need });
  const budget = res.profiles.find((p) => p.id === 'budget');
  const inv = budget.lines.find((l) => l.role === 'inverter');
  assert.equal(inv.product.slug, 'inv-5kw');
  assert.equal(res.needController, false); // hybride = MPPT integre
  assert.ok(!budget.lines.some((l) => l.role === 'controller'));
});

test('filterSolarProducts - ne garde que le solaire dispo', () => {
  const list = filterSolarProducts(PRODUCTS);
  assert.ok(!list.some((p) => p.slug === 'tv'));
  assert.ok(!list.some((p) => p.slug === 'inv-rupture'));
  assert.ok(list.every((p) => p.solar.role && p.stock > 0));
});
