// ===============================================
// test/emailService.test.js
//
// Vérifie ce que l'API SMTP reçoit réellement : partie texte, Reply-To et
// repli en file d'attente. Le transporteur est remplacé par un faux objet, donc
// aucun SMTP n'est contacté et aucun message n'est envoyé.
//
// C'est le cœur du correctif « text + replyTo + file » : si quelqu'un retire
// l'un des trois, ces tests le signalent.
// ===============================================
const test = require("node:test");
const assert = require("node:assert/strict");

process.env.SITE_NAME = "Tekalis";
process.env.EMAIL_USER = "no-reply@tekalis.com";
// Valeurs fictives : isEmailConfigured() exige les trois variables, et le
// transporteur est de toute façon remplacé plus bas. Aucun SMTP n'est
// contacté, aucun secret réel n'est utilisé.
process.env.EMAIL_HOST = "smtp.test.invalid";
process.env.EMAIL_PORT = "465";
process.env.EMAIL_PASS = "fake-password-for-tests";

const mailer = require("../services/mailer");
const emailQueue = require("../services/emailQueue");
const EmailService = require("../services/emailService");

// Intercepte l'objet transmis au transporteur et simule un succès.
let captured = null;
const stubSuccess = () => {
  captured = null;
  mailer.getTransporter = () => ({
    sendMail: async (mail) => {
      captured = mail;
      return { messageId: "<stub@test>" };
    }
  });
};

const stubFailure = (error) => {
  captured = null;
  mailer.getTransporter = () => ({
    sendMail: async (mail) => {
      captured = mail;
      throw error;
    }
  });
};

// ── Partie texte ─────────────────────────────────────────────────────────────
test("un email sans texte explicite reçoit une partie texte dérivée du HTML", async () => {
  stubSuccess();
  await EmailService.sendEmail("awa@example.com", "Sujet", "<p>Bonjour <b>Awa</b></p>");

  assert.ok(captured.text, "aucune partie texte transmise");
  assert.equal(captured.text, "Bonjour Awa", "le HTML n'a pas été converti");
  assert.ok(!captured.text.includes("<b>"), "des balises subsistent");
});

test("un texte fourni explicitement n'est pas écrasé", async () => {
  stubSuccess();
  await EmailService.sendEmail("awa@example.com", "Sujet", "<p>HTML</p>", {
    text: "Version texte de la main"
  });

  assert.equal(captured.text, "Version texte de la main");
});

// ── Reply-To ─────────────────────────────────────────────────────────────────
test("le Reply-To reprend CONTACT_EMAIL", async () => {
  process.env.CONTACT_EMAIL = "contact@tekalis.com";
  delete process.env.EMAIL_REPLY_TO;

  stubSuccess();
  await EmailService.sendEmail("awa@example.com", "Sujet", "<p>x</p>");

  assert.equal(
    captured.replyTo,
    "contact@tekalis.com",
    "les réponses du clientiraient dans la boîte technique"
  );
});

test("EMAIL_REPLY_TO l'emporte sur CONTACT_EMAIL", async () => {
  process.env.CONTACT_EMAIL = "contact@tekalis.com";
  process.env.EMAIL_REPLY_TO = "sav@tekalis.com";

  stubSuccess();
  await EmailService.sendEmail("awa@example.com", "Sujet", "<p>x</p>");

  assert.equal(captured.replyTo, "sav@tekalis.com");

  delete process.env.EMAIL_REPLY_TO;
});

test("sans CONTACT_EMAIL, le Reply-To retombe sur la boîte d'envoi", async () => {
  delete process.env.CONTACT_EMAIL;
  delete process.env.EMAIL_REPLY_TO;

  stubSuccess();
  await EmailService.sendEmail("awa@example.com", "Sujet", "<p>x</p>");

  assert.equal(captured.replyTo, "no-reply@tekalis.com");

  process.env.CONTACT_EMAIL = "contact@tekalis.com";
});

