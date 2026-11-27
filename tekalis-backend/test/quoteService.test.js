const test = require("node:test");
const assert = require("node:assert/strict");
const zlib = require("node:zlib");
const { validationResult } = require("express-validator");
const {
  calculateQuoteTotals,
  generateQuotePdf,
  quotePdfFilename
} = require("../services/quotePdfService");
const { quoteValidation } = require("../middlewares/validation");

const decodePdfStreams = (pdf) => {
  const raw = pdf.toString("latin1");
  let decoded = "";
  for (const part of raw.split(/stream\r?\n/).slice(1)) {
    try {
      decoded += zlib.inflateSync(Buffer.from(part.split(/endstream/)[0], "latin1")).toString("latin1");
    } catch {
      decoded += part;
    }
  }
  return decoded;
};

const runChain = async (chain, body) => {
  const req = { body, params: {}, query: {} };
  for (const layer of chain) {
    if (layer.name === "validate") continue;
    await layer(req, {}, () => {});
  }
  return validationResult(req).array();
};

const quote = {
  _id: "507f1f77bcf86cd799439011",
  quoteNumber: "DEV-26-11-A1B2C3D4",
  createdAt: new Date("2026-11-27T10:00:00Z"),
  validUntil: new Date("2026-12-27T10:00:00Z"),
  company: "Solar Senegal",
  name: "Awa Diop",
  email: "awa@example.com",
  phone: "+221 78 634 69 46",
  message: "Estimation demandée pour l'éclairage du site.",
  subtotal: 100000,
  shippingCost: 0,
  total: 100000,
  items: [
    {
      product: "507f1f77bcf86cd799439012",
      name: "Panneau solaire 200 W",
      sku: "SOL-200",
      price: 50000,
      quantity: 2,
      lineTotal: 100000
    }
  ]
};

test("le seuil de livraison gratuite est appliqué sans promo ni taxe", () => {
  assert.deepEqual(calculateQuoteTotals(40000, null), {
    subtotal: 40000,
    shippingCost: 2500,
    total: 42500
  });
  assert.deepEqual(calculateQuoteTotals(50000, null), {
    subtotal: 50000,
    shippingCost: 0,
    total: 50000
  });
  assert.deepEqual(
    calculateQuoteTotals(15000, {
      shipping: { freeShippingThreshold: 10000, standardCost: 3000 }
    }),
    { subtotal: 15000, shippingCost: 0, total: 15000 }
  );
});

test("generateQuotePdf produit un buffer PDF avec la référence du devis", async () => {
  const pdf = await generateQuotePdf(quote);
  assert.ok(Buffer.isBuffer(pdf));
  assert.equal(pdf.subarray(0, 5).toString(), "%PDF-");
  const encodedReference = Buffer.from(quote.quoteNumber, "ascii").toString("hex").toUpperCase();
  assert.ok(decodePdfStreams(pdf).includes(encodedReference));
  assert.equal(quotePdfFilename(quote), "devis-DEV-26-11-A1B2C3D4.pdf");
});

const baseBody = {
  company: "Tekalis SARL",
  name: "Awa Diop",
  email: "awa@example.com",
  items: [{ product: "507f1f77bcf86cd799439011", quantity: 2 }]
};

test("quoteValidation accepte un tableau d'articles", async () => {
  const errors = await runChain(quoteValidation.create, baseBody);
  assert.equal(errors.length, 0, JSON.stringify(errors));
});

test("quoteValidation accepte une chaîne JSON d'articles (multipart)", async () => {
  const errors = await runChain(quoteValidation.create, {
    ...baseBody,
    items: JSON.stringify(baseBody.items)
  });
  assert.equal(errors.length, 0, JSON.stringify(errors));
});

test("quoteValidation accepte un message long sans article", async () => {
  const errors = await runChain(quoteValidation.create, {
    company: "Tekalis SARL",
    name: "Awa Diop",
    email: "awa@example.com",
    message: "Bonjour, nous souhaitons recevoir une estimation détaillée pour notre entreprise."
  });
  assert.equal(errors.length, 0, JSON.stringify(errors));
});

test("quoteValidation refuse un message court sans article", async () => {
  const errors = await runChain(quoteValidation.create, {
    company: "Tekalis SARL",
    name: "Awa Diop",
    email: "awa@example.com",
    message: "Bonjour"
  });
  assert.ok(errors.some((error) => error.path === "items"), JSON.stringify(errors));
});

test("quoteValidation refuse un JSON d'articles invalide", async () => {
  const errors = await runChain(quoteValidation.create, { ...baseBody, items: "{nope}" });
  assert.ok(errors.length > 0);
});

test("quoteValidation borne la quantité à 1000", async () => {
  const errors = await runChain(quoteValidation.create, {
    ...baseBody,
    items: [{ product: "507f1f77bcf86cd799439011", quantity: 1001 }]
  });
  assert.ok(errors.some((error) => error.path === "items[0].quantity"), JSON.stringify(errors));
});

test("quoteValidation refuse une source inconnue", async () => {
  const errors = await runChain(quoteValidation.create, { ...baseBody, source: "autre" });
  assert.ok(errors.some((error) => error.path === "source"), JSON.stringify(errors));
});
