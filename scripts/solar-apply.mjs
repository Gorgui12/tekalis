#!/usr/bin/env node
/**
 * scripts/solar-apply.mjs
 *
 * Importe le CSV SOLAR_DATA_TO_FILL.csv (valide par un humain) dans la couche
 * de donnees cote front : tekalis-frontend/apps/tekalis-next/data/solar-overrides.json
 * indexee par slug.
 *
 * Regles :
 *   - DRY-RUN par defaut : rien n'est ecrit, on affiche ce qui changerait.
 *   - Jamais d'ecriture automatique en base. La base (API) n'est touchee que si
 *     --api est fourni AVEC un jeton admin (SOLAR_ADMIN_TOKEN) : chaque produit
 *     est alors mis a jour via PUT /api/v1/admin/products/:id (champ "solar").
 *   - Seuls les champs presents et non vides dans le CSV sont ecrits (merge).
 *
 * Usage :
 *   node scripts/solar-apply.mjs                # dry-run (par defaut)
 *   node scripts/solar-apply.mjs --apply        # ecrit solar-overrides.json
 *   node scripts/solar-apply.mjs --apply --api  # + pousse vers l'API (jeton requis)
 *   node scripts/solar-apply.mjs --api          # API seule, sans ecrire le fichier
 *
 * Env : SOLAR_API_BASE (defaut https://tekalis.onrender.com/api/v1),
 *       SOLAR_ADMIN_TOKEN (requis pour --api).
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(__dirname, "..");
const CSV_PATH = path.join(REPO_ROOT, "SOLAR_DATA_TO_FILL.csv");
const OVERRIDES_PATH = path.join(
  REPO_ROOT,
  "tekalis-frontend",
  "apps",
  "tekalis-next",
  "data",
  "solar-overrides.json"
);

const args = process.argv.slice(2);
const DO_APPLY = args.includes("--apply");
const DO_API = args.includes("--api");
const DRY_RUN = !DO_APPLY && !DO_API;

const RAW_BASE =
  (process.env.SOLAR_API_BASE || "https://tekalis.onrender.com/api/v1")
    .replace(/\/+$/, "")
    .replace(/\/api\/v1$/, "") + "/api/v1";
const ADMIN_TOKEN = process.env.SOLAR_ADMIN_TOKEN || "";

const FIELD_ORDER = [
  "role", "powerW", "voltageV", "capacityAh", "chemistry",
  "inverterContinuousW", "inverterPeakW", "systemVoltageV", "inverterType",
  "mpptMaxVocV", "mpptMaxA", "panelVocV", "panelVmpV", "cycles",
];

// Champs textuels valides (doivent correspondre aux enums du schema backend).
const ENUMS = {
  role: ["panel", "battery", "inverter", "controller", "kit", "accessory"],
  chemistry: ["gel", "agm", "lithium", "lead-acid"],
  inverterType: ["hybrid", "off-grid", "grid-tie", "converter"],
};

function parseCsv(text) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  if (!lines.length) return { headers: [], rows: [] };
  const headers = lines[0].split(",").map((h) => h.trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const l = lines[i];
    if (!l.trim()) continue;
    const cols = [];
    let cur = "";
    let inQ = false;
    for (let j = 0; j < l.length; j++) {
      const c = l[j];
      if (c === '"') {
        inQ = !inQ;
        continue;
      }
      if (c === "," && !inQ) {
        cols.push(cur);
        cur = "";
        continue;
      }
      cur += c;
    }
    cols.push(cur);
    const r = {};
    headers.forEach((h, idx) => (r[h] = cols[idx] ?? ""));
    rows.push(r);
  }
  return { headers, rows };
}

function toNum(v) {
  if (v === "" || v == null) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function toSolarObj(row) {
  const s = {};
  const skipped = [];
  for (const f of FIELD_ORDER) {
    const v = row[f];
    if (v === "" || v == null) continue;
    if (f === "role" || f === "chemistry" || f === "inverterType") {
      const allowed = ENUMS[f];
      const val = String(v).trim().toLowerCase();
      if (!allowed.includes(val)) {
        skipped.push(`${f}="${v}" (hors enum ${allowed.join("|")})`);
        continue;
      }
      s[f] = val;
      continue;
    }
    const n = toNum(v);
    if (n === undefined) {
      skipped.push(`${f}="${v}" (non numerique)`);
      continue;
    }
    if (n < 0) {
      skipped.push(`${f}=${n} (negatif)`);
      continue;
    }
    s[f] = n;
  }
  return { solar: Object.keys(s).length ? s : null, skipped };
}

async function pushToApi(slug, solar) {
  if (!ADMIN_TOKEN) {
    console.error(`[solar-apply] SOLAR_ADMIN_TOKEN manquant : skip API pour ${slug}`);
    return { ok: false, reason: "no-token" };
  }
  // L'API accepte l'ObjectId ou le slug sur /products/:id, mais l'update admin
  // est sur /admin/products/:id : on resout d'abord l'ObjectId via la vue publique.
  let id = slug;
  try {
    const res = await fetch(`${RAW_BASE}/products/${encodeURIComponent(slug)}`, {
      headers: { authorization: `Bearer ${ADMIN_TOKEN}` },
    });
    if (res.ok) {
      const j = await res.json();
      id = j?.data?._id || slug;
    }
  } catch {
    /* on tentera avec le slug */
  }
  try {
    const res = await fetch(`${RAW_BASE}/admin/products/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${ADMIN_TOKEN}`,
      },
      body: JSON.stringify({ solar }),
    });
    if (!res.ok) return { ok: false, reason: `HTTP ${res.status}` };
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e.message };
  }
}

