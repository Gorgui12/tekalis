/**
 * Restauration des articles de blog depuis les copies HTML locales.
 *
 * Les fichiers contiennent un en-tête <!-- ... --> avec Titre SEO,
 * Meta description, URL suggérée (= slug d'origine) et Catégorie. On
 * réinjecte en base avec le slug EXACT pour préserver l'URL indexée Google.
 *
 * Les archives sont rangées par lots (blog/lot1, blog/lot2) :
 *   node --env-file=.env scripts/restaurer-articles.js --lot=lot2   (simulation)
 *   node --env-file=.env scripts/restaurer-articles.js --lot=lot2 --appliquer
 *
 * Deux formats d'archive, tous deux gérés :
 *  - l'en-tête est soit sur plusieurs lignes (lot1), soit sur UNE seule
 *    ligne (lot2) : les champs sont donc bornés par le libellé suivant,
 *    jamais par un retour à la ligne ;
 *  - un fichier peut contenir plusieurs articles (article5.html du lot2
 *    est la génération complète des 5) : on découpe sur l'en-tête et sur
 *    les marqueurs "ARTICLE n —".
 *
 * Prérequis : le hook pre-save de models/Article.js respecte désormais un
 * slug fourni (sinon il l'écrasait par une version dérivée du titre).
 *
 * Remplissage des excerpts manquants (indépendant des archives) :
 *   node --env-file=.env scripts/restaurer-articles.js --excerpts
 *   node --env-file=.env scripts/restaurer-articles.js --excerpts --appliquer
 *
 * SIMULATION par défaut. Écrire avec --appliquer.
 */
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const Article = require("../models/Article");
const User = require("../models/User");

const BLOG_DIR = "C:\\Users\\hp\\projets\\tekalis-corrige\\blog";
const LOT = (process.argv.find((a) => a.startsWith("--lot=")) || "--lot=lot1").split("=")[1].trim();
const LOT_DIR = path.join(BLOG_DIR, LOT);
const APPLIQUER = process.argv.includes("--appliquer");
const COMPLETER_EXCERPTS = process.argv.includes("--excerpts");

// Les catégories des fichiers sont libres (« Smartphones & Mobilité »…) ;
// le modèle impose une enum. On tranche article par article, ce qui compte
// pour le SEO interne : une page qui range tous les guides en "Actualités"
// n'aide ni le lecteur ni Google à parcourir le blog.
const CATEGORY_PAR_SLUG = {
  "smartphones-2026-vraies-innovations-senegal": "actualite",   // état du marché
  "acheter-telephone-en-ligne-dakar-guide": "tutoriel",          // guide anti-contrefaçon
  "iphone-vs-android-senegal-2026": "comparatif",
  "choisir-pc-portable-teletravail-etudes-dakar": "tutoriel",    // comment choisir
  "penurie-composants-prix-ordinateur-acheter-maintenant": "actualite", // marché / prix
  "comment-bien-choisir-ses-produits-electroniques": "tutoriel", // article pilier
  "meilleur-smartphone-2026-guide-budget-senegal": "tutoriel",   // sélection par budget
  "iphone-vs-samsung-2026-comparatif": "comparatif",
  "acheter-samsung-iphone-dakar-guide": "tutoriel",             // bons réflexes d'achat
  "telephone-moins-de-50000-fcfa-senegal": "tutoriel",          // sélection
  "ecouteurs-enceintes-bluetooth-pas-cher-dakar": "tutoriel",     // sélection

  // Lot 2 : quatre guides « comment choisir » + une page de confiance.
  // Le n°1 annonce un test d'autonomie mais ne donne aucun résultat mesuré
  // (que des critères) : on le classe tutoriel, pas "test", pour ne pas
  // annoncer une batterie testée qui ne l'a pas été.
  "test-autonomie-smartphone-dakar": "tutoriel",
  "core-i3-i5-i7-quel-pc-choisir-senegal": "tutoriel",
  "electricite-senegal-economies-protection-appareils": "tutoriel",
  "ecouteurs-casque-choisir-senegal": "tutoriel",
  "acheter-en-ligne-senegal-tekalis": "actualite",   // expérience e-commerce
};

// Deux liens internes du lot 2 visent des catégories qui n'existent pas sur le
// site (/category/computers, /category/home) : les archives ont été rédigées
// hors du catalogue réel. Un lien interne vers un 404 coûte du budget de
// crawl et fait perdre le lecteur, on les recale donc sur les catégories
// existantes (le lot 1 utilise déjà /category/ordinateurs pour ses articles PC).
const LIENS_CORRIGES = {
  "core-i3-i5-i7-quel-pc-choisir-senegal": [
    ["https://tekalis.com/category/computers", "https://tekalis.com/category/ordinateurs"],
  ],
  "electricite-senegal-economies-protection-appareils": [
    ["https://tekalis.com/category/home", "https://tekalis.com/category/electromenager"],
  ],
};

