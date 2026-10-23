const mongoose = require("mongoose");
const Product = require("../models/Product");

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI manquante. Utiliser: node --env-file=.env scripts/maj-prix-plus20.js");
    process.exit(1);
  }
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
  console.log("Connecté à MongoDB");

  const round500 = (v) => Math.round(v / 500) * 500;

  const cursor = Product.find({}, { price: 1, comparePrice: 1, name: 1 }).cursor();
  let updated = 0;
  const sample = [];
  for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
    const oldPrice = Number(doc.price) || 0;
    const newPrice = round500(oldPrice * 1.20);
    const oldCP = doc.comparePrice != null ? Number(doc.comparePrice) : null;
    const newCP = oldCP != null && oldCP > 0 ? round500(oldCP * 1.40) : oldCP;

    const needsUpdate = (oldPrice !== newPrice) || (newCP !== oldCP);
    if (needsUpdate) {
      const updateSet = { price: newPrice };
      if (newCP !== oldCP) {
        updateSet.comparePrice = newCP;
      }
      await Product.updateOne({ _id: doc._id }, { $set: updateSet });
      updated++;
    }
    if (sample.length < 10) {
      sample.push({
        name: doc.name,
        price_old: oldPrice,
        price_new: newPrice,
        comparePrice_old: oldCP,
        comparePrice_new: newCP
      });
    }
  }
  await cursor.close();
  console.log("Terminé");
  console.log("Produits mis à jour:", updated);
  console.log("Aperçu:", JSON.stringify(sample, null, 2));
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("ERREUR:", err.message);
  process.exit(1);
});
