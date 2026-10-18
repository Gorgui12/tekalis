#!/usr/bin/env node
/**
 * scripts/diagnostic-slugs-doublons.mjs
 *
 * Diagnostic des doublons de slug potentiels, sans modification.
 * Mode dry-run par defaut.
 */

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tekalis';

const ProductSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model('ProductDiag', ProductSchema, 'products');
const OrderSchema = new mongoose.Schema({ products: [] }, { strict: false });
const Order = mongoose.model('OrderDiag', OrderSchema, 'orders');

const TS_RE = /-\d{13}$/;

async function main() {
  console.log('Diagnostic slugs doublons — mode DRY-RUN');
  console.log('URI:', MONGODB_URI.replace(/\/\/.*@/, '//***@'));
  await mongoose.connect(MONGODB_URI);
  try {
    const products = await Product.find({}, { slug: 1, name: 1, status: 1 }).lean();
    console.log('Total:', products.length);
    const bySlug = new Map();
    for (const p of products) {
      const s = p.slug;
      if (!s) continue;
      bySlug.set(s, (bySlug.get(s) || 0) + 1);
    }
    const duplicates = [...bySlug.entries()].filter(([, c]) => c > 1);
    console.log('Doublons slug:', duplicates.length);
    if (duplicates.length > 0) console.log('Exemples:', duplicates.slice(0, 10));
    const ts = products.filter((p) => p.slug && TS_RE.test(p.slug));
    console.log('Avec suffixe timestamp:', ts.length);
    if (ts.length > 0) console.log('Exemples:', ts.slice(0, 10).map((x) => x.slug));
    const byName = new Map();
    for (const p of products) {
      const n = String(p.name || '').trim().toLowerCase();
      if (!n) continue;
      byName.set(n, (byName.get(n) || 0) + 1);
    }
    const nameDup = [...byName.entries()].filter(([, c]) => c > 1);
    console.log('Noms dupliques:', nameDup.length);
    const orders = await Order.find({}, { products: 1 }).lean();
    let refs = 0;
    for (const o of orders) { if (o.products) refs += o.products.length; }
    console.log('Commandes:', orders.length, 'lignes:', refs);
    console.log('DRY-RUN: aucun changement');
  } finally {
    await mongoose.disconnect();
  }
}
main().catch((e) => { console.error('ERR', e); process.exit(1); });
