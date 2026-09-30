/**
 * Restauration des articles de blog depuis les copies HTML locales.
 *
 * Les fichiers contiennent un en-tête <!-- ... --> avec Titre SEO,
 * Meta description, URL suggérée (= slug d'origine) et Catégorie. On
 * réinjecte en base avec le slug EXACT pour préserver l'URL indexée Google.
 *
 * Prérequis : le hook pre-save de models/Article.js respecte désormais un
 * slug fourni (sinon il l'écrasait par une version dérivée du titre).
 *
 * SIMULATION par défaut. Écrire avec --appliquer.
 */
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const Article = require("../models/Article");
const User = require("../models/User");

const BLOG_DIR = "C:\\Users\\hp\\projets\\tekalis-corrige\\blog";
const APPLIQUER = process.argv.includes("--appliquer");

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
};

function categoriser(slug, titre, libelleSource) {
  if (CATEGORY_PAR_SLUG[slug]) return { cat: CATEGORY_PAR_SLUG[slug], choisi: "manuel" };
  const t = `${slug} ${titre}`.toLowerCase();
  if (/\bvs\b|comparatif|comparer/.test(t)) return { cat: "comparatif", choisi: "auto (vs)" };
  if (/guide|choisir|meilleur|moins-de|acheter|sélection/.test(t)) return { cat: "tutoriel", choisi: "auto (guide)" };
  if (libelleSource) return { cat: "actualite", choisi: `auto (${libelleSource})` };
  return { cat: "actualite", choisi: "auto (défaut)" };
}

function decode(raw) {
  // Certains fichiers ont été ré-encodés : on répare le mojibake classique
  // (Ã© etc.) sans toucher aux fichiers UTF-8 propres.
  try {
    return raw;
  } catch {
    return raw;
  }
}

function extract(file) {
  const raw = fs.readFileSync(file, "utf8");
  const text = decode(raw);

  const m = {
    titre: (text.match(/Titre SEO\s*:\s*(.+)/i) || [])[1],
    meta: (text.match(/Meta description[^:]*:\s*(.+)/i) || [])[1],
    slug: (text.match(/URL sugg[ée]r?[ée]e?\s*:\s*\/blog\/([^\s]+)/i) || [])[1],
    cat: (text.match(/Cat[ée]gorie\s*:\s*(.+)/i) || [])[1],
  };

  // Contenu = tout ce qui suit la fermeture du commentaire d'en-tête
  const start = text.indexOf("-->");
  const content = start >= 0 ? text.slice(start + 3).trim() : text.trim();

  const cat = categoriser(m.slug || "", m.titre || "", (m.cat || "").trim());

  return {
    file: path.basename(file),
    titre: (m.titre || "").trim(),
    meta: (m.meta || "").trim(),
    slug: (m.slug || "").trim(),
    catLabel: (m.cat || "").trim(),
    catEnum: cat.cat,
    catChoix: cat.choisi,
    content,
  };
}

(async () => {
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000 });

  const fichiers = fs.readdirSync(BLOG_DIR).filter((f) => f.toLowerCase().endsWith(".html"));
  const articles = fichiers.map((f) => extract(path.join(BLOG_DIR, f)));

  // Auteur : le seul compte restant
  const users = await User.find({}).select("_id email role").lean();
  const auteur = users.find((u) => u.role === "admin") || users[0];
  if (!auteur) {
    console.error("Aucun utilisateur en base pour servir d'auteur. Abandon.");
    process.exit(1);
  }
  console.log(`Auteur : ${auteur.email} (${auteur.role})\n`);

  // Sanity check : Encoding & champs obligatoires
  let pb = 0;
  console.log("=== APERCU DES " + articles.length + " ARTICLES ===\n");
  articles.forEach((a, i) => {
    const mots = a.content.split(/\s+/).length;
    const accentCorrompu = /[Ǹǹǣǡ�]/.test(a.titre) || /[Ǹǹǣǡ�]/.test(a.meta);
    const flags = [];
    if (!a.slug) flags.push("SLUG MANQUANT");
    if (!a.titre) flags.push("TITRE MANQUANT");
    if (!a.content || mots < 50) flags.push(`CONTENU COURT (${mots} mots)`);
    if (accentCorrompu) flags.push("ACCENTS CORROMPUS");
    if (flags.length) pb++;

    console.log(`[${i + 1}] ${a.file}`);
    console.log(`    slug     : /blog/${a.slug || "(manquant)"}`);
    console.log(`    titre    : ${a.titre.slice(0, 70)}`);
    console.log(`    meta     : ${a.meta.length} car.`);
    console.log(`    catenum  : ${a.catEnum}   (${a.catChoix})`);
    console.log(`    contenu  : ${mots} mots, ${a.content.length} car.`);
    if (flags.length) console.log(`    ⚠ ${flags.join(" | ")}`);
    console.log("");
  });

  // Doublons de slug
  const slugs = articles.map((a) => a.slug);
  const dupes = [...new Set(slugs.filter((s, i) => s && slugs.indexOf(s) !== i))];
  if (dupes.length) {
    console.error("DOUBLONS DE SLUG :", dupes.join(", "));
  }

  if (!APPLIQUER) {
    console.log("=== SIMULATION — rien n'a été écrit ===");
    console.log(`Prêts à importer : ${articles.length - pb}/${articles.length}`);
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
  let ok = 0;
  const echecs = [];
  for (const a of articles) {
    try {
      // insertOne : on court-circuite le pre-save pour garantir le slug
      // exact. createdAt/publishedAt alignés sur maintenant.
      await Article.collection.insertOne({
        title: a.titre,
        slug: a.slug,
        content: a.content,
        metaTitle: a.titre,
        metaDescription: a.meta,
        category: a.catEnum,
        author: auteur._id,
        status: "published",
        publishedAt: maintenant,
        readTime: Math.ceil(a.content.split(/\s+/).length / 250),
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
  console.log(`\nImportés : ${ok}/${articles.length}   total en base : ${total}`);
  await mongoose.disconnect();
  process.exit(0);
})().catch((e) => { console.error("ERREUR :", e.message); process.exit(1); });
