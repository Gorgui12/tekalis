'use client';
/**
 * components/solar/ToolCalculator.jsx
 * Formulaires des 3 mini-outils /outils/*. Le calcul utilise exclusivement
 * les fonctions pures de lib/solar/compute.js (memes regles que le
 * configurateur). Rien n'est invente : input utilisateur + constantes citees.
 */
import { useState } from 'react';
import APPLIANCES from '@/lib/solar/appliances';
import { DOD_BY_CHEM, WARNINGS } from '@/lib/solar/constants';
import { batteryCapacityAh, batteryCapacityWh, pvPowerNeededW, panelsCountNeeded, dailyEnergyWh } from '@/lib/solar/compute';
import { formatFcfa } from '@/lib/seo/format';

const PANEL_W = 450; // panneau de reference du catalogue (monocristallin 450W)

function Row({ label, value, hint }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-600">{label}{hint && <span className="block text-xs text-gray-400">{hint}</span>}</span>
      <span className="font-bold text-sm whitespace-nowrap">{value}</span>
    </div>
  );
}

export default function ToolCalculator({ tool }) {
  if (tool === 'consommation') return <ConsommationTool />;
  if (tool === 'batterie') return <BatterieTool />;
  return <PanneauxTool />;
}

/* ── Consommation : appareils -> Wh/jour ─────────────────────────────── */
function ConsommationTool() {
  const [qty, setQty] = useState({});
  const items = APPLIANCES.map((a) => ({ ...a, qty: qty[a.id] || 0 })).filter((a) => a.qty > 0);
  const Eday = dailyEnergyWh(items.map((a) => ({ qty: a.qty, w: a.watts, hours: a.defaultHours, duty: a.duty })));

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
        {APPLIANCES.map((a) => (
          <label key={a.id} className="flex items-center justify-between gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm">
            <span>
              {a.label}
              <span className="block text-xs text-gray-500">{a.watts} W · {a.defaultHours} h/j</span>
            </span>
            <input
              type="number"
              min="0"
              max="99"
              value={qty[a.id] || 0}
              onChange={(e) => setQty((prev) => ({ ...prev, [a.id]: Math.max(0, Math.min(99, parseInt(e.target.value, 10) || 0)) }))}
              className="w-16 border border-gray-300 rounded px-2 py-1"
              aria-label={`Quantite ${a.label}`}
            />
          </label>
        ))}
      </div>
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <Row label="Consommation journalière" value={`${formatFcfa(Eday)} Wh`} hint="somme (quantité × watts × heures × duty)" />
        <Row label="Estimation mensuelle" value={`${formatFcfa(Eday * 30)} Wh`} />
        <Row label="Estimation mensuelle" value={`${formatFcfa((Eday * 30) / 1000)} kWh`} />
      </div>
      <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 p-2 rounded mt-3">{WARNINGS.indicative}</p>
    </div>
  );
}

/* ── Batterie : Wh/jour + autonomie -> Wh et Ah ──────────────────────── */
function BatterieTool() {
  const [eday, setEday] = useState('2000');
  const [days, setDays] = useState('1');
  const [dod, setDod] = useState('0.5');
  const [vsys, setVsys] = useState('24');

  const wh = batteryCapacityWh(Number(eday), Number(days), Number(dod), 0.9);
  const ah = batteryCapacityAh(wh, Number(vsys));
  const series = Number(vsys) % 12 === 0 ? Number(vsys) / 12 : 0;
  const bat200 = series > 0 ? series * Math.ceil(ah / 200) : 0;

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <label className="text-sm">
          <span className="block font-semibold mb-1">Énergie journalière (Wh)</span>
          <input type="number" min="0" value={eday} onChange={(e) => setEday(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
        </label>
        <label className="text-sm">
          <span className="block font-semibold mb-1">Jours d autonomie</span>
          <input type="number" min="0.5" step="0.5" value={days} onChange={(e) => setDays(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
        </label>
        <label className="text-sm">
          <span className="block font-semibold mb-1">DoD (décharge autorisée)</span>
          <select value={dod} onChange={(e) => setDod(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2">
            <option value="0.5">50 % — gel / AGM / plomb (conseillé)</option>
            <option value="0.8">80 % — lithium</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="block font-semibold mb-1">Tension système</span>
          <select value={vsys} onChange={(e) => setVsys(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2">
            <option value="12">12 V</option>
            <option value="24">24 V</option>
            <option value="48">48 V</option>
          </select>
        </label>
      </div>
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <Row label="Capacité batterie nécessaire" value={`${formatFcfa(wh)} Wh`} hint="Wh = (Wh/j × jours) ÷ (DoD × rendement 0,90)" />
        <Row label="En ampères-heures" value={`${formatFcfa(ah)} Ah`} hint={`Ah = Wh ÷ ${vsys} V`} />
        <Row
          label="Exemple : batteries 12 V 200 Ah"
          value={series > 0 ? `${bat200} unité(s) (série de ${series})` : 'tension 12 V incompatible'}
          hint="mise en série pour atteindre la tension système"
        />
      </div>
      <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 p-2 rounded mt-3">
        DoD gel/AGM = 0,5 et lithium = 0,8 ({DOD_BY_CHEM.default} par défaut si chimie inconnue). {WARNINGS.indicative}
      </p>
    </div>
  );
}

/* ── Panneaux : Wh/jour + PSH -> Wc et nombre de panneaux ────────────── */
function PanneauxTool() {
  const [eday, setEday] = useState('2000');
  const [psf, setPsf] = useState('5.0');

  const pv = pvPowerNeededW(Number(eday), Number(psf), 0.75, 0.9);
  const count = panelsCountNeeded(pv, PANEL_W);

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <label className="text-sm">
          <span className="block font-semibold mb-1">Énergie journalière (Wh)</span>
          <input type="number" min="0" value={eday} onChange={(e) => setEday(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
        </label>
        <label className="text-sm">
          <span className="block font-semibold mb-1">Ensoleillement (PSH h/j)</span>
          <select value={psf} onChange={(e) => setPsf(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2">
            <option value="5.0">5,00 — prudence (pluie/orage)</option>
            <option value="6.16">6,16 — Dakar (PVGIS)</option>
            <option value="6.30">6,30 — Thiès (PVGIS)</option>
            <option value="6.47">6,47 — Saint-Louis (PVGIS)</option>
            <option value="6.40">6,40 — Kaolack (PVGIS)</option>
            <option value="5.98">5,98 — Ziguinchor (PVGIS)</option>
          </select>
        </label>
      </div>
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <Row label="Puissance panneaux nécessaire" value={`${formatFcfa(pv)} Wc`} hint="Wc = (Wh/j ÷ 0,90) ÷ (PSH × PR 0,75)" />
        <Row label={`Panneaux ${PANEL_W} Wc nécessaires`} value={`${count}`} hint="nombre entier, arrondi au supérieur" />
        <Row label="Puissance installée" value={`${formatFcfa(count * PANEL_W)} Wc`} />
      </div>
      <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 p-2 rounded mt-3">
        PR = 0,75 (poussière, chaleur, câbles). PSH source PVGIS pour les villes sénégalaises. {WARNINGS.indicative}
      </p>
    </div>
  );
}
