/**
 * Améliorations éditoriales du blog — 5 actions, réversibles.
 *
 *   node --env-file=.env scripts/ameliorer-blog.js                     (simulation)
 *   node --env-file=.env scripts/ameliorer-blog.js --appliquer         (écrit)
 *   node --env-file=.env scripts/ameliorer-blog.js --titres --covers   (une section)
 *   node --env-file=.env scripts/ameliorer-blog.js --restaurer=<snapshot.json>
 *
 * La comparaison des deux lots d'archives a fait ressortir 5 défauts
 * mesurables, tous corrigés ici :
 *
 *  1. MAIL — 0 lien article->article dans tout le blog (16 articles). Les
 *     paires qui visent la même intention de recherche se concurrencent
 *     sans jamais se pointer. On ajoute un bloc « À lire aussi » en fin
 *     d'article, sur les paires à risque, le pilier et les orphelins.
 *  2. COVERS — 0/16 article n'a de coverImage : hero en bandeau sombre,
 *     JSON-LD `image: ""`, pas d'og:image. Un lien d'article partagé sur
 *     WhatsApp s'affiche en texte nu. On reprend l'image d'un produit
 *     réellement en base (les 180 produits ont une image Cloudinary).
 *  3. TITRES — 15/16 titres dépassent 60 caractères (Google tronque vers
 *     60), et 10/16 gardent un suffixe « | Tekalis » hérité de l'ancien
 *     import (regex trop gloutonne) alors que le front ajoute déjà
 *     « | Blog Tekalis » au titre SERP. Les 5 titres du lot 2 sont
 *     raccourcis — ils ne sont pas encore indexés, c'est le moment le
 *     moins cher. Le slug ne bouge pas : aucune URL ne change.
 *  4. ANCRAGE — le lot 2 ne cite aucune marque, aucun modèle, aucun lien
 *     /prix/ : il n'envoie vers aucune fiche produit. On ajoute un
 *     paragraphe « Sélection Tekalis » avec 1 à 2 liens produits réels.
 *  5. ANGLES — `ecouteurs-enceintes-...-pas-cher-dakar` (« pas chers »)
 *     et `ecouteurs-casque-choisir-senegal` (« sport, appels, gaming »)
 *     visent la même intention. Chacun annonce désormais son angle pour
 *     que Google n'ait pas à trancher à l'aveugle.
 *
 * Sûreté : chaque section est idempotente (elle retire ce qu'elle a posé
 * au tour précédent avant de re-poser) et n'écrit que si le résultat
 * diffère. Les sections ne se marchent pas les unes les autres : relancer
 * une seule d'entre elles ne touche pas aux blocs des autres. TOUS les
 * slugs produits/articles sont vérifiés avant la première écriture, et un
 * instantané JSON restaurable est déposé avant toute modification.
 */
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const Article = require("../models/Article");
const Product = require("../models/Product");

const SITE = "https://tekalis.com";
const SNAPSHOT_DIR = "C:\\Users\\hp\\AppData\\Local\\Temp\\opencode";
const APPLIQUER = process.argv.includes("--appliquer");
const RESTAURER = (process.argv.find((a) => a.startsWith("--restaurer=")) || "").split("=")[1];
const TOUTES = ["titres", "covers", "ancrage", "angles", "mail"];
const SECTIONS = TOUTES.filter((s) => {
  const drapeaux = process.argv.filter(
    (a) => a.startsWith("--") && !["--appliquer", "--restaurer"].some((d) => a.startsWith(d))
  );
  return drapeaux.length === 0 || drapeaux.includes(`--${s}`);
});
const MAX_TITRE = 60;

// ── 3. TITRES ───────────────────────────────────────────────────────────────
// Titres du lot 2, raccourcis sous 60 caractères en gardant le mot-clé.
//   avant : "Test d'autonomie smartphone à Dakar : quelle batterie tient vraiment une journée ?" (82)
const TITRES = {
  "test-autonomie-smartphone-dakar": "Test autonomie smartphone à Dakar : quelle batterie ?",
  "core-i3-i5-i7-quel-pc-choisir-senegal": "Core i3, i5 ou i7 : quel PC choisir au Sénégal ?",
  "electricite-senegal-economies-protection-appareils": "Électricité au Sénégal : choisir des appareils économes",
  "ecouteurs-casque-choisir-senegal": "Écouteurs ou casque : lequel choisir au Sénégal ?",
  "acheter-en-ligne-senegal-tekalis": "Acheter en ligne au Sénégal : comment Tekalis vous protège",
};

