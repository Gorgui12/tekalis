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

  // Ordinateurs
  "prix ordinateur portable dakar", "ordinateur portable pas cher senegal",
  "prix pc portable dakar", "pc portable pas cher senegal",
  "meilleur pc portable 2026", "meilleur ordinateur portable 2026",
  "laptop hp prix dakar", "ordinateur hp elitebook prix",
  "prix pc fixe dakar", "pc pas cher 150000 fcfa",
  "ordinateur portable 8 go ram pas cher", "prix ordinateur dell dakar",
  "ordinateur portable ssd 256 go prix", "ordinateur reconditionne dakar",

  // Gaming
  "prix ps5 dakar", "playstation 5 pas cher senegal", "prix xbox series senegal",
  "console ps5 prix fcfa", "manette ps5 prix dakar", "manette bluetooth pas cher senegal",
  "casque gaming pas cher dakar", "prix pc gaming dakar", "pc gamer prix senegal",
  "gamepad pc pas cher", "prix xbox senegal", "ecran gamer 144hz prix",
  "console de jeux pas cher dakar",

  // Tablettes
  "prix ipad dakar", "ipad pas cher senegal", "meilleure tablette 2026",
  "prix tablette android dakar", "tablette android pas cher senegal",
  "tablette 100000 fcfa", "prix tablette 8 pouces dakar", "tablette pas cher 50000 fcfa",

  // TV
  "prix smart tv dakar", "smart tv pas cher senegal", "tv 4k pas cher dakar",
  "meilleure tv 2026", "meilleure marque de tv senegal", "prix tv 43 pouces dakar",
  "prix tv 55 pouces senegal", "tv 32 pouces pas cher", "television pas cher dakar",
  "tv smart 50000 fcfa", "prix tv 42 pouces dakar", "tv lg prix senegal",
  "ecran tv pas cher dakar",

  // Électroménager
  "prix refrigerateur dakar", "refrigerateur pas cher senegal",
  "prix machine a laver dakar", "machine a laver pas cher senegal",
  "meilleur refrigerateur 2026", "prix frigo senegal", "prix micro onde dakar",
  "micro onde pas cher senegal", "prix cuisiniere dakar", "cuisiniere pas cher senegal",
  "prix mixeur dakar", "meilleure machine a laver 2026",
  "refrigerateur 200 litres prix", "electromenager pas cher dakar",

  // Climatiseurs
  "prix climatiseur dakar", "climatiseur pas cher senegal", "meilleur climatiseur 2026",
  "prix climatiseur 1.5 cv", "climatiseur 9000 btu prix", "climatiseur split dakar",
  "climatiseur inverter pas cher", "installation climatiseur dakar", "prix clim dakar",
  "climatiseur 12000 btu prix", "meilleur climatiseur senegal", "climatiseur neuf pas cher",

  // Ventilation
  "prix ventilateur dakar", "ventilateur pas cher senegal", "meilleur ventilateur 2026",
  "ventilateur sur pied prix", "prix ventilateur plafonnier dakar", "ventilateur electrique pas cher",

  // Audio
  "prix enceinte bluetooth dakar", "enceinte bluetooth pas cher senegal",
  "casque bluetooth pas cher senegal", "meilleur casque audio 2026",
  "casque sans fil prix dakar", "enceinte portable pas cher", "prix jbl dakar",
  "enceinte jbl prix senegal", "sonorisation pas cher dakar",
  "meilleures enceintes bluetooth senegal", "prix beats dakar",
  "casque sans fil pas cher dakar", "barre de son pas cher dakar", "micro casque pas cher dakar",

  // Énergie solaire
  "prix panneau solaire dakar", "panneau solaire pas cher senegal",
  "prix onduleur solaire dakar", "kit solaire prix senegal", "meilleur panneau solaire 2026",
  "batterie solaire prix dakar", "panneau solaire 300w prix", "prix installation panneau solaire dakar",

  // Réseau
  "prix routeur wifi dakar", "routeur wifi pas cher senegal", "meilleur routeur 2026",
  "prix modem wifi senegal", "repeater wifi pas cher dakar", "routeur fibre pas cher senegal",
  "prix switch reseau dakar",

  // Mobilité / batteries
  "prix power bank dakar", "power bank pas cher senegal", "batterie externe pas cher dakar",
  "meilleure batterie externe 2026", "chargeur portable pas cher senegal", "powerbank 20000mah prix",
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
