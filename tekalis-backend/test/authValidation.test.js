// ===============================================
// test/authValidation.test.js
//
// Les règles de validation de l'authentification : longueur et format du jeton
// de vérification, email du renvoi, mot de passe. C'est ce garde qui protège
// les endpoints publics d'une interrogation de base avec n'importe quelle
// chaîne, et d'un SMTP saturé par des emails mal formés.
// ===============================================
const test = require("node:test");
const assert = require("node:assert/strict");

const { authValidation } = require("../middlewares/validation");

// Applique une chaîne de middlewares à une requête factice et renvoie les
// erreurs accumulées. Sans ce petit harnais, il faudrait monter un Express
// complet et un serveur pour lire `validationResult`.
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

const messages = (errors) => errors.map((e) => e.msg);

// ── Vérification d'email ─────────────────────────────────────────────────────
test("verify-email accepte un jeton de longueur attendue", async () => {
  const token = "a".repeat(64);
  const errors = await runChain(authValidation.verifyEmail, { body: { token } });
  assert.equal(errors.length, 0, JSON.stringify(messages(errors)));
});

test("verify-email refuse un jeton vide", async () => {
  const errors = await runChain(authValidation.verifyEmail, { body: {} });
  assert.ok(errors.length > 0);
});

test("verify-email refuse un jeton trop court", async () => {
  // Borne le travail de hachage et évite d'interroger la base avec n'importe
  // quoi sur un endpoint public.
  const errors = await runChain(authValidation.verifyEmail, { body: { token: "abc" } });
  assert.ok(errors.length > 0);
});

test("verify-email refuse un jeton absurdement long", async () => {
  const errors = await runChain(authValidation.verifyEmail, {
    body: { token: "a".repeat(500) }
  });
  assert.ok(errors.length > 0);
});

// ── Renvoi de vérification ───────────────────────────────────────────────────
test("resend-verification exige un email valide", async () => {
  const errors = await runChain(authValidation.forgotPassword, { body: { email: "pas-un-email" } });
  assert.ok(errors.length > 0);
});

test("resend-verification accepte un email valide", async () => {
  const errors = await runChain(authValidation.forgotPassword, {
    body: { email: "awa@example.com" }
  });
  assert.equal(errors.length, 0, JSON.stringify(messages(errors)));
});

// ── Login / register ─────────────────────────────────────────────────────────
test("login exige email et mot de passe", async () => {
  const errors = await runChain(authValidation.login, { body: {} });
  assert.ok(errors.length >= 2, `attendu 2 erreurs, reçu ${errors.length}`);
});

test("register refuse un mot de passe trop court", async () => {
  const errors = await runChain(authValidation.register, {
    body: { name: "Awa", email: "awa@example.com", password: "123" }
  });
  assert.ok(errors.length > 0);
});

test("register accepte un formulaire valide", async () => {
  const errors = await runChain(authValidation.register, {
    body: { name: "Awa Diop", email: "awa@example.com", password: "Motdepasse1" }
  });
  assert.equal(errors.length, 0, JSON.stringify(messages(errors)));
});

// ── Reset de mot de passe ────────────────────────────────────────────────────
test("reset-password refuse un mot de passe trop court", async () => {
  const errors = await runChain(authValidation.resetPassword, {
    params: { token: "a".repeat(64) },
    body: { password: "123" }
  });
  assert.ok(errors.length > 0);
});

test("reset-password refuse un jeton trop court", async () => {
  const errors = await runChain(authValidation.resetPassword, {
    params: { token: "abc" },
    body: { password: "Motdepasse1" }
  });
  assert.ok(errors.length > 0);
});
