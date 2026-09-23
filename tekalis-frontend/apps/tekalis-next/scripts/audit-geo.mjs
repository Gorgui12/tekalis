/**
 * Audit GEO interne — analyse le HTML final produit par `next build`
 * (prérendu dans .next/server/app). Vérifie par page :
 *   - exactement 1 <h1>
 *   - présence de JSON-LD (application/ld+json)
 *   - présence de canonical
 *   - présence de meta description
 *   - absence d'attributs target="_blank" sans rel (sécurité)
 *
 * Next.js App Router stream le DOM dans des payloads RSC
 * (`self.__next_f.push([1,"..."])`) : on les décode pour réunir le
 * HTML réellement envoyé au navigateur / aux crawlers.
 *
 * Usage :  node scripts/audit-geo.mjs  [chemin-vers-.next]
 * Sortie : rapport texte + code de sortie (0 = OK, 1 = problèmes).
 */
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const BUILD_DIR = process.argv[2] || join(ROOT, ".next", "server", "app");

if (!existsSync(BUILD_DIR)) {
  console.error(`[audit] Dossier introuvable : ${BUILD_DIR}. Lancez d'abord "npm run build".`);
  process.exit(2);
}

/**
 * Décode les payloads RSC du form streaming Next.js.
 * Les segments `self.__next_f.push([1,"<json-escaped>"])` et les attributs
 * `d="< ...>"` (DOM stream) contiennent le JSX sérialisé. On RESTAURE les
 * fragments HTML que le client hydraterait, en convertissant les
 * tokens d'éléments (`["$","h1",null,{...}]`) en balises.
 */
function decodeRsc(html) {
  let decoded = "";

  const pushes = [...html.matchAll(/self\.__next_f\.push\(\[1,"((?:[^"\\]|\\.)*)"\]\)/g)];
  for (const m of pushes) {
    let segment;
    try {
      segment = JSON.parse(`"${m[1]}"`);
    } catch {
      segment = m[1];
    }
    decoded += segment;
  }

  // Attributs de streaming DOM (<script>d="..."</script> dans certains builds)
  const domAttrs = [...html.matchAll(/\bd="([^"]*)"/g)];
  for (const m of domAttrs) {
    let segment;
    try {
      segment = JSON.parse(`"${m[1]}"`);
    } catch {
      segment = m[1];
    }
    decoded += segment;
  }

  if (decoded.length === 0) decoded = html;
  return decoded;
}

// Convertit les tokens RSC d'éléments en balises approximatives pour compter les headings.
// La boundary globale app/not-found.jsx est présente dans le payload RSC de toutes les
// pages : son <h1>404</h1> est exclu.
function countHeadings(decoded, tag) {
  const tokens = decoded.match(new RegExp(`\\["\\$","${tag}",null,\\{([\\s\\S]{0,400}?)\\}\\]`, "g")) || [];
  const realTokens = tokens.filter((t) => !t.includes('"404"'));
  const raw = decoded.match(new RegExp(`<${tag}[\\s>]`, "g")) || [];
  return realTokens.length + raw.length;
}

function walk(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory() && entry !== "_not-found") {
      results.push(...walk(full));
    } else if (entry.endsWith(".html")) {
      results.push(full);
    }
  }
  return results;
}

// Routes privées / protégées — exclues du crawl par robots.txt (disallow),
// non destinées à l'indexation ni à la citabilité GEO. Elles ne comptent pas
// dans le score des pages indexables.
const NOINDEX_ROUTES = [
  "/admin", "/api", "/cart", "/checkout", "/login", "/register", "/profile",
  "/forgot-password", "/reset-password", "/wishlist", "/dashboard", "/payment",
  "/_not-found", "/not-found",
];
function isNoindex(route) {
  const p = route.startsWith("/") ? route : `/${route}`;
  return NOINDEX_ROUTES.some((prefix) => p === prefix || p.startsWith(prefix + "/"));
}

const pages = walk(BUILD_DIR);
const failures = [];
const summary = { pages: 0, indexable: 0, noH1: [], multiH1: [], noLdJson: [], noCanonical: [], noMetaDesc: [], unsafeBlank: [] };

for (const file of pages) {
  const route = relative(BUILD_DIR, file).replace(/\.html$/, "").replace(/\\/g, "/");
  const html = readFileSync(file, "utf8");
  summary.pages += 1;
  if (isNoindex(route)) continue;
  summary.indexable += 1;

  const decoded = decodeRsc(html);

  // Retire le contenu brut des JSON-LD pour ne pas compter leurs balises
  const stripped = decoded.replace(/<script[^>]*type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/g, "");

  const h1s = countHeadings(stripped, "h1");
  if (h1s === 0) summary.noH1.push(route);
  else if (h1s > 1) summary.multiH1.push(route);

  if (!/<script[^>]*type="application\/ld\+json"[^>]*>/.test(html)) summary.noLdJson.push(route);
  if (!/<link[^>]*rel="canonical"/.test(html)) summary.noCanonical.push(route);
  if (!/<meta[^>]*name="description"/.test(html)) summary.noMetaDesc.push(route);

  if (/target="_blank"(?![\s\S]*rel=)/.test(html) || /target="_blank"[^>]*href=/.test(html)) {
    const blanks = [...html.matchAll(/<a[^>]*target="_blank"[^>]*>/g)];
    const unsafe = blanks.some((m) => !m[0].includes("rel="));
    if (unsafe) summary.unsafeBlank.push(route);
  }
}

function push(label, list) {
  if (list.length > 0) {
    failures.push(`\n  ${label} (${list.length}):\n    - ${list.join("\n    - ")}`);
  }
}

push("Pages sans H1", summary.noH1);
push("Pages avec plusieurs H1", summary.multiH1);
push("Pages sans JSON-LD", summary.noLdJson);
push("Pages sans canonical", summary.noCanonical);
push("Pages sans meta description", summary.noMetaDesc);
push("Pages avec target=_blank sans rel", summary.unsafeBlank);

console.log(`\n=== Audit GEO Tekalis ===`);
console.log(`Pages HTML prérendues analysées : ${summary.pages} (dont ${summary.pages - summary.indexable} exclues des moteurs / noindex)`);
console.log(`Pages indexables auditées : ${summary.indexable}`);
console.log(`OK : ${summary.indexable - (summary.noH1.length + summary.multiH1.length)}/${summary.indexable} pages avec exactement 1 H1`);
console.log(`OK : ${summary.indexable - summary.noLdJson.length}/${summary.indexable} pages avec JSON-LD`);
console.log(`OK : ${summary.indexable - summary.noCanonical.length}/${summary.indexable} pages avec canonical`);
console.log(`OK : ${summary.indexable - summary.noMetaDesc.length}/${summary.indexable} pages avec meta description`);

if (failures.length > 0) {
  console.log(`\nPROBLÈMES DÉTECTÉS :${failures.join("")}\n`);
  process.exit(1);
}
console.log("\nAucun problème détecté.\n");