// ── Repli en file ────────────────────────────────────────────────────────────
test("un échec transitoire empile le message sans le déclarer envoyé", async () => {
  const queued = [];
  const originalEnqueue = emailQueue.enqueue;
  emailQueue.enqueue = async (mail) => {
    queued.push(mail);
    return { success: true, queued: true };
  };

  stubFailure(Object.assign(new Error("connect ETIMEDOUT"), { code: "ETIMEDOUT" }));

  const result = await EmailService.sendEmail("awa@example.com", "Sujet", "<p>x</p>");

  assert.equal(result.success, false);
  assert.equal(result.queued, true, "le message aurait été perdu");
  assert.equal(queued.length, 1, "rien n'a été empilé");

  // Le message empilé doit être complet : sans le texte ni le Reply-To, la
  // reprise enverrait un email différent du premier essai.
  assert.equal(queued[0].text, "x");
  assert.ok(queued[0].replyTo);
  assert.equal(queued[0].to, "awa@example.com");

  emailQueue.enqueue = originalEnqueue;
});

test("une erreur permanente n'est pas empilée", async () => {
  // Une adresse refusée le sera toujours : la rejouer cinq fois ne sert à rien
  // et sature la base.
  const queued = [];
  const originalEnqueue = emailQueue.enqueue;
  emailQueue.enqueue = async (mail) => {
    queued.push(mail);
    return { success: true, queued: true };
  };

  stubFailure(new Error("550 5.1.1 User unknown"));

  const result = await EmailService.sendEmail("awa@example.com", "Sujet", "<p>x</p>");

  assert.equal(result.success, false);
  assert.equal(result.queued, false);
  assert.equal(queued.length, 0, "un email définitivement invalide a été empilé");

  emailQueue.enqueue = originalEnqueue;
});

// ── En-têtes ─────────────────────────────────────────────────────────────────
test("les en-têtes fournis sont transmis au SMTP", async () => {
  stubSuccess();

  const unsubscribeUrl = "https://api.tekalis.com/api/v1/newsletter/unsubscribe?token=U";
  const headers = EmailService.buildUnsubscribeHeaders(unsubscribeUrl);

  assert.match(headers["List-Unsubscribe"], /^<https:\/\//);
  assert.equal(headers["List-Unsubscribe-Post"], "List-Unsubscribe=One-Click");

  await EmailService.sendEmail("awa@example.com", "Sujet", "<p>x</p>", { headers });

  assert.equal(captured.headers["List-Unsubscribe"], headers["List-Unsubscribe"]);
});

// ── Configuration non requise ────────────────────────────────────────────────
test("sans configuration SMTP, l'envoi est refusé sans erreur", async () => {
  const originalHost = process.env.EMAIL_HOST;
  delete process.env.EMAIL_HOST;

  const result = await EmailService.sendEmail("awa@example.com", "Sujet", "<p>x</p>");

  assert.equal(result.success, false);
  assert.match(result.error, /non configuré/i);

  process.env.EMAIL_HOST = originalHost;
});

// ── TTL ──────────────────────────────────────────────────────────────────────
test("les TTL des liens sont exprimés en millisecondes cohérentes", () => {
  // Le contrôleur stocke une date à partir des millisecondes et le template
  // affiche les minutes : si les deux divergeaient, l'email annoncerait
  // « 10 minutes » pour un lien valable 24 heures.
  assert.equal(
    EmailService.RESET_TOKEN_TTL_MS,
    EmailService.RESET_TOKEN_TTL_MINUTES * 60 * 1000
  );
  assert.equal(
    EmailService.EMAIL_VERIFICATION_TTL_MS,
    EmailService.EMAIL_VERIFICATION_TTL_HOURS * 60 * 60 * 1000
  );
  assert.ok(EmailService.EMAIL_VERIFICATION_TTL_HOURS > EmailService.RESET_TOKEN_TTL_MINUTES);
});
