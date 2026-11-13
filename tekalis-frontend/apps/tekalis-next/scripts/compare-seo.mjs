#!/usr/bin/env node
import process from "node:process";

const DEFAULTS = {
  prod: "https://tekalis.com",
  preview: "http://localhost:8787",
  limit: 0,
  concurrency: 3,
  timeout: 30000,
};

function usage() {
  console.log(`
Usage: node scripts/compare-seo.mjs [options]

Options:
  --prod=<url>          Base de production (défaut: https://tekalis.com)
  --preview=<url>       Base du preview Cloudflare (défaut: http://localhost:8787)
  --limit=<n>           Nombre de pages à comparer (0 = toutes)
  --concurrency=<n>     Requêtes parallèles (défaut: 3)
  --timeout=<ms>        Timeout par requête (défaut: 30000)
  -h, --help            Affiche cette aide
`);
}

function parseArgs(argv) {
  const opts = { ...DEFAULTS };
  for (const arg of argv) {
    if (arg === "--help" || arg === "-h") {
      opts.help = true;
      continue;
    }
    const match = arg.match(/^--([^=]+)=(.*)$/);
    if (!match) continue;
    const [, key, value] = match;
    if (key === "prod" || key === "preview") {
      opts[key] = value.replace(/\/+$/, "");
    } else if (["limit", "concurrency", "timeout"].includes(key)) {
      opts[key] = Number(value);
    }
  }
  return opts;
}

function decodeEntities(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function stripTags(value) {
  return decodeEntities(value.replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractMeta(html, key) {
  const escaped = escapeRegExp(key);
  const patterns = [
    new RegExp(`<meta[^>]+(?:name|property)=["']${escaped}["'][^>]*content=["']([^"']*)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*(?:name|property)=["']${escaped}["']`, "i"),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return decodeEntities(match[1]).trim();
  }
  return "";
}

function extractSeo(html) {
  const title = decodeEntities((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "").trim());
  const canonical =
    html.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']*)["']/i)?.[1] ||
    html.match(/<link[^>]+href=["']([^"']*)["'][^>]*rel=["']canonical["']/i)?.[1] ||
    "";
  const h1 = stripTags(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || "");
  const jsonLd = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .filter((match) => match[1].trim())
    .length;
  return {
    title,
    description: extractMeta(html, "description"),
    robots: extractMeta(html, "robots"),
    canonical: decodeEntities(canonical).trim(),
    h1,
    jsonLd,
    ogTitle: extractMeta(html, "og:title"),
    ogImage: extractMeta(html, "og:image"),
  };
}

function normalize(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function truncate(value, max = 120) {
  const text = normalize(value);
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

async function fetchWithRetry(url, opts, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        redirect: "follow",
        headers: { "user-agent": "tekalis-seo-compare/1.0" },
        signal: AbortSignal.timeout(opts.timeout),
      });
      const text = await response.text();
      return { status: response.status, finalUrl: response.url, text };
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
  }
  throw lastError;
}

function parseSitemap(xml) {
  return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((match) => decodeEntities(match[1]));
}

function relativePath(url) {
  const parsed = new URL(url);
  return `${parsed.pathname}${parsed.search}`;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    usage();
    return 0;
  }

  console.log(`Production : ${opts.prod}`);
  console.log(`Preview    : ${opts.preview}`);

  const prodSitemap = await fetchWithRetry(`${opts.prod}/sitemap.xml`, opts);
  const previewSitemap = await fetchWithRetry(`${opts.preview}/sitemap.xml`, opts);
  const prodUrls = parseSitemap(prodSitemap.text);
  const previewUrls = parseSitemap(previewSitemap.text);

  console.log(`Sitemap prod    : ${prodUrls.length} URLs`);
  console.log(`Sitemap preview : ${previewUrls.length} URLs`);

  const prodSet = new Set(prodUrls);
  const previewSet = new Set(previewUrls);
  const missing = [...prodSet].filter((url) => !previewSet.has(url));
  const extra = [...previewSet].filter((url) => !prodSet.has(url));

  if (missing.length) {
    console.log(`\nURLs absentes du preview (${missing.length}) :`);
    for (const url of missing) console.log(`  - ${url}`);
  }
  if (extra.length) {
    console.log(`\nURLs en trop dans le preview (${extra.length}) :`);
    for (const url of extra) console.log(`  + ${url}`);
  }

  const targets = opts.limit > 0 ? prodUrls.slice(0, opts.limit) : prodUrls;
  const results = [];
  let cursor = 0;

  async function worker() {
    while (cursor < targets.length) {
      const index = cursor;
      cursor += 1;
      const url = targets[index];
      try {
        const path = relativePath(url);
        const [prodPage, previewPage] = await Promise.all([
          fetchWithRetry(url, opts),
          fetchWithRetry(`${opts.preview}${path}`, opts),
        ]);
        const prodSeo = extractSeo(prodPage.text);
        const previewSeo = extractSeo(previewPage.text);
        const diffs = [];

        if (prodPage.status !== previewPage.status) {
          diffs.push(`status ${prodPage.status} -> ${previewPage.status}`);
        }
        for (const key of ["title", "description", "robots", "canonical", "h1", "ogTitle", "ogImage"]) {
          if (normalize(prodSeo[key]) !== normalize(previewSeo[key])) {
            diffs.push(`${key}: "${truncate(prodSeo[key])}" -> "${truncate(previewSeo[key])}"`);
          }
        }
        if (prodSeo.jsonLd !== previewSeo.jsonLd) {
          diffs.push(`JSON-LD ${prodSeo.jsonLd} -> ${previewSeo.jsonLd}`);
        }

        results.push({ path, diffs });
        const state = diffs.length === 0 ? "OK" : "DIFF";
        console.log(`[${String(index + 1).padStart(3)}/${targets.length}] ${state} ${path}`);
        for (const diff of diffs) console.log(`       ${diff}`);
      } catch (error) {
        results.push({ path: relativePath(url), diffs: [`erreur: ${error.message}`] });
        console.log(`[${String(index + 1).padStart(3)}/${targets.length}] ERREUR ${relativePath(url)}`);
        console.log(`       ${error.message}`);
      }
    }
  }

  const workers = Array.from({ length: Math.max(1, Math.min(opts.concurrency, targets.length)) }, worker);
  await Promise.all(workers);

  const identical = results.filter((result) => result.diffs.length === 0).length;
  const different = results.filter((result) => result.diffs.length > 0).length;

  console.log("\nRésumé");
  console.log(`  Pages comparées : ${results.length}`);
  console.log(`  Identiques      : ${identical}`);
  console.log(`  Différentes     : ${different}`);
  console.log(`  Sitemap         : ${missing.length} manquantes, ${extra.length} en trop`);

  return missing.length + extra.length + different === 0 ? 0 : 1;
}

main()
  .then((code) => {
    process.exitCode = code;
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
