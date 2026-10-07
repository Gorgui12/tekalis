#!/usr/bin/env node
/**
 * scripts/solar-extract.mjs
 *
 * Phase 1 du configurateur solaire : PARSE le catalogue via l'API (lecture seule)
 * et PROPOSE des valeurs techniques (role, puissance, tension, capacite...) avec
 * un niveau de CONFIDENCE par champ (HIGH / MEDIUM / LOW / NONE).
 *
 * Sortie : SOLAR_DATA_TO_FILL.csv (a la racine du repo), a faire valider par un
 * humain/technicien puis importer via scripts/solar-apply.mjs.
 *
 * Rege absolue : on n'invente AUCUNE donnee. Seule ce qui est lisible dans le
 * nom ou la description du produit est propose. Le reste reste vide (NONE).
 *
 * Usage :
 *   node scripts/solar-extract.mjs                  # API publique par defaut
 *   node scripts/solar-extract.mjs http://localhost:5000/api/v1
 *
 * Variables d'env : SOLAR_API_BASE.
 */

import https from "node:https";
import http from "node:http";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// scripts/ -> tekalis-next -> apps -> tekalis-frontend -> racine du repo
const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..", "..", "..", "..");
const OUT_FILE = join(REPO_ROOT, "SOLAR_DATA_TO_FILL.csv");

const argBase = process.argv.slice(2).find((a) => !a.startsWith('-'));
const RAW_BASE =
  (argBase || process.env.SOLAR_API_BASE || "https://tekalis.onrender.com/api/v1").replace(/\/+$/, "").replace(/\/api\/v1$/, "") + "/api/v1";