// Suffixe parasite laissé par l'ancien import sur 10 titres du lot 1.
const SUFFIXE_TEKALIS = /\s*\|\s*Tekalis(?:\s+Sénégal)?\s*$/;

// ── 2. COUVERTURES ──────────────────────────────────────────────────────────
// slug de l'article -> slug du produit dont l'image sert de couverture.
// « acheter en ligne » est une page de marque : pas de produit pertinent,
// on prend l'og:image du site (public/og-image.png, 1200x630).
const COUVERTURES = {
  "smartphones-2026-vraies-innovations-senegal": { produit: "samsung-galaxy-s21-5g-128-go-venant", alt: "Smartphone Samsung Galaxy S21 5G" },
  "acheter-telephone-en-ligne-dakar-guide": { produit: "iphone-12-mini-64-go-venant", alt: "Smartphone iPhone 12 Mini 64 Go" },
  "iphone-vs-android-senegal-2026": { produit: "samsung-galaxy-s10-plus-128-go-venant", alt: "Smartphone Samsung Galaxy S10+ 128 Go" },
  "choisir-pc-portable-teletravail-etudes-dakar": { produit: "hp-probook-450-g7-core-i5-10e-gen-8-go-256-go-ssd", alt: "PC portable HP ProBook 450 G7 Core i5" },
  "penurie-composants-prix-ordinateur-acheter-maintenant": { produit: "hp-elitebook-840-g8-core-i5-16-go-ram-512-go-ssd", alt: "Ordinateur portable HP EliteBook 840 G8" },
  "comment-bien-choisir-ses-produits-electroniques": { produit: "ecouteurs-sans-fil-bluetooth-tws-airpods-pro", alt: "Écouteurs sans fil Bluetooth" },
  "meilleur-smartphone-2026-guide-budget-senegal": { produit: "samsung-galaxy-a15-128-go-4-go", alt: "Smartphone Samsung Galaxy A15 128 Go" },
  "iphone-vs-samsung-2026-comparatif": { produit: "samsung-galaxy-a54-5g-128-go-8-go", alt: "Smartphone Samsung Galaxy A54 5G 128 Go" },
  "acheter-samsung-iphone-dakar-guide": { produit: "iphone-xs-max-64-go-venant", alt: "Smartphone iPhone XS Max 64 Go" },
  "telephone-moins-de-50000-fcfa-senegal": { produit: "samsung-galaxy-a14-128-go-4-go", alt: "Smartphone Samsung Galaxy A14 128 Go" },
  "ecouteurs-enceintes-bluetooth-pas-cher-dakar": { produit: "enceinte-portative-jbl-go-3", alt: "Enceinte portable JBL Go 3" },
  "test-autonomie-smartphone-dakar": { produit: "samsung-galaxy-a54-5g-128-go-8-go", alt: "Smartphone Samsung Galaxy A54 5G 128 Go" },
  "ecouteurs-casque-choisir-senegal": { produit: "casque-sans-fil-sony-wh-ch720n-anc", alt: "Casque sans fil Sony WH-CH720N à réduction de bruit" },
  "core-i3-i5-i7-quel-pc-choisir-senegal": { produit: "hp-elitebook-840-g8-core-i5-16-go-ram-512-go-ssd", alt: "Ordinateur HP EliteBook 840 G8 Core i5" },
  "electricite-senegal-economies-protection-appareils": { produit: "refrigerateur-combine-samsung-260l-no-frost", alt: "Réfrigérateur combiné Samsung 260L No Frost" },
  "acheter-en-ligne-senegal-tekalis": { url: `${SITE}/og-image.png`, alt: "Tekalis — boutique de technologie au Sénégal" },
};

