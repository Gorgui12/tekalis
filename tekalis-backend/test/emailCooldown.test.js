// ===============================================
// test/emailCooldown.test.js
//
// Le cooldown par adresse est la protection qui empêche /forgot-password et
// /resend-verification d'inonder la boîte d'un tiers. Une régression ici est
// silencieuse : rien ne casse, mais le service se fait blacklister par le
// fournisseur d'email. D'où des tests explicites.
// ===============================================
const test = require("node:test");
const assert = require("node:assert/strict");

const cooldown = require("../services/emailCooldown");

test("une adresse inconnue n'est pas bloquée", () => {
  cooldown.clear();
  assert.equal(cooldown.isBlocked("inconnu@example.com"), false);
});

test("une adresse est bloquée juste après un envoi", () => {
  cooldown.clear();
  cooldown.markSent("awa@example.com");
  assert.equal(cooldown.isBlocked("awa@example.com"), true);
});

test("le blocage est indépendant par adresse", () => {
  // Sinon, un attaquant pourrait bloquer la vérification d'une victime en
  // déclenchant son cooldown depuis sa propre IP.
  cooldown.clear();
  cooldown.markSent("awa@example.com");
  assert.equal(cooldown.isBlocked("victime@example.com"), false);
});

test("le blocage se lève une fois le délai écoulé", () => {
  cooldown.clear();
  cooldown.markSent("awa@example.com");
  // Fenêtre de 0 ms = délai déjà expiré.
  assert.equal(cooldown.isBlocked("awa@example.com", 0), false);
  assert.equal(cooldown.isBlocked("awa@example.com", 60 * 60 * 1000), true);
});

test("markSent remplace un envoi antérieur sans le supprimer", () => {
  // Deux envois rapprochés ne doivent pas remettre le compteur à zéro de
  // façon exploitable.
  cooldown.clear();
  cooldown.markSent("awa@example.com");
  cooldown.markSent("awa@example.com");
  assert.equal(cooldown.isBlocked("awa@example.com"), true);
});

test("clear réinitialise l'état", () => {
  cooldown.markSent("x@example.com");
  cooldown.clear();
  assert.equal(cooldown.isBlocked("x@example.com"), false);
});
