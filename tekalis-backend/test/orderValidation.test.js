// ===============================================
// test/orderValidation.test.js
//
// Le checkout invité ajoute un email facultatif (confirmation de commande).
// Ces tests garantissent que son absence ne bloque jamais la commande et
// qu'une valeur mal formée est bien rejetée.
// ===============================================
const test = require("node:test");
const assert = require("node:assert/strict");

const { orderValidation } = require("../middlewares/validation");

const runChain = async (chain, { body = {}, params = {} } = {}) => {
  const req = { body, params, query: {} };
  let errors = [];

  for (const layer of chain) {
    if (layer.name === "validate") {
      errors = errors.concat(
        // eslint-disable-next-line global-require
        require("express-validator").validationResult(req).array()
      );
      continue;
    }
    await layer(req, {}, () => {});
  }

  return errors;
};

const baseOrder = {
  products: [{ product: "507f1f77bcf86cd799439011", quantity: 1 }],
  deliveryName: "Awa Diop",
  deliveryPhone: "771234567",
  deliveryAddress: "Cité Keur Gorgui, villa 12",
  paymentMethod: "cash",
};

test("une commande invité sans email est valide", async () => {
  const errors = await runChain(orderValidation.create, { body: baseOrder });
  assert.equal(errors.length, 0, JSON.stringify(errors));
});

test("une commande accepte un email de livraison valide", async () => {
  const errors = await runChain(orderValidation.create, {
    body: { ...baseOrder, deliveryEmail: "awa@example.com" },
  });
  assert.equal(errors.length, 0, JSON.stringify(errors));
});

test("un email de livraison vide est ignoré", async () => {
  const errors = await runChain(orderValidation.create, {
    body: { ...baseOrder, deliveryEmail: "" },
  });
  assert.equal(errors.length, 0, JSON.stringify(errors));
});

test("un email de livraison mal formé est refusé", async () => {
  const errors = await runChain(orderValidation.create, {
    body: { ...baseOrder, deliveryEmail: "pas-un-email" },
  });
  assert.ok(errors.length > 0);
});
