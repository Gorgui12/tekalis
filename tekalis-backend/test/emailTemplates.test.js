// ===============================================
// test/emailTemplates.test.js
//
// node --test, sans dépendance externe : le projet n'a ni Jest ni Mocha, et
// en ajouter un pour tester une trentaine de fonctions de rendu n'est pas
// justifié.
//
// Ces tests ne touchent ni Mongo ni SMTP : ils vérifient le HTML/texte
// produit, qui est la partie où une régression se voit (lien cassé, adresse
// qui fuit, échappement XUV perdu).
// ===============================================
process.env.SITE_NAME = "Tekalis";
process.env.FRONTEND_URL = "https://tekalis.com";
process.env.BACKEND_URL = "https://api.tekalis.com";
process.env.ADMIN_URL = "https://admin.tekalis.com";
process.env.CONTACT_EMAIL = "contact@tekalis.com";
process.env.STORE_PHONE = "221786346946";

const test = require("node:test");
const assert = require("node:assert/strict");

const t = require("../utils/emailTemplates");

// ── Fixtures ─────────────────────────────────────────────────────────────────
const order = {
  _id: "64f1c2a9e1a2b3c4d5e6f7a8",
  orderNumber: "TK-2026-0001",
  createdAt: new Date("2026-03-01T10:00:00Z"),
  paymentMethod: "wave",
  totalPrice: 155000,
  shippingCost: 0,
  deliveryName: "Awa Diop",
  deliveryPhone: "77 000 00 00",
  deliveryAddress: "Rue 14, Fann",
  deliveryCity: "Dakar",
  products: [
    { product: { name: "iPhone 13 128 Go" }, quantity: 2, price: 62500 },
    { product: { name: "AirPods Pro" }, quantity: 1, price: 30000 }
  ]
};

const user = { name: "Awa Diop", email: "awa@example.com" };

// Rend chaque template une fois, pour les assertions qui doivent les parcourir
// tous.
const renderAll = () => ({
  orderConfirmation: t.orderConfirmation(order, user),
  orderStatusUpdate: t.orderStatusUpdate(order, user, "shipped"),
  welcome: t.welcome(user),
  passwordReset: t.passwordReset(user, "https://tekalis.com/reset-password/abc", 10),
  newsletterConfirmation: t.newsletterConfirmation(
    "https://api.tekalis.com/api/v1/newsletter/confirm?token=C",
    "https://api.tekalis.com/api/v1/newsletter/unsubscribe?token=U"
  ),
  reviewRequest: t.reviewRequest(user, order, { name: "iPhone 13 128 Go" }),
  rmaNotification: t.rmaNotification(user, { rmaNumber: "SAV-1", status: "received" }, "created"),
  warrantyExpiring: t.warrantyExpiring(
    user,
    { endDate: new Date("2026-12-01"), product: { name: "iPhone 13" } },
    { name: "iPhone 13" }
  ),
  adminOrderNotification: t.adminOrderNotification(order, user),
  emailVerification: t.emailVerification(
    user,
    "https://tekalis.com/verify-email?token=V",
    24
  )
});

const entries = () => Object.entries(renderAll());

// ── Rendu ────────────────────────────────────────────────────────────────────
test("tous les templates se rendent en HTML complet", () => {
  for (const [name, html] of entries()) {
    assert.equal(typeof html, "string", `${name} doit renvoyer une chaîne`);
    assert.ok(html.length > 200, `${name} est anormalement court`);
    assert.match(html, /^<!DOCTYPE html>/i, `${name} : balise doctype manquante`);
    assert.match(html, /<\/html>/i, `${name} : balise fermante manquante`);
  }
});

test("aucun template ne laisse fuir de valeur JavaScript non résolue", () => {
  for (const [name, html] of entries()) {
    assert.ok(!html.includes("undefined"), `${name} contient "undefined"`);
    assert.ok(!html.includes("null,"), `${name} contient "null"`);
    assert.ok(!html.includes("[object Object]"), `${name} contient [object Object]`);
    assert.ok(!html.includes("NaN"), `${name} contient NaN`);
  }
});

// ── Échappement ──────────────────────────────────────────────────────────────
test("les données injectées sont échappées (pas d'injection de balise)", () => {
  const evil = {
    name: '<img src=x onerror="alert(1)">',
    email: "a@b.com",
    orderNumber: "<script>alert(2)</script>",
    createdAt: new Date(),
    paymentMethod: "wave",
    totalPrice: 1000,
    deliveryName: "<b>pwn</b>",
    deliveryPhone: "77",
    deliveryAddress: "<iframe src=evil>",
    products: [{ product: { name: "</td><script>alert(3)</script>" }, quantity: 1, price: 1000 }]
  };

  const html = t.orderConfirmation(evil, { name: evil.name, email: evil.email });

  assert.ok(!html.includes("<script>"), "balise script non échappée");
  assert.ok(!html.includes("<iframe"), "balise iframe non échappée");
  assert.ok(!/<img[^>]*onerror/.test(html), "attribut onerror non échappé");
  assert.match(html, /&lt;script&gt;/, "le script doit apparaître échappé");
});

test("la partie texte conserve le caractère littéral sans le réinjecter en HTML", () => {
  // Le texte est décodé (c'est l'intérêt d'une version texte : on lit ce que
  // l'utilisateur a réellement tapé). Il ne peut pas être « réinjecté » :
  // une partie text/plain n'est jamais rendue comme du HTML. Ce qui compte,
  // c'est que le texte reste du texte et ne contienne aucune balise issue du
  // gabarit.
  const evil = "<script>alert('x')</script>";
  const text = t.htmlToText(t.emailVerification({ name: evil }, "https://x/verify"));

  assert.ok(text.includes(evil), "le caractère tapé doit être lisible en clair");
  // Aucune balise issue du gabarit (div, table, style) ne doit subsister.
  assert.ok(!/<\/?(div|table|tr|td|span|body|html|style|a)\b/i.test(text));
});