async function main() {
  if (!fs.existsSync(CSV_PATH)) {
    console.error(`[solar-apply] CSV introuvable : ${CSV_PATH}`);
    process.exit(1);
  }
  const csv = fs.readFileSync(CSV_PATH, "utf8").replace(/^﻿/, "");
  const { rows } = parseCsv(csv);
  console.log(`[solar-apply] ${rows.length} lignes CSV | mode ${DRY_RUN ? "DRY-RUN" : DO_APPLY ? "APPLY" : "API-ONLY"}`);

  const changes = [];
  const skippedRows = [];

  for (const r of rows) {
    const slug = (r.slug || "").trim();
    if (!slug) {
      skippedRows.push("(ligne sans slug)");
      continue;
    }
    const { solar, skipped } = toSolarObj(r);
    if (skipped.length) console.log(`[solar-apply] ${slug} : champs ignores -> ${skipped.join(", ")}`);
    if (!solar) {
      skippedRows.push(`${slug} (aucun champ valide)`);
      continue;
    }
    changes.push({ slug, solar });
  }

  console.log(`[solar-apply] ${changes.length} produits a mettre a jour, ${skippedRows.length} ignores`);
  if (skippedRows.length) for (const s of skippedRows) console.log(`  - ${s}`);

  // --- Fichier d'overrides cote front -------------------------------------
  if (DO_APPLY) {
    let current = { _comment: "", overrides: {} };
    if (fs.existsSync(OVERRIDES_PATH)) {
      try {
        // Les fichiers ecrits par Windows/PowerShell peuvent porter un BOM UTF-8
        // qui fait echouer JSON.parse : on le retire avant de parser.
        const raw = fs.readFileSync(OVERRIDES_PATH, "utf8").replace(/^\uFEFF/, "");
        current = JSON.parse(raw);
      } catch (e) {
        console.error(`[solar-apply] ${OVERRIDES_PATH} illisible (${e.message}) : arret pour ne pas ecraser.`);
        process.exit(1);
      }
    }
    current._comment =
      "Overrides cote front (couche de donnees solaire). Indexe par slug produit. " +
      "Alimente par scripts/solar-apply.mjs a partir du CSV SOLAR_DATA_TO_FILL.csv valide. " +
      "Valeurs techniques a faire valider par un technicien (SOLAR_DECISIONS.md).";
    current.source = "SOLAR_DATA_TO_FILL.csv";
    current.importedAt = new Date().toISOString();
    current.overrides = current.overrides || {};
    for (const { slug, solar } of changes) {
      current.overrides[slug] = { ...(current.overrides[slug] || {}), ...solar };
    }
    fs.mkdirSync(path.dirname(OVERRIDES_PATH), { recursive: true });
    fs.writeFileSync(OVERRIDES_PATH, JSON.stringify(current, null, 2) + "\n", "utf8");
    console.log(`[solar-apply] ecrit : ${OVERRIDES_PATH} (${Object.keys(current.overrides).length} slugs)`);
  } else if (!DO_API) {
    for (const { slug, solar } of changes) {
      console.log(`  ${slug} -> ${JSON.stringify(solar)}`);
    }
  }

  // --- Poussee optionnelle vers l'API (admin) ------------------------------
  if (DO_API) {
    if (!ADMIN_TOKEN) {
      console.error("[solar-apply] --api demande mais SOLAR_ADMIN_TOKEN absent : arret.");
      process.exit(1);
    }
    let ok = 0;
    let ko = 0;
    for (const { slug, solar } of changes) {
      const res = await pushToApi(slug, solar);
      if (res.ok) ok++;
      else {
        ko++;
        console.error(`[solar-apply] ECHEC ${slug} : ${res.reason}`);
      }
    }
    console.log(`[solar-apply] API : ${ok} ok, ${ko} echec(s)`);
    if (ko) process.exit(1);
  }
}

main().catch((e) => {
  console.error(`[solar-apply] ERREUR : ${e.message}`);
  process.exit(1);
});
