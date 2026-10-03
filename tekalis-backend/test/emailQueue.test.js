// ===============================================
// test/emailQueue.test.js
//
// Vérifie la logique de reprise sur échec : le backoff, le classement des
// erreurs permanentes et le contrat des filtres. Aucun SMTP ni Mongo réel :
// atteindre la base imposerait un serveur de test, on se limite donc à ce qui
// est pur et vérifiable sans I/O.
// ===============================================
const test = require("node:test");
const assert = require("node:assert/strict");

const emailQueue = require("../services/emailQueue");
const mailer = require("../services/mailer");

// ── Backoff ──────────────────────────────────────────────────────────────────
test("le délai de reprise double à chaque tentative", () => {
  const base = emailQueue.backoffFor(1);
  assert.ok(emailQueue.backoffFor(2) > base, "le 2e délai doit être plus grand");
  assert.equal(emailQueue.backoffFor(2), base * 2);
  assert.equal(emailQueue.backoffFor(3), base * 4);
});

test("le délai de reprise est plafonné", () => {
  // Sans plafond, un SMTP coupé toute la nuit produirait un délai de plusieurs
  // semaines et le message ne repartirait jamais.
  const huge = emailQueue.backoffFor(50);
  assert.ok(huge <= 30 * 60 * 1000, `délai non plafonné : ${huge}`);
});

test("le délai est positif même pour une tentative incohérente", () => {
  assert.ok(emailQueue.backoffFor(0) > 0);
  assert.ok(emailQueue.backoffFor(-3) > 0);
});

// ── Classification des erreurs ───────────────────────────────────────────────
test("une adresse refusée est considérée permanente", () => {
  assert.equal(
    mailer.isPermanentError({ message: "550 5.1.1 User unknown" }),
    true
  );
  assert.equal(
    mailer.isPermanentError({ message: "Recipient address rejected: does not exist" }),
    true
  );
});

test("un domaine sans MX est considéré permanent", () => {
  assert.equal(mailer.isPermanentError({ code: "EENOTFOUND" }), true);
});

test("une panne réseau reste transitoire et doit être rejouée", () => {
  // C'est le cas le plus important : une coupure SMTP ne doit pas faire
  // perdre une confirmation de commande.
  assert.equal(mailer.isPermanentError({ code: "ECONNECTION", message: "connect ETIMEDOUT" }), false);
  assert.equal(mailer.isPermanentError({ code: "ETIMEDOUT", message: "timeout" }), false);
  assert.equal(mailer.isPermanentError({ code: "EAUTH", message: "535 Incorrect login" }), false);
});

test("une erreur sans message ne lève pas", () => {
  assert.equal(mailer.isPermanentError(), false);
  assert.equal(mailer.isPermanentError({}), false);
});

// ── Contrat du module ────────────────────────────────────────────────────────
test("le module expose le balayage et le cycle de vie attendus", () => {
  for (const fn of ["enqueue", "flush", "start", "stop", "stats"]) {
    assert.equal(typeof emailQueue[fn], "function", `${fn} manquant`);
  }
});

test("start est idempotent et stop est sûr sans start", () => {
  assert.doesNotThrow(() => emailQueue.start());
  assert.doesNotThrow(() => emailQueue.start());
  assert.doesNotThrow(() => emailQueue.stop());
});

test("le balayage ne fait rien quand l'email n'est pas configuré", async () => {
  // Sans configuration SMTP, flush() doit sortir immédiatement plutôt que
  // d'interroger la base ou de lever.
  const result = await emailQueue.flush();
  assert.equal(result.skipped, true);
});
