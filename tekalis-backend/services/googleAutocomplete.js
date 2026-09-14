const SUGGEST_URL =
  "https://suggestqueries.google.com/complete/search";

// Délai entre chaque requête Google (ms) — évite le rate-limit
const FETCH_DELAY = 250;

// Seeds : termes de départ pour découvrir les recherches tendance au Sénégal
const DEFAULT_SEEDS = [
  // iPhone — prix
  "prix iphone 12", "prix iphone 13", "prix iphone 14", "prix iphone 15",
  "iphone pas cher dakar",
  // Samsung — prix
  "prix samsung galaxy s24", "prix samsung galaxy s23",
  "prix samsung galaxy a25", "prix samsung galaxy a55",
  "samsung pas cher senegal",
  // Intent d'achat
  "acheter iphone dakar", "acheter samsung dakar",
  "telephone pas cher senegal", "meilleur smartphone 2026",
  // Budget
  "telephone 30000 fcfa", "telephone 50000 fcfa", "telephone 100000 fcfa",
  // Comparatifs
  "meilleur telephone samsung", "iphone vs samsung",
  // Accessoires
  "ecouteur bluetooth pas cher", "coque iphone dakar",
  // Generiques
  "smartphone pas cher dakar", "prix telephone senegal",
];

// ── Fetch une seule seed ─────────────────────────────────────────────────────
async function fetchAutocomplete(query, { country = "sn", lang = "fr" } = {}) {
  const params = new URLSearchParams({
    client: "firefox",
    q: query,
    hl: lang,
    gl: country,
  });

  const res = await fetch(`${SUGGEST_URL}?${params}`, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
        "(KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    },
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) throw new Error(`Autocomplete ${res.status} for "${query}"`);

  const data = await res.json();
  // Format Firefox : [query, [suggestion1, suggestion2, ...]]
  if (!Array.isArray(data) || !Array.isArray(data[1])) return [];
  return data[1].filter((s) => typeof s === "string" && s.trim().length > 0);
}

// ── Délai utilitaire ─────────────────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Fetch toutes les seeds ───────────────────────────────────────────────────
async function fetchAllTrends(seeds = DEFAULT_SEEDS) {
  const allSuggestions = new Map(); // query → seed d'origine
  const errors = [];

  for (const seed of seeds) {
    try {
      const suggestions = await fetchAutocomplete(seed);
      for (const s of suggestions) {
        const normalized = s.toLowerCase().trim();
        if (!allSuggestions.has(normalized)) {
          allSuggestions.set(normalized, seed);
        }
      }
    } catch (err) {
      errors.push({ seed, error: err.message });
    }
    // Délai entre chaque requête
    await sleep(FETCH_DELAY);
  }

  const results = [];
  for (const [query, seed] of allSuggestions) {
    results.push({ query, seed, fetchedAt: new Date() });
  }

  return { results, errors, total: results.length };
}

// ── Seeds personnalisées (depuis l'admin) ────────────────────────────────────
// L'admin peut ajouter des seeds ; on les stocke dans la collection Trend
// avec le flag isSeed=true. On les merge avec les DEFAULT_SEEDS.

async function getActiveSeeds(TrendModel) {
  try {
    const customSeeds = await TrendModel.find({ isSeed: true })
      .select("query -_id")
      .lean();
    const custom = customSeeds.map((d) => d.query);
    // Merge sans doublons (insensible à la casse)
    const merged = new Set(DEFAULT_SEEDS.map((s) => s.toLowerCase()));
    for (const s of custom) {
      merged.add(s.toLowerCase());
    }
    return [...merged];
  } catch {
    return [...DEFAULT_SEEDS];
  }
}

module.exports = {
  DEFAULT_SEEDS,
  fetchAutocomplete,
  fetchAllTrends,
  getActiveSeeds,
};