// ── 4. ANCRAGE COMMERCIAL (lot 2) ───────────────────────────────────────────
// [slug produit, ancre, phrase] — un paragraphe « Sélection Tekalis ».
const ANCRAGE = {
  "test-autonomie-smartphone-dakar": [
    ["samsung-galaxy-a54-5g-128-go-8-go", "Samsung Galaxy A54 5G 128 Go", "une batterie de 5 000 mAh et un logiciel optimisé : c'est le profil-type pour terminer une journée avec 4G, GPS et streaming."],
  ],
  "core-i3-i5-i7-quel-pc-choisir-senegal": [
    ["hp-elitebook-840-g8-core-i5-16-go-ram-512-go-ssd", "HP EliteBook 840 G8 Core i5 / 16 Go / 512 Go SSD", "l'équilibre « Core i5 récent + 16 Go de RAM + SSD » décrit plus haut, pour les études, la comptabilité et le développement web."],
  ],
  "electricite-senegal-economies-protection-appareils": [
    ["refrigerateur-combine-samsung-260l-no-frost", "Réfrigérateur Combiné Samsung 260L No Frost", "un appareil dont l'étiquette énergie est le premier critère à comparer avant le prix — c'est lui qui décide de la facture sur plusieurs années."],
    ["convertisseur-onduleur-1000w-12v-vers-220v", "Convertisseur Onduleur 1000 W 12V vers 220V", "une solution de protection, à dimensionner sur la puissance totale de vos appareils et non sur un prix attractif."],
  ],
  "ecouteurs-casque-choisir-senegal": [
    ["casque-sans-fil-sony-wh-ch720n-anc", "casque Sony WH-CH720N à réduction de bruit", "le bon choix pour les appels et la musique ; pour le sport, les écouteurs sans fil compacts restent plus adaptés."],
  ],
  // « acheter en ligne » : page de marque, pas de produit pertinent — le seul
  // appel à l'action possible est vers la boutique, déjà présent en fin d'article.
};

// ── 5. ANGLES (désambiguïsation des 2 articles audio) ───────────────────────
const ANGLES = {
  "ecouteurs-enceintes-bluetooth-pas-cher-dakar": {
    marqueur: "<p><strong>Ce guide reste centré sur le budget.</strong>",
    html: "<p><strong>Ce guide reste centré sur le budget.</strong> Si vous cherchez plutôt l'équipement adapté à un usage précis — sport, appels professionnels, gaming — notre sélection par usage compare les profils.</p>",
  },
  "ecouteurs-casque-choisir-senegal": {
    marqueur: "<p><strong>Ce guide part de l'usage, pas du prix.</strong>",
    html: "<p><strong>Ce guide part de l'usage, pas du prix.</strong> Si votre critère principal est de payer le moins cher possible, notre sélection d'écouteurs et d'enceintes pas chers compare les budgets.</p>",
  },
};

// ── 1. MAILLAGE ─────────────────────────────────────────────────────────────
// slug de l'article -> slugs d'articles à lui proposer. Les 16 articles y
// passent, pour qu'aucun ne reste orphelin.
const MAIL = {
  "smartphones-2026-vraies-innovations-senegal": ["meilleur-smartphone-2026-guide-budget-senegal"],
  "acheter-telephone-en-ligne-dakar-guide": ["meilleur-smartphone-2026-guide-budget-senegal", "telephone-moins-de-50000-fcfa-senegal"],
  "iphone-vs-android-senegal-2026": ["iphone-vs-samsung-2026-comparatif", "acheter-samsung-iphone-dakar-guide"],
  "choisir-pc-portable-teletravail-etudes-dakar": ["core-i3-i5-i7-quel-pc-choisir-senegal", "penurie-composants-prix-ordinateur-acheter-maintenant"],
  "penurie-composants-prix-ordinateur-acheter-maintenant": ["choisir-pc-portable-teletravail-etudes-dakar"],
  "comment-bien-choisir-ses-produits-electroniques": ["meilleur-smartphone-2026-guide-budget-senegal", "core-i3-i5-i7-quel-pc-choisir-senegal", "ecouteurs-casque-choisir-senegal", "electricite-senegal-economies-protection-appareils"],
  "meilleur-smartphone-2026-guide-budget-senegal": ["test-autonomie-smartphone-dakar", "telephone-moins-de-50000-fcfa-senegal"],
  "iphone-vs-samsung-2026-comparatif": ["iphone-vs-android-senegal-2026", "acheter-samsung-iphone-dakar-guide"],
  "acheter-samsung-iphone-dakar-guide": ["iphone-vs-android-senegal-2026", "iphone-vs-samsung-2026-comparatif"],
  "telephone-moins-de-50000-fcfa-senegal": ["meilleur-smartphone-2026-guide-budget-senegal", "acheter-telephone-en-ligne-dakar-guide"],
  "ecouteurs-enceintes-bluetooth-pas-cher-dakar": ["ecouteurs-casque-choisir-senegal"],
  "test-autonomie-smartphone-dakar": ["meilleur-smartphone-2026-guide-budget-senegal"],
  "ecouteurs-casque-choisir-senegal": ["ecouteurs-enceintes-bluetooth-pas-cher-dakar"],
  "acheter-en-ligne-senegal-tekalis": ["acheter-telephone-en-ligne-dakar-guide"],
  "core-i3-i5-i7-quel-pc-choisir-senegal": ["choisir-pc-portable-teletravail-etudes-dakar"],
  "electricite-senegal-economies-protection-appareils": ["comment-bien-choisir-ses-produits-electroniques"],
};