function categoriser(slug, titre, libelleSource) {
  if (CATEGORY_PAR_SLUG[slug]) return { cat: CATEGORY_PAR_SLUG[slug], choisi: "manuel" };
  const t = `${slug} ${titre}`.toLowerCase();
  if (/\bvs\b|comparatif|comparer/.test(t)) return { cat: "comparatif", choisi: "auto (vs)" };
  if (/guide|choisir|meilleur|moins-de|acheter|sélection/.test(t)) return { cat: "tutoriel", choisi: "auto (guide)" };
  if (libelleSource) return { cat: "actualite", choisi: `auto (${libelleSource})` };
  return { cat: "actualite", choisi: "auto (défaut)" };
}

// Champs de l'en-tête. Chaque motif s'arrête sur le libellé suivant (| Tekalis,
// Meta description, URL suggérée, Catégorie) et non sur la fin de ligne :
// c'est ce qui permet de lire aussi bien l'en-tête du lot1 (4 lignes) que
// celui du lot2 (1 ligne). Le suffixe « | Tekalis » manque sur certaines
// archives : le titre peut donc s'arrêter sur « Meta description ».
const CHAMPS = {
  titre: /Titre SEO\s*:\s*(.+?)(?=\s*\|\s*Tekalis\b|\s*Meta description)/i,
  meta: /Meta description(?:\s*\(\s*\d+\s*car\.\s*\))?\s*:\s*(.+?)(?=\s*URL\s+sugg|\s*Cat[ée]gorie\s*:|$)/i,
  slug: /URL\s+sugg[ée]r?[ée]e?\s*:\s*\/blog\/([^\s]+)/i,
  cat: /Cat[ée]gorie\s*:\s*(.+?)\s*$/i,
};

// Découpe un fichier en autant d'articles que d'en-têtes <!-- ... -->.
// Le contenu de chaque article s'arrête au marqueur "ARTICLE n" suivant
// (le titre de l'article est écrit AVANT son en-tête) : sans ça, le contenu
// du dernier article d'un fichier multi-articles embarquerait les suivants.
function decouperBlocs(text) {
  const marqueurs = [...text.matchAll(/^[ \t]*ARTICLE\s+\d+\b.*$/gm)].map((m) => m.index);
  const entetes = [...text.matchAll(/<!--([\s\S]*?)-->/g)];

  return entetes.map((m, i) => {
    const debut = m.index + m[0].length;
    const prochaine = entetes[i + 1];
    let fin = text.length;
    for (const p of marqueurs) if (p > debut && p < fin) fin = p;
    if (prochaine && prochaine.index < fin) fin = prochaine.index;
    return { entete: m[1], contenu: text.slice(debut, fin).trim() };
  });
}

function extraireFichier(file) {
  const text = fs.readFileSync(file, "utf8");

  return decouperBlocs(text).map(({ entete, contenu }) => {
    const champ = (cle) => {
      const m = entete.match(CHAMPS[cle]);
      return m ? m[1].trim() : "";
    };
    const titre = champ("titre");
    const slug = champ("slug");
    const cat = categoriser(slug, titre, champ("cat"));

    let content = contenu;
    const liensCorriges = [];
    for (const [de, vers] of LIENS_CORRIGES[slug] || []) {
      if (content.includes(de)) {
        content = content.split(de).join(vers);
        liensCorriges.push(`${de} → ${vers}`);
      }
    }

    return {
      file: path.basename(file),
      titre,
      meta: champ("meta"),
      slug,
      catLabel: champ("cat"),
      catEnum: cat.cat,
      catChoix: cat.choisi,
      liensCorriges,
      content,
    };
  });
}

