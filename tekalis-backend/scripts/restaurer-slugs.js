/**
 * Migration des slugs TEKALIS — via mongoose, comme l'API le ferait.
 *
 * Pourquoi ne pas passer par le script navigateur : Chrome bloque le collage
 * dans la console. L'API fait exactement `findByIdAndUpdate({slug})`, donc
 * un `updateOne({ $set: { slug } })` est equivalent au caractere pres : aucun
 * autre champ n'est touche, les timestamps Mongoose sont preserves.
 *
 * Utilisation :
 *   node --env-file=.env scripts/restaurer-slugs.js            (simulation)
 *   node --env-file=.env scripts/restaurer-slugs.js --appliquer (ecriture)
 */
const mongoose = require("mongoose");
const Product = require("../models/Product");
const fs = require("fs");
const path = require("path");

const TS = /-\d{13}$/;
const APPLIQUER = process.argv.includes("--appliquer");

(async () => {
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
  const produits = await Product.find({}).select("name slug").lean();

  const aCorriger = produits
    .map((p) => ({ id: p._id, name: p.name, current: p.slug, cible: p.slug.replace(TS, "") }))
    .filter((x) => TS.test(x.current || ""));

  const slugOccupe = new Set(produits.map((p) => p.slug));
  const parCible = new Map();
  for (const x of aCorriger) {
    if (!parCible.has(x.cible)) parCible.set(x.cible, []);
    parCible.get(x.cible).push(x);
  }

  const lisibles = [];
  const ecartes = [];
  for (const x of aCorriger) {
    if (parCible.get(x.cible).length > 1) {
      const deja = ecartes.find((e) => e.cible === x.cible);
      if (deja) deja.membres.push(x);
      else ecartes.push({ cible: x.cible, membres: [x] });
      continue;
    }
    if (slugOccupe.has(x.cible)) {
      ecartes.push({ cible: x.cible, membres: [x], dejaPris: true });
      continue;
    }
    lisibles.push(x);
  }

  console.log(`produits total     : ${produits.length}`);
  console.log(`avec suffixe       : ${aCorriger.length}`);
  console.log(`restauration sure  : ${lisibles.length}`);
  console.log(`ecartes           : ${ecartes.reduce((s, e) => s + e.membres.length, 0)}\n`);

  if (ecartes.length) {
    console.log("=== ECARTES (laisses tels quels) ===");
    for (const e of ecartes) {
      console.log(`  cible : ${e.cible}${e.dejaPris ? "  (deja pris)" : "  (deux produits en conflit)"}`);
      e.membres.forEach((m) => console.log(`     - ${m.name}   (actuel : ${m.current})`));
    }
    console.log("");
  }

  // Controle d'integrite avant toute ecriture
  const cibles = lisibles.map((x) => x.cible);
  const doublons = [...new Set(cibles.filter((s, i, a) => a.indexOf(s) !== i))];
  if (doublons.length) {
    console.error("BLOQUANT : doublons dans le lot retenu. Abandon.");
    process.exit(1);
  }
  if (lisibles.length + ecartes.reduce((s, e) => s + e.membres.length, 0) !== aCorriger.length) {
    console.error("BLOQUANT : comptage incoherent. Abandon.");
    process.exit(1);
  }

  // Fichier de rollback, ecrit AVANT la migration
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const rbDir = "C:\\Users\\hp\\Downloads";
  const rbFile = path.join(rbDir, `tekalis-slugs-rollback-${stamp}.json`);
  fs.writeFileSync(
    rbFile,
    JSON.stringify(
      { at: new Date().toISOString(), changes: lisibles.map((x) => ({ id: String(x.id), slugAvant: x.current, slugApres: x.cible })) },
      null, 2
    ),
    "utf8"
  );
  console.log(`Rollback ecrit : ${rbFile}\n`);

  if (!APPLIQUER) {
    console.log("=== SIMULATION — rien n'a ete ecrit. ===");
    lisibles.slice(0, 6).forEach((x) => {
      console.log(`  ${x.name}`);
      console.log(`    avant : /products/${x.current}`);
      console.log(`    apres : /products/${x.cible}`);
    });
    console.log(`\n  ... ${lisibles.length - 6} autres`);
    console.log("\nRelancez avec --appliquer pour ecrire en base.");
    await mongoose.disconnect();
    process.exit(0);
  }

  // ── Ecriture ─────────────────────────────────────────────────────────────
  console.log("=== APPLICATION ===");
  let ok = 0;
  const echecs = [];
  for (let i = 0; i < lisibles.length; i++) {
    const x = lisibles[i];
    try {
      const r = await Product.updateOne({ _id: x.id, slug: x.current }, { $set: { slug: x.cible } });
      // Le filtre contient l'ancien slug : si le produit a change entre-temps,
      // le update ne matche pas et on ne l'ecrase pas.
      if (r.modifiedCount === 1) ok++;
      else echecs.push({ ...x, motif: "produit modifie entre-temps" });
    } catch (e) {
      echecs.push({ ...x, motif: e.code === 11000 ? "slug deja pris" : e.message });
    }
    if ((i + 1) % 30 === 0) console.log(`  ${i + 1}/${lisibles.length}...`);
  }

  // ── Verification par relecture ───────────────────────────────────────────
  const apres = await Product.find({}).select("name slug").lean();
  const restants = apres.filter((p) => TS.test(p.slug || ""));
  const collisionFinale = new Set();
  const vus = new Set();
  for (const p of apres) {
    if (vus.has(p.slug)) collisionFinale.add(p.slug);
    vus.add(p.slug);
  }

  console.log("\n=== RESULTAT ===");
  console.log(`  modifies avec succes : ${ok}/${lisibles.length}`);
  console.log(`  echecs               : ${echecs.length}`);
  echecs.forEach((e) => console.log(`     ! ${e.name} : ${e.motif}`));
  console.log(`\n  VERIFICATION PAR RELECTURE`);
  console.log(`  produits total           : ${apres.length}`);
  console.log(`  portant encore un suffixe: ${restants.length} (attendu ${ecartes.reduce((s, e) => s + e.membres.length, 0)})`);
  console.log(`  slugs en double          : ${collisionFinale.size} ${collisionFinale.size ? "=> PROBLEME" : "=> OK"}`);

  const cibleAtteinte = restants.length === ecartes.reduce((s, e) => s + e.membres.length, 0) && collisionFinale.size === 0;
  console.log(cibleAtteinte
    ? `\n=> MIGRATION REUSSIE : ${ok} URL restaurees a l identique.`
    : `\n=> A VERIFIER : le resultat ne correspond pas aux predictions.`);

  console.log("\nExemples d'URL desormais valides :");
  lisibles.slice(0, 5).forEach((x) => console.log(`  https://tekalis.com/products/${x.cible}`));

  await mongoose.disconnect();
  process.exit(0);
})().catch((e) => { console.error("ERREUR :", e.message); process.exit(1); });