const MARQUEUR_SELECTION = "<p><strong>Sélection Tekalis :</strong>";
const MARQUEUR_MAIL = "<h2>À lire aussi</h2>";

// ── helpers ─────────────────────────────────────────────────────────────────

// Mêmes balises que ALLOWED_TAGS dans tekalis-frontend/.../lib/sanitizeHtml.js.
// Toute balise hors de cette liste serait effacée au rendu : on refuse donc
// d'écrire un bloc que le front sabrerait.
const BALISES_AUTORISEES = new Set([
  "p", "br", "strong", "b", "em", "i", "u", "s", "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li", "a", "img", "blockquote", "code", "pre", "table", "thead",
  "tbody", "tr", "th", "td", "section", "div", "span", "hr", "mark", "small",
  "sup", "sub", "abbr", "cite", "q", "figure", "figcaption", "dl", "dt", "dd",
]);

// Vérifie qu'un bloc est équilibré et n'utilise que des balises autorisées.
// `depuis` : nombre de <p> déjà présents avant le bloc, pour que le compte
// reste juste quand on isole un extrait de milieu de document.
function controlerHtml(html, ou, depuis = 0) {
  const paires = [];
  for (const m of html.matchAll(/<(\/?)([a-zA-Z0-9]+)[^>]*>/g)) {
    const [, fermeture, nom] = m;
    if (!fermeture) {
      paires.push(nom);
    } else {
      const attendu = paires.pop();
      if (attendu !== nom) {
        paires.push(`ATTENDU </${attendu}>`);
        return `${ou} : balise non fermée ou mal imbriquée (</${nom}> alors que <${attendu || "rien"}> est ouvert)`;
      }
    }
  }
  if (paires.length) return `${ou} : balise(s) jamais fermée(s) -> ${paires.join(", ")}`;
  const interdites = [...html.matchAll(/<\/?([a-zA-Z0-9]+)/g)].map((m) => m[1].toLowerCase()).filter((t) => !BALISES_AUTORISEES.has(t));
  if (interdites.length) return `${ou} : balise(s) hors ALLOWED_TAGS -> ${[...new Set(interdites)].join(", ")}`;
  const ouvrants = (html.match(/<p[\s>]/g) || []).length + depuis;
  const fermants = (html.match(/<\/p>/g) || []).length + depuis;
  if (ouvrants !== fermants) return `${ou} : <p> déséquilibré (${ouvrants} ouvertes / ${fermants} fermées)`;
  if (/<script|javascript:|on\w+\s*=/i.test(html)) return `${ou} : contenu exécutable détecté`;
  return null;
}

// Le lot 1 est en \n, le lot 2 en \r\n. On détecte le séparateur de paragraphe
// réellement utilisé par l'article plutôt que de le supposer : sans ça, la
// phrase d'angle s'installe avec un seul saut de ligne là où tout le
// document en met deux, et le rendu s'en trouve inhomogène.
function separateur(html) {
  return (html.match(/\r\n/g) || []).length >= (html.match(/(?<!\r)\n/g) || []).length ? "\r\n" : "\n";
}

// Réduit toute suite de 3 sauts de ligne ou plus à un seul séparateur de
// paragraphe. Indispensable après un retrait de bloc : sinon le retrait
// laisse une ligne vide en trop et l'insertion suivante en ajoute une
// autre, ce qui fait grossir le document à chaque exécution.
// (?:\r?\n){3,} et non \n{3,} : ce dernier ne voit jamais trois \n d'affilée
// dans un texte en CRLF, puisque chaque \n est précédé d'un \r.
function nettoyer(html, nl) {
  return html.replace(/(?:\r?\n){3,}/g, nl + nl);
}