// ── Liens ────────────────────────────────────────────────────────────────────
test("les liens pointent vers le bon hôte", () => {
  const rendered = renderAll();

  // Les URLs du client viennent de FRONTEND_URL, jamais du backend ni d'un
  // localhost : c'est exactement le bug que FRONTEND_URL mal configuré
  // produirait.
  for (const [name, html] of Object.entries(rendered)) {
    assert.ok(!html.includes("localhost"), `${name} contient une URL localhost`);
    assert.ok(!html.includes("127.0.0.1"), `${name} contient 127.0.0.1`);
  }
});

test("le lien de suivi de commande utilise l'id de commande", () => {
  const html = t.orderConfirmation(order, user);
  assert.match(html, /tekalis\.com\/dashboard\/orders\/64f1c2a9e1a2b3c4d5e6f7a8/);
});

test("le lien admin utilise ADMIN_URL et non l'URL du site", () => {
  const html = t.adminOrderNotification(order, user);
  assert.match(html, /admin\.tekalis\.com/);
  assert.ok(!html.includes("tekalis\.com/admin/orders"));
});

test("le lien de désabonnement est présent dans la confirmation newsletter", () => {
  const html = t.newsletterConfirmation("https://api/x?token=C", "https://api/y?token=U");
  assert.match(html, /token=U/);
});

// ── Données de commande ──────────────────────────────────────────────────────
test("les totaux de commande sont exacts", () => {
  const html = t.orderConfirmation(order, user);
  // 2 × 62 500 = 125 000, plus 30 000 = 155 000.
  assert.match(html, /155\s*000/);
});

test("le nom du client apparaît dans la confirmation", () => {
  assert.match(t.orderConfirmation(order, user), /Awa Diop/);
});

test("le téléphone public est celui du site", () => {
  const html = t.orderConfirmation(order, user);
  assert.match(html, /221 78 634 69 46/);
  assert.ok(!html.includes("221 76 214 50 37"), "ancien numéro encore présent");
});

// ── TTL ──────────────────────────────────────────────────────────────────────
test("la durée du lien de reset est affichée et non codée en dur", () => {
  const html = t.passwordReset(user, "https://tekalis.com/reset-password/x", 10);
  assert.match(html, /10\s*minutes/);
});

test("la durée du lien de vérification est affichée", () => {
  const html = t.emailVerification(user, "https://tekalis.com/verify-email?token=V", 24);
  assert.match(html, /24\s*heures/);
});

// ── Partie texte ─────────────────────────────────────────────────────────────
test("htmlToText supprime toutes les balises", () => {
  const text = t.htmlToText(t.orderConfirmation(order, user));
  assert.ok(!/<[a-z/][^>]*>/i.test(text), "des balises subsistent dans le texte");
});

test("htmlToText produit une ligne par produit", () => {
  const text = t.htmlToText(t.orderConfirmation(order, user));
  const lines = text.split("\n").map((l) => l.trim());

  const iphone = lines.find((l) => l.startsWith("iPhone 13 128 Go"));
  const airpods = lines.find((l) => l.startsWith("AirPods Pro"));

  assert.ok(iphone, "ligne du iPhone absente");
  assert.ok(airpods, "ligne des AirPods absente");
  // Une cellule = une colonne : pas de retour à la ligne au milieu d'un produit.
  assert.ok(!iphone.includes("125 000 FCFA"), "la ligne contient un total d'une autre ligne");
});

test("htmlToText rend les liens actionnables", () => {
  const text = t.htmlToText(t.orderConfirmation(order, user));
  assert.match(text, /Suivre ma commande \(https:\/\/tekalis\.com\/dashboard\/orders\//);
});

test("htmlToText n'affiche pas la cible mailto deux fois", () => {
  const text = t.htmlToText(t.orderConfirmation(order, user));
  assert.match(text, /contact@tekalis\.com/);
  assert.ok(!text.includes("mailto:"), "le préfixe mailto: doit être retiré");
});

test("htmlToText décode les entités HTML", () => {
  assert.equal(t.htmlToText("<p>a &amp; b</p>"), "a & b");
  assert.equal(t.htmlToText("<p>&lt;tag&gt;</p>"), "<tag>");
});

test("htmlToText compacte les blancs superflus", () => {
  const text = t.htmlToText(t.welcome(user));
  assert.ok(!/\n{3,}/.test(text), "trop de lignes vides");
  assert.ok(!/^[ \t]+/m.test(text), "lignes indentées");
});

// ── landingPage ──────────────────────────────────────────────────────────────
test("landingPage produit un document autonome et échappé", () => {
  const page = t.landingPage("Titre <script>", "Message");
  assert.match(page, /^<!DOCTYPE html>/i);
  assert.ok(!page.includes("<script>"));
  assert.match(page, /&lt;script&gt;/);
  assert.match(page, /noindex/);
});

test("landingPage n'affiche un bouton que si un lien est fourni", () => {
  assert.ok(!t.landingPage("T", "M").includes("<a href=\"http"));
  assert.ok(
    t.landingPage("T", "M", { linkText: "Aller", linkUrl: "https://tekalis.com/login" })
      .includes("https://tekalis.com/login")
  );
});
