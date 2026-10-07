'use client';
/**
 * components/solar/SolarConfigurator.jsx
 * Configurateur solaire en 4 etapes, mobile-first.
 *  1. Appareils  2. Contraintes  3. Resultats (3 niveaux x 3 profils)  4. Devis
 * Etat encode dans l'URL (partage) + brouillon localStorage.
 * Tous les montants sont des estimations a faire valider par un technicien.
 */
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import APPLIANCES from '@/lib/solar/appliances';
import { PSH_BY_REGION, WARNINGS } from '@/lib/solar/constants';
import { buildNeed, tierNeed, findMatchingKits } from '@/lib/solar/matching';
import { formatFcfa } from '@/lib/seo/format';
import { SOCIAL_LINKS } from '@/lib/utils/constants';
import useCart from '@/lib/hooks/useCart';

const APPLIANCE_BY_ID = Object.fromEntries(APPLIANCES.map((a) => [a.id, a]));

const PRESETS = [
  { id: 'foyer', label: 'Foyer', items: [['led', 5, 5], ['fan', 1, 6], ['tv_led', 1, 4], ['decoder', 1, 4], ['router', 1, 24], ['fridge', 1, 24]] },
  { id: 'boutique', label: 'Boutique', items: [['led', 6, 8], ['tv_led', 1, 8], ['decoder', 1, 8], ['fan', 2, 8], ['router', 1, 24]] },
  { id: 'atelier', label: 'Atelier', items: [['led', 6, 8], ['sewing_machine', 2, 6], ['fan', 2, 8], ['router', 1, 24], ['printer', 1, 1]] },
];

const TIERS = [
  { id: 'essentiel', label: 'Essentiel', blurb: 'Appareils essentiels, 0,5 jour d autonomie' },
  { id: 'recommande', label: 'Recommandé', blurb: 'Votre liste complète, autonomie demandée' },
  { id: 'confort', label: 'Confort', blurb: '+30 % de marge et +0,5 jour d autonomie' },
];

const STEPS = ['Appareils', 'Contraintes', 'Résultats', 'Devis'];

function parseItemsParam(raw) {
  if (!raw) return [];
  const out = [];
  for (const chunk of String(raw).split(',')) {
    const [id, qty, hours] = chunk.split('.');
    const ap = APPLIANCE_BY_ID[id];
    if (!ap) continue;
    const q = Math.max(0, Math.min(99, parseInt(qty, 10) || 1));
    const h = Math.max(0, Math.min(24, parseInt(hours, 10) || ap.defaultHours));
    if (q > 0) out.push({ id, qty: q, hours: h });
  }
  return out;
}

function serializeItems(items) {
  return items.map((i) => `${i.id}.${i.qty}.${i.hours}`).join(',');
}

function readDraft() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem('tekalis:solar-draft');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeDraft(state) {
  try {
    window.localStorage.setItem('tekalis:solar-draft', JSON.stringify(state));
  } catch {
    /* stockage indisponible : on continue sans brouillon */
  }
}