(async () => {
  if (!COMPLETER_EXCERPTS && !fs.existsSync(LOT_DIR)) {
    console.error(`Lot introuvable : ${LOT_DIR}`);
    console.error(`Lots disponibles : ${fs.readdirSync(BLOG_DIR, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).join(", ")}`);
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000 });

  // ── Excerpts manquants ───────────────────────────────────────────────────
  // Le front lit `excerpt` (meta description SEO, JSON-LD, og:description,
  // encart « L'essentiel ») et jamais `metaDescription`, qui reste donc lettre
  // morte côté rendu. Les articles restaurés avant ce correctif n'ont pas
  // d'excerpt : leur description retombe sur le titre complet. On recopie la
  // méta déjà présente en base, sans toucher au reste du document — donc sans
  // toucher à updatedAt, la date de modification restant elle aussi honnête.
  if (COMPLETER_EXCERPTS) {
    const aCompleter = await Article.collection
      .find({
        $or: [{ excerpt: { $exists: false } }, { excerpt: "" }, { excerpt: null }],
        metaDescription: { $nin: [null, ""] },
      })
      .project({ slug: 1, title: 1, metaDescription: 1 })
      .toArray();

    console.log(`=== ${aCompleter.length} ARTICLE(S) SANS EXCERPT ===\n`);
    aCompleter.forEach((a) => {
      console.log(`  /blog/${a.slug}`);
      console.log(`      → ${a.metaDescription}`);
    });
    console.log("");

    if (!aCompleter.length) {
      console.log("Rien à faire.");
      await mongoose.disconnect();
      process.exit(0);
    }

    if (!APPLIQUER) {
      console.log("=== SIMULATION — rien n'a été écrit ===");
      console.log("Relancez avec --excerpts --appliquer pour remplir excerpt = metaDescription.");
      await mongoose.disconnect();
      process.exit(0);
    }

    console.log("=== REMPLISSAGE ===");
    for (const a of aCompleter) {
      await Article.collection.updateOne({ _id: a._id }, { $set: { excerpt: a.metaDescription } });
      console.log(`  ✅ /blog/${a.slug}`);
    }
    const restants = await Article.collection.countDocuments({
      $or: [{ excerpt: { $exists: false } }, { excerpt: "" }, { excerpt: null }],
    });
    console.log(`\nExcerpts remplis : ${aCompleter.length}   articles sans excerpt restants : ${restants}`);
    await mongoose.disconnect();
    process.exit(0);
  }

  console.log(`Lot : ${LOT}  (${LOT_DIR})\n`);

  const fichiers = fs.readdirSync(LOT_DIR).filter((f) => f.toLowerCase().endsWith(".html"));
  const lus = fichiers.flatMap((f) => extraireFichier(path.join(LOT_DIR, f)));

  // Un fichier peut répéter un article déjà présent dans un fichier voisin
  // (article5.html du lot2 = les 5 articles, dont 4 déjà fournis séparément) :
  // on garde la première occurrence et on n'alerte que si le contenu DIFFÈRE,
  // ce qui serait un vrai conflit de slug à trancher.
  const dejaVu = new Map();
  const articles = [];
  const redondants = [];
  for (const a of lus) {
    const cle = a.slug || `titre:${a.titre}`;
    const precedent = dejaVu.get(cle);
    if (!precedent) {
      dejaVu.set(cle, a);
      articles.push(a);
      continue;
    }
    if (precedent.titre === a.titre && precedent.content === a.content) {
      redondants.push(a);
    } else {
      articles.push(a);
      a.conflit = true;
    }
  }

  // Un slug déjà en base n'est pas une erreur : on l'affiche et on l'ignore
  // à l'écriture, ce qui rend une relance sans risque.
  const slugBase = new Set(
    (await Article.collection.find({ slug: { $in: articles.map((a) => a.slug).filter(Boolean) } }, { projection: { slug: 1 } }).toArray())
      .map((d) => d.slug)
  );
  articles.forEach((a) => { a.existe = slugBase.has(a.slug); });

  // Auteur : le seul compte restant
  const users = await User.find({}).select("_id email role").lean();
  const auteur = users.find((u) => u.role === "admin") || users[0];
  if (!auteur) {
    console.error("Aucun utilisateur en base pour servir d'auteur. Abandon.");
    process.exit(1);
  }
  console.log(`Auteur : ${auteur.email} (${auteur.role})\n`);

  // Sanity check : encodage, champs obligatoires, conflits
  // Marqueurs d'un fichier ré-encodé : Ã et Â n'existent pas en français, et
  // "â" suivi d'un tiret/crochet (â€™, â€œ) est la signature d'un UTF-8 lu
  // comme du Windows-1252. Un "â" français normal ne matche pas.
  const MOJIBAKE = /[\u00c3\u00c2\ufffd]|\u00e2[\u0080-\u009f\u20ac]/;
  let pb = 0;
  console.log("=== APERCU DES " + articles.length + " ARTICLES ===\n");
  articles.forEach((a, i) => {
    const mots = a.content.split(/\s+/).filter(Boolean).length;
    const accentCorrompu = MOJIBAKE.test(a.titre) || MOJIBAKE.test(a.meta);
    const flags = [];
    if (!a.slug) flags.push("SLUG MANQUANT");
    if (!a.titre) flags.push("TITRE MANQUANT");
    if (!a.content || mots < 50) flags.push(`CONTENU COURT (${mots} mots)`);
    if (accentCorrompu) flags.push("ACCENTS CORROMPUS");
    if (a.conflit) flags.push("CONFLIT : slug déjà pris par un autre contenu dans le lot");
    if (flags.length) pb++;

    console.log(`[${i + 1}] ${a.file}`);
    console.log(`    slug     : /blog/${a.slug || "(manquant)"}`);
    console.log(`    titre    : ${a.titre.slice(0, 70)}`);
    console.log(`    meta     : ${a.meta.length} car.`);
    console.log(`    catenum  : ${a.catEnum}   (${a.catChoix})`);
    console.log(`    contenu  : ${mots} mots, ${a.content.length} car.`);
    console.log(`    en base  : ${a.existe ? "OUI — ignoré à l'écriture" : "non"}`);
    a.liensCorriges.forEach((l) => console.log(`    lien     : ${l}`));
    if (flags.length) console.log(`    ⚠ ${flags.join(" | ")}`);
    console.log("");
  });

  // Un lien à corriger qui n'apparaît plus dans le contenu = map périmée.
  articles.forEach((a) => {
    (LIENS_CORRIGES[a.slug] || []).forEach(([de]) => {
      if (!a.liensCorriges.some((l) => l.startsWith(de))) {
        console.error(`  ⚠ ${a.slug} : lien à corriger introuvable (map à retirer ?) : ${de}`);
      }
    });
  });

  if (redondants.length) {
    console.log(`Doublons identiques (une même archive présente en double, ignorés) : ${redondants.length}`);
    redondants.forEach((a) => console.log(`  · ${a.file} → /blog/${a.slug}`));
    console.log("");
  }

  // Doublons de slug entre deux articles réellement différents
  const slugs = articles.map((a) => a.slug).filter(Boolean);
  const dupes = [...new Set(slugs.filter((s, i) => slugs.indexOf(s) !== i))];
  if (dupes.length) console.error("DOUBLONS DE SLUG :", dupes.join(", "));

  if (!APPLIQUER) {
    const pret = articles.filter((a) => !a.existe).length;
    console.log("=== SIMULATION — rien n'a été écrit ===");
    console.log(`Prêts à importer : ${pret}/${articles.length}`);
    if (pb) console.log(`À corriger d'abord : ${pb}`);
    console.log("\nRelancez avec --appliquer une fois le contenu validé.");
    await mongoose.disconnect();
    process.exit(0);
  }

  if (pb) {
    console.error(`\n${pb} article(s) ont un problème (voir ⚠). Corrigez avant d'écrire.`);
    process.exit(1);
  }

  // ── Import ───────────────────────────────────────────────────────────────
  console.log("=== IMPORT ===");
  const maintenant = new Date();
  const aEcrire = articles.filter((a) => !a.existe);
  let ok = 0;
  const echecs = [];
  for (const [i, a] of aEcrire.entries()) {
    try {
      // publishedAt décalé d'une minute par article : sinon les articles du
      // lot partagent le même horodatage et l'ordre du blog devient aléatoire
      // (le tri est un publishedAt desc sans second critère).
      const publishedAt = new Date(maintenant.getTime() - (aEcrire.length - 1 - i) * 60000);

      // insertOne : on court-circuite le pre-save pour garantir le slug
      // exact. createdAt/publishedAt alignés sur maintenant.
      await Article.collection.insertOne({
        title: a.titre,
        slug: a.slug,
        content: a.content,
        // Le front lit `excerpt` pour la meta description, la page JSON-LD et
        // l'encart « L'essentiel » ; `metaDescription` n'est jamais lu sur les
        // pages blog. On remplit donc les deux avec la même méta.
        excerpt: a.meta,
        metaTitle: a.titre,
        metaDescription: a.meta,
        category: a.catEnum,
        author: auteur._id,
        status: "published",
        publishedAt,
        readTime: Math.ceil(a.content.split(/\s+/).filter(Boolean).length / 250),
        viewCount: 0,
        isFeatured: false,
        isTest: false,
        tags: [],
        createdAt: maintenant,
        updatedAt: maintenant,
      });
      ok++;
      console.log(`  ✅ /blog/${a.slug}`);
    } catch (e) {
      echecs.push({ slug: a.slug, motif: e.code === 11000 ? "slug déjà pris" : e.message });
      console.log(`  ❌ /blog/${a.slug} : ${echecs[echecs.length - 1].motif}`);
    }
  }

  const total = await Article.countDocuments();
  console.log(`\nImportés : ${ok}/${articles.length}   ignorés (déjà en base) : ${articles.length - aEcrire.length}   total en base : ${total}`);
  await mongoose.disconnect();
  process.exit(0);
})().catch((e) => { console.error("ERREUR :", e.message); process.exit(1); });