// Retire un bloc posé précédemment : du marqueur jusqu'à sa balise de fin.
function retirerBloc(html, marqueur, jusquaLaFin = false) {
  const i = html.indexOf(marqueur);
  if (i < 0) return html;
  const reste = jusquaLaFin
    ? html.slice(0, i)
    : (() => {
        const j = html.indexOf("</p>", i);
        return j < 0 ? html : html.slice(0, i) + html.slice(j + 4);
      })();
  return nettoyer(reste, separateur(html));
}

(async () => {
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000 });

  // ── Restauration d'un instantané ─────────────────────────────────────────
  if (RESTAURER) {
    if (!fs.existsSync(RESTAURER)) {
      console.error(`Instantané introuvable : ${RESTAURER}`);
      process.exit(1);
    }
    const snap = JSON.parse(fs.readFileSync(RESTAURER, "utf8"));
    for (const d of snap) {
      await Article.collection.updateOne(
        { _id: new mongoose.Types.ObjectId(d._id) },
        {
          $set: {
            title: d.title,
            content: d.content,
            coverImage: d.coverImage,
            metaTitle: d.metaTitle,
            updatedAt: new Date(d.updatedAt),
          },
        }
      );
    }
    console.log(`Restauré : ${snap.length} article(s) depuis ${RESTAURER}`);
    await mongoose.disconnect();
    process.exit(0);
  }

  // Uniquement les articles publiés : un brouillon ne doit jamais être
  // réécrit ni figer dans l'instantané.
  const articles = await Article.find({ status: "published" })
    .select("title slug content coverImage metaTitle updatedAt")
    .lean();
  const parSlug = new Map(articles.map((a) => [a.slug, a]));

  // ── Contrôles préalables : aucun slug fantôme, aucun titre trop long ─────
  const problemes = [];
  const produitsCites = new Set();
  for (const c of Object.values(COUVERTURES)) if (c.produit) produitsCites.add(c.produit);
  for (const liste of Object.values(ANCRAGE)) for (const [p] of liste) produitsCites.add(p);

  const produits = await Product.find({ slug: { $in: [...produitsCites] } }).select("slug images").lean();
  const parProduit = new Map(produits.map((p) => [p.slug, p]));
  for (const s of produitsCites) {
    if (!parProduit.has(s)) problemes.push(`produit introuvable : ${s}`);
    else if (!(parProduit.get(s).images || []).length || !parProduit.get(s).images[0].url) problemes.push(`produit sans image : ${s}`);
  }
  const exiger = (liste, quoi) => {
    for (const slug of Object.keys(liste)) if (!parSlug.has(slug)) problemes.push(`article absent (${quoi}) : ${slug}`);
  };
  exiger(MAIL, "maillage");
  exiger(COUVERTURES, "couverture");
  exiger(ANCRAGE, "ancrage");
  exiger(ANGLES, "angle");
  exiger(TITRES, "titre");
  for (const cible of Object.values(MAIL).flat()) if (!parSlug.has(cible)) problemes.push(`article absent (cible du maillage) : ${cible}`);