function request(path) {
  return new Promise((resolve, reject) => {
    const mod = RAW_BASE.startsWith("https") ? https : http;
    const req = mod.get(`${RAW_BASE}${path}`, { headers: { "user-agent": "tekalis-solar-extract", accept: "application/json" } }, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode} ${path}`));
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`JSON invalide sur ${path}: ${e.message}`));
        }
      });
    });
    req.on("error", reject);
    req.setTimeout(20000, () => req.destroy(new Error(`timeout ${path}`)));
  });
}

const CONF = { HIGH: "HIGH", MEDIUM: "MEDIUM", LOW: "LOW", NONE: "NONE" };

// Règles de parsing du nom produit. Chaque règle renvoie { value, conf } ou null.
// Les rôles reconnus : panel, battery, inverter, controller, kit, accessory.
const ROLE_RULES = [
  { re: /panneau/i, role: "panel" },
  { re: /batterie/i, role: "battery" },
  { re: /onduleur/i, role: "inverter" },
  { re: /convertisseur/i, role: "inverter" },
  { re: /r[eé]gulateur/i, role: "controller" },
  { re: /\bkit\b/i, role: "kit" },
];
const ACCESSOIRE_RE = /camera|cam[eé]ra|projecteur|lampe|ventilateur/i;

function parseRole(name) {
  for (const { re, role } of ROLE_RULES) {
    if (re.test(name)) {
      // HIGH sauf "convertisseur" pour batterie de voiture (mais convertisseur-onduleur = inverter).
      return { value: role, conf: role === "inverter" ? (re.source === "convertisseur" ? CONF.MEDIUM : CONF.HIGH) : CONF.HIGH };
    }
  }
  if (ACCESSOIRE_RE.test(name)) return { value: "accessory", conf: CONF.HIGH };
  return { value: CONF.NONE, conf: CONF.NONE };
}

// Puissance en watt : "450W", "100 W", "5KW", "3 kW", "1000W"
const WATTS_RE = /(\d+(?:[.,]\d+)?)\s*(?:W(?:atts?|c)?\b|KW\b)/i;
const VOLT_RE = /\b(\d+(?:[.,]?\d+)?)\s*V\b/;
const AMP_RE = /\b(\d+(?:[.,]?\d+)?)\s*A\b/;
const AH_RE = /\b(\d+(?:[.,]?\d+)?)\s*Ah\b/i;

function parseWatts(name) {
  const m = name.match(WATTS_RE);
  if (!m) return null;
  let w = parseFloat(m[1].replace(",", "."));
  if (/KW/i.test(m[0])) w *= 1000;
  if (!isFinite(w) || w <= 0) return null;
  return { value: Math.round(w), conf: /KW/i.test(m[0]) ? CONF.HIGH : CONF.MEDIUM };
}

function parseVolts(name) {
  const m = name.match(VOLT_RE);
  if (!m) return null;
  const v = parseFloat(m[1].replace(",", "."));
  if (!isFinite(v) || v <= 0) return null;
  // 12V/24V, 24V/48V... valeur double = MEDIUM (le reglement stabil le deuxieme).
  const halves = name.split(m[0]).join("").match(/\b(\d+)\s*V\b/);
  return halves ? { value: parseFloat(halves[1]), conf: CONF.MEDIUM } : { value: v, conf: CONF.MEDIUM };
}

function parseAmp(name) {
  const m = name.match(AMP_RE);
  if (!m) return null;
  const a = parseFloat(m[1].replace(",", "."));
  if (!isFinite(a) || a <= 0 || a > 500) return null; // >500A improbable pour un régulateur
  return { value: a, conf: CONF.MEDIUM };
}

function parseAh(name) {
  const m = name.match(AH_RE);
  if (!m) return null;
  const ah = parseFloat(m[1].replace(",", "."));
  if (!isFinite(ah) || ah <= 0) return null;
  return { value: ah, conf: CONF.HIGH }; // "200Ah" explicite
}

function parseChemistry(name) {
  if (/gel/i.test(name)) return { value: "gel", conf: CONF.HIGH };
  if (/lithium|life[iy]?po4|LiFePO4/i.test(name)) return { value: "lithium", conf: CONF.HIGH };
  if (/agm/i.test(name)) return { value: "agm", conf: CONF.HIGH };
  if (/plomb/i.test(name)) return { value: "lead-acid", conf: CONF.MEDIUM };
  return null;
}

function parseInverterType(name) {
  if (/hybride|hybrid/i.test(name)) return { value: "hybrid", conf: CONF.HIGH };
  if (/convertisseur/i.test(name)) return { value: "converter", conf: CONF.HIGH };
  if (/mppt/i.test(name)) return { value: "off-grid", conf: CONF.MEDIUM };
  if (/onduleur/i.test(name)) return { value: "off-grid", conf: CONF.MEDIUM };
  return null;
}

// Extraction complète pour un produit. Retourne un objet de champs solar + conf.
function extractProduct(p, catSlug) {
  const name = p.name || "";
  const desc = p.description || "";
  const hay = `${name} ${desc}`;

  const role = parseRole(name);
  const fields = {};

  if (role.value !== CONF.NONE) {
    fields.role = role; // role toujours proposé
    if (role.value === "panel") {
      fields.powerW = parseWatts(hay);
      fields.voltageV = parseVolts(hay);
      // Voc/Vmp jamais lisibles dans un nom : restent vides.
    } else if (role.value === "battery") {
      fields.capacityAh = parseAh(hay);
      fields.voltageV = parseVolts(hay);
      const chem = parseChemistry(hay);
      if (chem) fields.chemistry = chem;
    } else if (role.value === "inverter") {
      fields.powerW = parseWatts(hay);
      const it = parseInverterType(hay);
      if (it) fields.inverterType = it;
      const v = parseVolts(hay);
      // Tension système uniquement si onduleur hybride, sinon on ne sait pas.
      if (it && it.value === "hybrid" && v) fields.systemVoltageV = { ...v, conf: CONF.MEDIUM };
      // continuous == puissance nominale (MEDIUM), peak jamais dans le nom.
      if (fields.powerW) fields.inverterContinuousW = { ...fields.powerW, conf: CONF.MEDIUM };
      fields.inverterPeakW = null;
    } else if (role.value === "controller") {
      const a = parseAmp(hay);
      if (a) fields.mpptMaxA = a; // courant max d'entrée (régulateur PWM/MPPT)
      const v = parseVolts(hay);
      if (v) fields.systemVoltageV = v;
      fields.mpptMaxVocV = null;
    }
    // kit / accessory : pas de champs techniques propables fiables hors role.
  }

  return { role, solar: fields };
}

// "Convertisseur 1000W 12V" : si aucun WATTS_RE mais "1000" présent devant modéliser.
function parseVoltsFieldAsWatts(name) {
  const m = name.match(VOLT_RE);
  if (!m) return null;
  const v = parseFloat(m[1].replace(",", "."));
  if (!isFinite(v) || v <= 0) return null;
  return { value: v, conf: CONF.LOW };
}

const FIELD_ORDER = [
  "role", "powerW", "voltageV", "capacityAh", "chemistry",
  "inverterContinuousW", "inverterPeakW", "systemVoltageV", "inverterType",
  "mpptMaxVocV", "mpptMaxA", "panelVocV", "panelVmpV", "cycles",
];

async function fetchAllProducts() {
  const out = [];
  let page = 1;
  let totalPages = 1;
  do {
    const j = await request(`/products?limit=200&page=${page}`);
    out.push(...(j.data || []));
    totalPages = j.pagination?.totalPages || 1;
    page += 1;
  } while (page <= totalPages);
  return out;
}

async function fetchCategorySlugs() {
  const j = await request("/categories");
  const map = {};
  for (const c of j.categories || []) map[c._id] = c.slug;
  return map;
}

async function main() {
  console.log(`[solar-extract] API : ${RAW_BASE}`);
  const [products, catMap] = await Promise.all([fetchAllProducts(), fetchCategorySlugs()]);
  const resteSolar = []; // produits solaires rangés ailleurs (camera PTZ, ventilateur, etc.)
  for (const p of products) {
    for (const cObj of p.category || []) {
      let cId = (cObj && typeof cObj === "object") ? (cObj._id || cObj.id) : cObj;
      let slug = (cObj && typeof cObj === "object") ? cObj.slug : (cId ? catMap[cId] : null);
      if (!slug && cId && catMap[cId]) slug = catMap[cId];
      if (slug === "energie-solaire") { resteSolar.push(p); break; }
    }
  }
  // Produits solaires connus hors catégorie (audit phase 0) : slugs figés.
  const extraSlugs = new Set(["camera-solaire-ip-double-objectif-exterieure-ptz-8mp-4g", "ventilateur-rechargeable-solaire-16-pouces-avec-panneau"]);
  const extras = products.filter((p) => extraSlugs.has(p.slug));

  const candidates = new Map();
  for (const p of [...resteSolar, ...extras]) candidates.set(p.slug, p);
  console.log(`[solar-extract] ${candidates.size} produits candidats (14 energie-solaire + 2 hors catégorie)`);

  const rows = [];
  for (const p of candidates.values()) {
    const { solar } = extractProduct(p);
    const row = { slug: p.slug, name: p.name };
    let rowConf = CONF.HIGH;
    for (const f of FIELD_ORDER) {
      const v = solar[f];
      if (v && v.value !== CONF.NONE) {
        row[f] = v.value;
        row[`${f}_conf`] = v.conf;
        if (v.conf === CONF.LOW) rowConf = CONF.LOW;
        else if (v.conf === CONF.MEDIUM && rowConf !== CONF.LOW) rowConf = CONF.MEDIUM;
      }
    }
    row.confidence = rowConf;
    rows.push(row);
  }

  const cols = ["slug", "name", "confidence", ...FIELD_ORDER.flatMap((f) => [f, `${f}_conf`])];
  const escape = (s) => (s == null ? "" : String(s).includes(",") || String(s).includes('"') ? `"${String(s).replace(/"/g, '""')}"` : String(s));
  const lines = cols.join(",") + "\n" + rows.map((r) => cols.map((c) => escape(r[c] ?? "")).join(",")).join("\n");
  mkdirSync(dirname(OUT_FILE), { recursive: true });
  writeFileSync(OUT_FILE, lines, "utf8");

  console.log(`[solar-extract] ${rows.length} lignes -> ${OUT_FILE}`);
  const warnings = rows.filter((r) => r.confidence === CONF.LOW).length;
  console.log(`[solar-extract] lignes LOW = ${warnings}`);
}

main().catch((e) => {
  console.error(`[solar-extract] ERREUR : ${e.message}`);
  process.exit(1);
});