import test from 'node:test';
import assert from 'node:assert/strict';
import { dailyEnergyWh, simultaneousPowerW, maxSurgeWatts, systemVoltageFromVA, batteryCapacityWh, batteryCapacityAh, pvPowerNeededW, panelsCountNeeded, mpptMinCurrentA } from '../compute.js';

test('dailyEnergyWh - foyer basique', () => {
  const items = [
    { qty: 5, w: 10, hours: 5, duty: 1.0 },
    { qty: 1, w: 70, hours: 4, duty: 1.0 },
    { qty: 1, w: 150, hours: 24, duty: 0.4 },
  ];
  assert.equal(dailyEnergyWh(items), 1970);
});

test('simultaneousPowerW - 0.7 par défaut', () => {
  const items = [
    { qty: 5, w: 10 },
    { qty: 2, w: 70 },
    { qty: 1, w: 150 },
  ];
  assert.equal(simultaneousPowerW(items), 238);
});

test('maxSurgeWatts - prend en compte pic moteur', () => {
  const items = [
    { qty: 1, w: 150, surgeFactor: 2.0 },
    { qty: 1, w: 70, surgeFactor: 1.2 },
  ];
  assert.equal(maxSurgeWatts(items), Math.round((154 + 150) * 100) / 100);
});

test('systemVoltageFromVA - règles', () => {
  assert.equal(systemVoltageFromVA(800), 12);
  assert.equal(systemVoltageFromVA(1500), 24);
  assert.equal(systemVoltageFromVA(3500), 48);
});

test('battery - Wh et Ah', () => {
  const wh = batteryCapacityWh(1970, 1, 0.5, 0.9);
  assert.equal(Math.round(wh * 100) / 100, Math.round((1970 / (0.5 * 0.9)) * 100) / 100);
  assert.equal(batteryCapacityAh(4380, 24), Math.ceil(4380 / 24));
});

test('pv et MPPT', () => {
  const pv = pvPowerNeededW(1970, 5.0, 0.75, 0.9);
  assert.ok(pv > 0);
  assert.equal(panelsCountNeeded(pv, 450), Math.ceil(pv / 450));
  assert.equal(mpptMinCurrentA(pv, 24), Math.ceil((pv / 24) * 1.25));
});
