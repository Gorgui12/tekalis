/**
 * Export de sauvegarde TEKALIS — LECTURE SEULE.
 *
 * Ni mongodump ni mongosh ne sont installes sur cette machine, donc on
 * passe par mongoose. Ce script ne fait AUCUNE ecriture : il se contente
 * de lire chaque collection et de la vider en JSON Extended (fidele aux
 * ObjectId et aux dates).
 *
 * Lancement : node --env-file=.env tmp-export-sauvegarde.js
 */
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const OUT_ROOT = "C:\\Users\\hp\\Downloads";
const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const OUT = path.join(OUT_ROOT, `tekalis-sauvegarde-${stamp}`);

(async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI absente. Lancez avec --env-file=.env");
    process.exit(1);
  }

  // Nom de base effectif : non fourni dans l'URI -> "test" (defaut Mongo).
  const explicit = uri.match(/mongodb(\+srv)?:\/\/[^/]+\/([^?\s]*)/);
  const dbName = explicit && explicit[2] ? explicit[2] : "test";
  console.log(`Base cible : ${dbName}`);
  console.log(`Sortie    : ${OUT}\n`);

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
  const db = mongoose.connection.db;
  fs.mkdirSync(OUT, { recursive: true });

  const collections = (await db.listCollections().toArray()).map((c) => c.name);
  const report = { exportedAt: new Date().toISOString(), db: dbName, collections: {} };

  for (const name of collections) {
    const count = await db.collection(name).countDocuments();
    if (count === 0) {
      report.collections[name] = { count: 0, note: "collection vide" };
      console.log(`  ${name.padEnd(22)} 0 document      (vide)`);
      continue;
    }
    const docs = await db.collection(name).find({}).toArray();
    const file = path.join(OUT, `${name}.json`);
    fs.writeFileSync(file, JSON.stringify(docs, null, 2), "utf8");
    const size = (fs.statSync(file).size / 1024).toFixed(1);
    report.collections[name] = { count, file: `${name}.json`, sizeKb: Number(size) };
    console.log(`  ${name.padEnd(22)} ${String(count).padStart(6)} documents  ${size} Ko`);
  }

  // Version allegee et lisible des produits, pour verifier d'un coup d'oeil.
  if (report.collections.products?.count) {
    const produits = await db.collection("products")
      .find({}, { projection: { name: 1, slug: 1, price: 1, stock: 1, brand: 1 } })
      .sort({ name: 1 }).toArray();
    fs.writeFileSync(
      path.join(OUT, "produits-resume.json"),
      JSON.stringify(produits.map((p) => ({
        id: String(p._id),
        name: p.name,
        slug: p.slug,
        price: p.price,
        stock: p.stock,
        brand: p.brand,
      })), null, 2),
      "utf8"
    );
    console.log(`\n  resume produits : produits-resume.json`);
  }

  fs.writeFileSync(path.join(OUT, "_RAPPORT.json"), JSON.stringify(report, null, 2), "utf8");

  const total = Object.values(report.collections).reduce((s, c) => s + c.count, 0);
  console.log(`\n${total} documents exportes au total.`);
  console.log(`Copiez ce dossier hors du PC : C:\\Users\\hp\\Downloads\\tekalis-sauvegarde-${stamp}`);
  await mongoose.disconnect();
  process.exit(0);
})().catch((e) => { console.error("ERREUR :", e.message); process.exit(1); });