for (const [slug, t] of Object.entries(TITRES)) {
    if (t.length > MAX_TITRE) problemes.push(`titre > ${MAX_TITRE} car. : "${t}" (${t.length})`);
  }

  // ── État final, section par section ──────────────────────────────────────
  // Le titre retenu pour le libellé des liens « À lire aussi » est celui qui
  // sera réellement en base : le nouveau si la section titres tourne, sinon
  // l'ancien. Jamais un mélange des deux.
  const titresFinaux = new Map(
    articles.map((a) => [a.slug, SECTIONS.includes("titres") ? (TITRES[a.slug] || a.title.replace(SUFFIXE_TEKALIS, "").trim()) : a.title])
  );
  const imageProduit = (slug) => (parProduit.get(slug).images[0].url || "").replace(/^http:\/\//, "https://");

  const etatFinal = new Map();
  for (const a of articles) {
    let content = a.content;

    // Chaque section ne retire que SON propre bloc : relancer une seule
    // section ne peut pas effacer le travail des autres.
    if (SECTIONS.includes("mail")) content = retirerBloc(content, MARQUEUR_MAIL, true);
    if (SECTIONS.includes("ancrage")) content = retirerBloc(content, MARQUEUR_SELECTION);
    if (SECTIONS.includes("angles") && ANGLES[a.slug]) content = retirerBloc(content, ANGLES[a.slug].marqueur);

    if (SECTIONS.includes("angles") && ANGLES[a.slug]) {
      // Inséré après le 1er paragraphe : la phrase d'angle doit être lue
      // avant le développement, pas découverte en fin d'article.
      const fin = content.indexOf("</p>");
      const nl = separateur(content);
      content = `${content.slice(0, fin + 4)}${nl}${nl}${ANGLES[a.slug].html}${content.slice(fin + 4)}`;
    }

    if (SECTIONS.includes("ancrage") && ANCRAGE[a.slug]) {
      const liens = ANCRAGE[a.slug].map(([slugProd, ancre, phrase]) => `<a href="${SITE}/products/${slugProd}">${ancre}</a> — ${phrase}`);
      const nl = separateur(content);
      content = `${content}${nl}${nl}${MARQUEUR_SELECTION} ${liens.join(" ")}</p>`;
    }

    if (SECTIONS.includes("mail") && MAIL[a.slug]) {
      const items = MAIL[a.slug].map((s) => `<li><a href="${SITE}/blog/${s}">${titresFinaux.get(s)}</a></li>`).join(" ");
      const nl = separateur(content);
      content = `${content}${nl}${nl}${MARQUEUR_MAIL}${nl}${nl}<ul>${nl}  ${items}${nl}</ul>`;
    }

    // On nettoie aussi en fin de chaîne : un article déjà pollué par une
    // exécution antérieure se trouve réparé au passage.
    content = nettoyer(content, separateur(content));

    // On contrôle le document final, pas seulement nos blocs : c'est lui qui
    // sera stocké. Un article déjà bancal avant notre passage n'est pas notre
    // faute et ne doit pas bloquer l'opération.
    if (content !== a.content) {
      const avant = controlerHtml(a.content, `${a.slug} (avant)`);
      const apres = controlerHtml(content, `${a.slug} (apres)`);
      if (apres && apres !== avant) problemes.push(apres);
    }

    etatFinal.set(a.slug, {
      slug: a.slug,
      titreAvant: a.title,
      titreApres: titresFinaux.get(a.slug),
      coverAvant: a.coverImage,
      coverApres: COUVERTURES[a.slug] ? { url: COUVERTURES[a.slug].url || imageProduit(COUVERTURES[a.slug].produit), alt: COUVERTURES[a.slug].alt } : a.coverImage,
      contentApres: content,
      contentChange: content !== a.content,
    });
  }

  if (problemes.length) {
    console.error("=== CONTROLE IMPOSSIBLE ===\n" + problemes.map((p) => "  x " + p).join("\n"));
    process.exit(1);
  }

  // ── Rapport ──────────────────────────────────────────────────────────────
  const vals = [...etatFinal.values()];
  const coverChange = (e) => JSON.stringify(e.coverAvant) !== JSON.stringify(e.coverApres);
  console.log(`Sections : ${SECTIONS.join(", ")}   ·   ${APPLIQUER ? "ECRITURE" : "SIMULATION"}\n`);

  if (SECTIONS.includes("titres")) {
    const changed = vals.filter((e) => e.titreApres !== e.titreAvant);
    // Deux natures distinctes : une reformulation (lot 2, non indexé) et un
    // simple retrait de suffixe (lot 1, déjà indexé). Les compter ensemble
    // ferait croire à 16 reformulations alors qu'il n'y en a que 5.
    const reformules = changed.filter((e) => TITRES[e.slug]);
    const suffixes = changed.filter((e) => !TITRES[e.slug]);
    console.log(`── TITRES : ${changed.length} modifié(s) — ${reformules.length} reformulé(s) (lot 2), ${suffixes.length} suffixe retiré(s) (lot 1)`);
    const ligne = (e) => console.log(`   ${String(e.titreAvant.length).padStart(3)} -> ${String(e.titreApres.length).padStart(3)} car.  [${TITRES[e.slug] ? "formulation" : "suffixe"}]  ${e.slug}\n      - ${e.titreAvant}\n      + ${e.titreApres}`);
    reformules.forEach(ligne);
    suffixes.forEach(ligne);
    const longs = vals.filter((e) => e.titreApres.length > MAX_TITRE);
    if (longs.length) {
      console.log(`\n   Encore > ${MAX_TITRE} car. apres retrait du suffixe — lot 1, deja indexe :`);
      longs.forEach((e) => console.log(`      ${e.titreApres.length} car.  ${e.slug}\n         ${e.titreApres}`));
      console.log(`   Non raccourcis volontairement : une reformulation d'un titre deja indexe`);
      console.log(`   fait perdre du poids sur la requete et peutiques clics. A trancher avec vous.`);
    }
    console.log("");
  }

  if (SECTIONS.includes("covers")) {
    const changes = vals.filter(coverChange);
    console.log(`── COUVERTURES : ${changes.length} posee(s) / ${Object.keys(COUVERTURES).length} ciblee(s)`);
    changes.forEach((e) => console.log(`   ${e.slug}\n      ${e.coverApres.url}  [alt: ${e.coverApres.alt}]`));
    console.log("");
  }

  if (SECTIONS.includes("ancrage")) {
    const changes = vals.filter((e) => e.contentChange && ANCRAGE[e.slug]);
    const liens = Object.values(ANCRAGE).reduce((s, l) => s + l.length, 0);
    console.log(`── ANCRAGE : ${liens} lien(s) produit vers ${Object.keys(ANCRAGE).length} article(s)`);
    changes.forEach((e) => console.log(`   ${e.slug}\n      ${e.contentApres.slice(e.contentApres.indexOf(MARQUEUR_SELECTION)).split("</p>")[0]}`));
    console.log(`   non traite : acheter-en-ligne-senegal-tekalis (page de marque, pas de produit pertinent)`);
    console.log("");
  }

  if (SECTIONS.includes("angles")) {
    const changes = vals.filter((e) => e.contentChange && ANGLES[e.slug]);
    console.log(`── ANGLES : ${changes.length} article(s) desambiguise(s)`);
    changes.forEach((e) => console.log(`   ${e.slug}\n      ${ANGLES[e.slug].html}`));
    console.log("");
  }

  if (SECTIONS.includes("mail")) {
    const changes = vals.filter((e) => e.contentChange && MAIL[e.slug]);
    const liens = Object.values(MAIL).reduce((s, l) => s + l.length, 0);
    console.log(`── MAILLAGE : ${changes.length} bloc(s) « A lire aussi », ${liens} lien(s) article->article`);
    changes.forEach((e) => console.log(`   ${e.slug} -> ${MAIL[e.slug].join(", ")}`));
    console.log("");
  }

  const total = vals.filter((e) => e.titreApres !== e.titreAvant || coverChange(e) || e.contentChange).length;
  console.log(`${total} article(s) touche(s) au total.`);

  if (!APPLIQUER) {
    console.log("\n=== SIMULATION — rien n'a ete ecrit ===\nRelancez avec --appliquer.");
    await mongoose.disconnect();
    process.exit(0);
  }

  // ── Instantané restaurable, puis écriture ───────────────────────────────
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const snapPath = path.join(SNAPSHOT_DIR, `blog-avant-ameliorations-${stamp}.json`);
  fs.writeFileSync(
    snapPath,
    JSON.stringify(
      articles.map((a) => ({
        _id: a._id,
        slug: a.slug,
        title: a.title,
        content: a.content,
        coverImage: a.coverImage,
        metaTitle: a.metaTitle,
        updatedAt: a.updatedAt,
      })),
      null,
      1
    )
  );
  console.log(`\nInstantane : ${snapPath}`);
  console.log(`  restauration : node --env-file=.env scripts/ameliorer-blog.js --restaurer=${snapPath}`);

  let ecrits = 0;
  for (const [slug, e] of etatFinal) {
    const $set = {};
    if (SECTIONS.includes("titres") && e.titreApres !== e.titreAvant) {
      $set.title = e.titreApres;
      // Le titre long est conservé dans metaTitle : champ existant, pas encore
      // lu par le front, et rien n'est perdu si la formulation évolue.
      $set.metaTitle = e.titreAvant;
    }
    if (SECTIONS.includes("covers") && coverChange(e)) $set.coverImage = e.coverApres;
    if (e.contentChange) $set.content = e.contentApres;
    if (!Object.keys($set).length) continue;

    // findByIdAndUpdate (et non collection.updateOne) : mongoose met à jour
    // `updatedAt`, que le front publie en JSON-LD `modifiedTime`.
    await Article.findByIdAndUpdate(parSlug.get(slug)._id, { $set });
    ecrits++;
    console.log(`  [ok] /blog/${slug}  (${Object.keys($set).join(", ")})`);
  }
  console.log(`\nEcrit : ${ecrits} article(s).`);
  await mongoose.disconnect();
  process.exit(0);
})().catch((e) => { console.error("ERREUR :", e.message); process.exit(1); });