export default function SolarConfigurator({ products = [] }) {
  const searchParams = useSearchParams();
  const { addItem } = useCart();

  const [step, setStep] = useState(1);
  const [items, setItems] = useState([]);
  const [mode, setMode] = useState('secours');
  const [outage, setOutage] = useState(4);
  const [autonomy, setAutonomy] = useState(1);
  const [region, setRegion] = useState('prudent');
  const [budget, setBudget] = useState('');
  const [tier, setTier] = useState('recommande');
  const [profileId, setProfileId] = useState('equilibre');
  const [cartFeedback, setCartFeedback] = useState('');
  const [copied, setCopied] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Hydratation : URL d'abord (partage), puis brouillon localStorage.
  useEffect(() => {
    const urlItems = parseItemsParam(searchParams.get('a'));
    const draft = readDraft();
    let st = null;
    if (urlItems.length) {
      st = {
        items: urlItems,
        mode: searchParams.get('mode') === 'autonome' ? 'autonome' : 'secours',
        outage: parseInt(searchParams.get('cut'), 10) || 4,
        autonomy: parseFloat(searchParams.get('aut')) || 1,
        region: PSH_BY_REGION[searchParams.get('reg')] ? searchParams.get('reg') : 'prudent',
        budget: searchParams.get('bud') || '',
      };
    } else if (draft && Array.isArray(draft.items) && draft.items.length) {
      st = { ...st, ...draft };
    }
    if (st) {
      setItems(st.items);
      setMode(st.mode || 'secours');
      setOutage(st.outage || 4);
      setAutonomy(st.autonomy || 1);
      setRegion(PSH_BY_REGION[st.region] ? st.region : 'prudent');
      setBudget(st.budget || '');
      setStep(2);
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Etat -> URL (replaceState : pas de navigation serveur, pas de boucle).
  useEffect(() => {
    if (!hydrated) return;
    const params = new URLSearchParams();
    if (items.length) params.set('a', serializeItems(items));
    params.set('mode', mode);
    params.set('cut', String(outage));
    params.set('aut', String(autonomy));
    params.set('reg', region);
    if (budget) params.set('bud', String(budget));
    const qs = params.toString();
    window.history.replaceState(null, '', `${window.location.pathname}${qs ? `?${qs}` : ''}`);
    writeDraft({ items, mode, outage, autonomy, region, budget });
  }, [hydrated, items, mode, outage, autonomy, region, budget]);

  const setItemQty = (id, qty) => {
    setItems((prev) => {
      const ap = APPLIANCE_BY_ID[id];
      const existing = prev.find((i) => i.id === id);
      if (qty <= 0) return prev.filter((i) => i.id !== id);
      if (existing) return prev.map((i) => (i.id === id ? { ...i, qty: Math.min(99, qty) } : i));
      return [...prev, { id, qty: Math.min(99, qty), hours: ap.defaultHours }];
    });
  };

  const setItemHours = (id, hours) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, hours: Math.max(1, Math.min(24, hours)) } : i)));
  };

  const applyPreset = (preset) => {
    setItems(preset.items.map(([id, qty, hours]) => ({ id, qty, hours })));
    setStep(2);
  };

  // Besoin -> niveaux -> kits (memo : le catalogue ne change pas pendant la session).
  const results = useMemo(() => {
    const baseItems = items
      .map((i) => {
        const ap = APPLIANCE_BY_ID[i.id];
        if (!ap) return null;
        return { qty: i.qty, w: ap.watts, hours: i.hours, duty: ap.duty, surgeFactor: ap.surgeFactor, essential: ap.essential };
      })
      .filter(Boolean);

    const opts = { mode, outageHours: outage, autonomyDays: autonomy, psf: PSH_BY_REGION[region]?.psf ?? 5.0 };
    const essentielItems = baseItems.filter((it) => it.essential);
    const recommandeNeed = buildNeed(baseItems, opts);
    const needs = {
      essentiel: buildNeed(essentielItems, { ...opts, autonomyDays: 0.5 }),
      recommande: recommandeNeed,
      confort: tierNeed(recommandeNeed, 'confort'),
    };
    const maxBudget = budget ? Number(budget) : null;
    const kits = {};
    for (const t of Object.keys(needs)) {
      kits[t] = findMatchingKits({ products, need: needs[t], maxBudget });
    }
    return { needs, kits };
  }, [items, mode, outage, autonomy, region, budget, products]);

  const activeKit = results.kits[tier];
  const activeProfile = activeKit?.profiles?.find((p) => p.id === profileId) || activeKit?.profiles?.[1];
  const selectedTierMeta = TIERS.find((t) => t.id === tier);

  const itemCountLabel = items.reduce((s, i) => s + i.qty, 0);

  const buildWhatsAppMessage = () => {
    const lines = activeProfile?.lines || [];
    const appareils = items
      .map((i) => `${i.qty}x ${APPLIANCE_BY_ID[i.id]?.label} (${i.hours}h/j)`)
      .join(', ');
    const kit = lines
      .map((l) => `${l.units}x ${l.product.name}`)
      .join(', ');
    const parts = [
      'Bonjour Tekalis, je viens du configurateur solaire.',
      `Appareils : ${appareils || 'non renseignes'}`,
      `Mode : ${mode === 'secours' ? `secours (${outage} h de coupure/j)` : `autonome (${autonomy} j)`}`,
      `Niveau : ${selectedTierMeta?.label} - profil ${activeProfile?.label}`,
      kit ? `Kit propose : ${kit}` : 'Kit non determinable en ligne',
      activeProfile ? `Total indicatif : ${formatFcfa(activeProfile.total)} FCFA` : '',
      WARNINGS.indicative,
      `Configuration : ${typeof window !== 'undefined' ? window.location.href : ''}`,
    ].filter(Boolean);
    return `https://wa.me/${SOCIAL_LINKS.whatsapp.replace('https://wa.me/', '')}?text=${encodeURIComponent(parts.join('\n'))}`;
  };

  const addToCart = () => {
    if (!activeProfile?.complete) return;
    for (const line of activeProfile.lines) {
      addItem(line.product, line.units);
    }
    setCartFeedback('Kit ajouté au panier.');
    setTimeout(() => setCartFeedback(''), 4000);
  };

  const shareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      /* presse-papiers indisponible */
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-4 text-sm text-amber-900 bg-amber-50 border border-amber-200 p-3 rounded-lg">
        {WARNINGS.indicative}
      </div>

      {/* Etapes */}
      <ol className="flex flex-wrap gap-2 mb-6" aria-label="Étapes du configurateur">
        {STEPS.map((label, idx) => {
          const n = idx + 1;
          const state = n === step ? 'current' : n < step ? 'done' : 'todo';
          return (
            <li key={label}>
              <button
                type="button"
                onClick={() => n < step && setStep(n)}
                disabled={n > step}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                  state === 'current'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : state === 'done'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-white text-gray-400 border-gray-200'
                } ${n <= step ? 'cursor-pointer' : 'cursor-not-allowed'}`}
              >
                {n}. {label}
              </button>
            </li>
          );
        })}
      </ol>

      {/* ── Etape 1 : appareils ─────────────────────────────────────── */}
      {step === 1 && (
        <section>
          <h2 className="text-xl font-bold mb-1">Quels appareils voulez-vous alimenter ?</h2>
          <p className="text-sm text-gray-600 mb-4">Choisissez un profil rapide ou cochez vos appareils un par un.</p>

          <div className="flex flex-wrap gap-2 mb-5">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p)}
                className="px-4 py-2 rounded-lg border border-blue-300 text-blue-700 text-sm font-semibold hover:bg-blue-50"
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {APPLIANCES.map((ap) => {
              const sel = items.find((i) => i.id === ap.id);
              return (
                <div
                  key={ap.id}
                  className={`border rounded-lg p-3 ${sel ? 'border-blue-400 bg-blue-50/40' : 'border-gray-200 bg-white'}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="font-semibold text-sm">{ap.label}</span>
                      <span className="block text-xs text-gray-500">
                        {ap.watts} W{ap.essential ? '' : ' · non essentiel'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label={`Retirer ${ap.label}`}
                        onClick={() => setItemQty(ap.id, (sel?.qty || 0) - 1)}
                        className="w-8 h-8 rounded border border-gray-300 text-lg leading-none"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-sm font-bold">{sel?.qty || 0}</span>
                      <button
                        type="button"
                        aria-label={`Ajouter ${ap.label}`}
                        onClick={() => setItemQty(ap.id, (sel?.qty || 0) + 1)}
                        className="w-8 h-8 rounded border border-gray-300 text-lg leading-none"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  {sel && (
                    <label className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                      Heures / jour
                      <input
                        type="number"
                        min="1"
                        max="24"
                        value={sel.hours}
                        onChange={(e) => setItemHours(ap.id, parseInt(e.target.value, 10) || 1)}
                        className="w-16 border border-gray-300 rounded px-2 py-1"
                      />
                    </label>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <span className="text-sm text-gray-600">{itemCountLabel} appareil(s) sélectionné(s)</span>
            <button
              type="button"
              disabled={!items.length}
              onClick={() => setStep(2)}
              className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-semibold disabled:opacity-40"
            >
              Continuer →
            </button>
          </div>
        </section>
      )}

      {/* ── Etape 2 : contraintes ───────────────────────────────────── */}
      {step === 2 && (
        <section>
          <h2 className="text-xl font-bold mb-4">Vos contraintes</h2>

          <fieldset className="mb-5">
            <legend className="text-sm font-semibold mb-2">Objectif</legend>
            <div className="flex gap-3">
              {[
                ['secours', 'Secours (coupures)'],
                ['autonome', 'Autonome (hors réseau)'],
              ].map(([v, label]) => (
                <label key={v} className={`flex-1 border rounded-lg p-3 text-sm cursor-pointer ${mode === v ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                  <input
                    type="radio"
                    name="mode"
                    value={v}
                    checked={mode === v}
                    onChange={() => setMode(v)}
                    className="mr-2"
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
            {mode === 'secours' && (
              <label className="text-sm">
                <span className="block font-semibold mb-1">Heures de coupure / jour</span>
                <input
                  type="number"
                  min="1"
                  max="24"
                  value={outage}
                  onChange={(e) => setOutage(Math.max(1, Math.min(24, parseInt(e.target.value, 10) || 4)))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </label>
            )}
            <label className="text-sm">
              <span className="block font-semibold mb-1">
                Jours d autonomie <span title="Nombre de jours sans soleil que la batterie doit couvrir" className="cursor-help text-gray-400">?</span>
              </span>
              <input
                type="number"
                min="0.5"
                max="7"
                step="0.5"
                value={autonomy}
                onChange={(e) => setAutonomy(Math.max(0.5, Math.min(7, parseFloat(e.target.value) || 1)))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </label>
            <label className="text-sm">
              <span className="block font-semibold mb-1">
                Région <span title="PSH : heures de plein soleil équivalent, source PVGIS (voir SOLAR_AUDIT.md)" className="cursor-help text-gray-400">?</span>
              </span>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                {Object.entries(PSH_BY_REGION).map(([key, r]) => (
                  <option key={key} value={key}>
                    {r.label} — {r.psf.toFixed(2)} h/j
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="block font-semibold mb-1">Budget max (FCFA, optionnel)</span>
              <input
                type="number"
                min="0"
                step="10000"
                value={budget}
                placeholder="ex. 300000"
                onChange={(e) => setBudget(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </label>
          </div>

          <div className="flex justify-between">
            <button type="button" onClick={() => setStep(1)} className="px-5 py-2.5 rounded-lg border border-gray-300 font-semibold">
              ← Retour
            </button>
            <button type="button" onClick={() => setStep(3)} className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-semibold">
              Voir les kits →
            </button>
          </div>
        </section>
      )}

      {/* ── Etape 3 : resultats ─────────────────────────────────────── */}
      {step === 3 && (
        <section>
          <h2 className="text-xl font-bold mb-1">Votre estimation</h2>
          <p className="text-sm text-gray-600 mb-4">
            Niveaux : comparez la même installation en trois configurations.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            {TIERS.map((t) => {
              const need = results.needs[t.id];
              const kit = results.kits[t.id];
              const isActive = tier === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTier(t.id)}
                  className={`text-left border rounded-lg p-3 ${isActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}
                >
                  <span className="font-bold block">{t.label}</span>
                  <span className="text-xs text-gray-500 block mb-2">{t.blurb}</span>
                  <span className="text-xs block text-gray-700">
                    {formatFcfa(need?.Eday)} Wh/j · {formatFcfa(need?.pvNeededW)} Wc
                  </span>
                  <span className="text-sm font-semibold block">
                    {kit?.profiles?.find((p) => p.id === profileId)?.complete
                      ? `${formatFcfa(kit.profiles.find((p) => p.id === profileId).total)} FCFA`
                      : 'Sur devis'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Profils */}
          <div className="flex gap-2 mb-4">
            {(activeKit?.profiles || []).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setProfileId(p.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold border ${profileId === p.id ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300'}`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Dimensionnement */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 text-sm">
            <h3 className="font-bold mb-2">Dimensionnement {selectedTierMeta?.label.toLowerCase()}</h3>
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div><dt className="text-gray-500 text-xs">Énergie / jour</dt><dd className="font-semibold">{formatFcfa(results.needs[tier]?.Eday)} Wh</dd></div>
              <div><dt className="text-gray-500 text-xs">Tension système</dt><dd className="font-semibold">{results.needs[tier]?.Vsys} V</dd></div>
              <div><dt className="text-gray-500 text-xs">Panneaux</dt><dd className="font-semibold">{formatFcfa(results.needs[tier]?.pvNeededW)} Wc</dd></div>
              <div><dt className="text-gray-500 text-xs">Autonomie</dt><dd className="font-semibold">{results.needs[tier]?.daysAutonomy} j</dd></div>
            </dl>
          </div>

          {/* Lignes produits */}
          {activeProfile?.lines?.length ? (
            <ul className="divide-y divide-gray-100 bg-white border border-gray-200 rounded-lg mb-4">
              {activeProfile.lines.map((l) => (
                <li key={`${l.role}-${l.product.slug}`} className="flex items-center justify-between gap-3 p-3 text-sm">
                  <div>
                    <span className="font-semibold block">{l.product.name}</span>
                    <span className="text-xs text-gray-500">
                      {l.role === 'battery' && 'Batterie · '}
                      {l.role === 'panel' && 'Panneau · '}
                      {l.role === 'inverter' && 'Onduleur · '}
                      {l.role === 'controller' && 'Régulateur · '}
                      {l.units} unité(s) · stock {l.product.stock}
                    </span>
                  </div>
                  <span className="font-semibold whitespace-nowrap">{formatFcfa(l.product.price * l.units)} F</span>
                </li>
              ))}
              <li className="flex items-center justify-between p-3 bg-gray-50 rounded-b-lg">
                <span className="font-bold text-sm">Total indicatif</span>
                <span className="font-bold">{formatFcfa(activeProfile.total)} FCFA</span>
              </li>
            </ul>
          ) : (
            <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 p-3 rounded-lg mb-4">
              {WARNINGS.noExactMatch}
            </p>
          )}

          {activeProfile?.overBudget && (
            <p className="text-sm text-red-700 bg-red-50 border border-red-200 p-3 rounded-lg mb-4">
              Ce profil dépasse votre budget de {formatFcfa(activeProfile.total - Number(budget))} FCFA.
            </p>
          )}

          {activeProfile?.complete && (
            <p className="text-xs text-gray-600 mb-4">
              Pourquoi ce choix : la puissance de l’onduleur couvre la simultanéité avec 25 % de marge, les batteries
              couvrent {results.needs[tier]?.daysAutonomy} jour(s) à {mode === 'secours' ? 'couverture des coupures' : 'autonomie demandée'}, et les panneaux
              produisent {formatFcfa(results.needs[tier]?.pvNeededW)} Wc sous un ensoleillement de{' '}
              {PSH_BY_REGION[region]?.psf.toFixed(2)} h/j.
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => setStep(2)} className="px-5 py-2.5 rounded-lg border border-gray-300 font-semibold">
              ← Retour
            </button>
            <button type="button" onClick={() => setStep(4)} className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-semibold">
              Obtenir le devis →
            </button>
          </div>
        </section>
      )}

      {/* ── Etape 4 : devis ─────────────────────────────────────────── */}
      {step === 4 && (
        <section>
          <h2 className="text-xl font-bold mb-1">Recevoir votre devis</h2>
          <p className="text-sm text-gray-600 mb-4">
            {selectedTierMeta?.label} · profil {activeProfile?.label} ·{' '}
            {activeProfile?.complete ? `${formatFcfa(activeProfile.total)} FCFA (indicatif)` : 'à chiffrer avec un technicien'}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <a
              href={buildWhatsAppMessage()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-5 py-3 rounded-lg bg-green-600 text-white font-semibold text-center hover:bg-green-700"
            >
              Envoyer ma demande sur WhatsApp
            </a>
            <button
              type="button"
              onClick={addToCart}
              disabled={!activeProfile?.complete}
              className="flex-1 px-5 py-3 rounded-lg bg-blue-600 text-white font-semibold disabled:opacity-40"
            >
              Ajouter le kit au panier
            </button>
          </div>
          {cartFeedback && <p className="text-sm text-green-700 mb-4">{cartFeedback}</p>}

          <div className="flex flex-wrap gap-3 mb-6">
            <button type="button" onClick={() => window.print()} className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold">
              Imprimer l estimation
            </button>
            <button type="button" onClick={shareLink} className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold">
              {copied ? 'Lien copié ✓' : 'Copier le lien de ma configuration'}
            </button>
            <Link href="/contact" className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold">
              Parler à un technicien
            </Link>
          </div>

          {/* Recap imprimable */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-sm">
            <h3 className="font-bold mb-2">Récapitulatif</h3>
            <ul className="mb-2 text-gray-700">
              {items.map((i) => (
                <li key={i.id}>
                  {i.qty} × {APPLIANCE_BY_ID[i.id]?.label} — {i.hours} h/j
                </li>
              ))}
            </ul>
            <p className="text-gray-700">
              Mode : {mode === 'secours' ? `secours, ${outage} h de coupure/jour` : `autonome, ${autonomy} jour(s)`} ·
              Région : {PSH_BY_REGION[region]?.label}
            </p>
            {activeProfile?.lines?.length > 0 && (
              <ul className="mt-2 text-gray-700">
                {activeProfile.lines.map((l) => (
                  <li key={`recap-${l.product.slug}`}>
                    {l.units} × {l.product.name} — {formatFcfa(l.product.price * l.units)} FCFA
                  </li>
                ))}
                <li className="font-bold mt-1">Total indicatif : {formatFcfa(activeProfile.total)} FCFA</li>
              </ul>
            )}
            <p className="mt-3 text-xs text-amber-800 bg-amber-50 border border-amber-100 p-2 rounded">
              {WARNINGS.indicative}
            </p>
          </div>

          <div className="mt-5 flex justify-between">
            <button type="button" onClick={() => setStep(3)} className="px-5 py-2.5 rounded-lg border border-gray-300 font-semibold">
              ← Résultats
            </button>
            <button
              type="button"
              onClick={() => {
                setItems([]);
                setStep(1);
              }}
              className="px-5 py-2.5 rounded-lg border border-gray-300 font-semibold"
            >
              Recommencer
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
