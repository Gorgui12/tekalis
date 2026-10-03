// ===============================================
// controllers/newsletterController.js
// Inscription à la newsletter — double opt-in (RGPD / CAN-SPAM).
//
// Principe : l'inscription n'est JAMAIS comptée tant que l'adresse n'a pas
// cliqué le lien reçu par email. C'est la seule preuve exploitable d'un
// consentement, et ce qu'exige la réglementation européenne pour l'email
// marketing.
//
// Chaque réponse d'API est volontairement identique quelle que soit l'état de
// l'adresse (inexistante, déjà active, cooldown) : sinon la route devient un
// oracle permettant d'énumérer les abonnés.
//
// Les deux liens (confirmation, désabonnement) sont servis en HTML par
// l'API elle-même plutôt que par le front : un clic depuis n'importe quel
// client email, y compris sans JavaScript ni suivi de cookies, doit suffire
// à confirmer ou se désabonner. C'est aussi ce qu'exige le One-Click
// Unsubscribe (RFC 8058) des en-têtes List-Unsubscribe.
// ===============================================
const crypto = require("crypto");
const Subscriber = require("../models/Subscriber");
const EmailService = require("../services/emailService");
const emailCooldown = require("../services/emailCooldown");
const emailTemplates = require("../utils/emailTemplates");
const { esc } = emailTemplates;

const CONFIRM_TTL_MS = emailTemplates.NEWSLETTER_CONFIRM_TTL_HOURS * 60 * 60 * 1000;

const GENERIC_SUBSCRIBE_MESSAGE =
  "Si cette adresse peut être abonnée, un email de confirmation vient de vous être envoyé.";

// ── Construction des URL du lien de l'email ──────────────────────────────────
// BACKEND_URL, pas FRONTEND_URL : ces liens sont servis par l'API elle-même.
const apiBaseUrl = () =>
  (process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`).replace(/\/+$/, "");

const buildConfirmUrl = (token) =>
  `${apiBaseUrl()}/api/v1/newsletter/confirm?token=${token}`;

const buildUnsubscribeUrl = (token) =>
  `${apiBaseUrl()}/api/v1/newsletter/unsubscribe?token=${token}`;

// Un lien doit permettre le désabonnement sans qu'on devine le jeton : on
// dérive un jeton distinct, persisté, plutôt que de réutiliser celui de
// confirmation (qui est à usage unique et consommé).
const issueTokens = () => {
  const confirmToken = crypto.randomBytes(32).toString("hex");
  const unsubscribeToken = crypto.randomBytes(32).toString("hex");
  return {
    confirmToken,
    unsubscribeToken,
    confirmationTokenHash: crypto.createHash("sha256").update(confirmToken).digest("hex"),
    unsubscribeTokenHash: crypto.createHash("sha256").update(unsubscribeToken).digest("hex"),
  };
};

// ── POST /api/v1/newsletter/subscribe ─────────────────────────────────────────
const subscribe = async (req, res) => {
  try {
    const email = String(req.body.email || "").toLowerCase();
    const source = ["footer", "blog", "cta", "api"].includes(req.body.source)
      ? req.body.source
      : "footer";

    // Anti-spam : pas plus d'une demande par adresse et par minute. Un
    // attaquant qui découvre cet endpoint pourrait sinon s'en servir pour
    // inonder une adresse tierce via notre SMTP.
    if (emailCooldown.isBlocked(`newsletter:${email}`)) {
      return res.status(200).json({ success: true, message: GENERIC_SUBSCRIBE_MESSAGE });
    }

    const existing = await Subscriber.findOne({ email });

    // Déjà actif : on ne renvoie rien (et surtout pas de doublon en base).
    if (existing && existing.status === "active") {
      return res.status(200).json({ success: true, message: GENERIC_SUBSCRIBE_MESSAGE });
    }

    const tokens = issueTokens();

    if (existing) {
      // pending expiré OU unsubscribed : on repart d'un cycle de confirmation
      // propre. C'est ce qui permet à quelqu'un qui s'était désabonné de
      // se réinscrire — sinon le formulaire resterait muet pour toujours.
      existing.status = "pending";
      existing.source = source;
      existing.confirmationToken = tokens.confirmationTokenHash;
      existing.confirmationExpires = new Date(Date.now() + CONFIRM_TTL_MS);
      existing.unsubscribeToken = tokens.unsubscribeTokenHash;
      existing.unsubscribedAt = undefined;
      await existing.save();
    } else {
      await Subscriber.create({
        email,
        status: "pending",
        source,
        confirmationToken: tokens.confirmationTokenHash,
        confirmationExpires: new Date(Date.now() + CONFIRM_TTL_MS),
        unsubscribeToken: tokens.unsubscribeTokenHash,
      });
    }

    const result = await EmailService.sendNewsletterConfirmation(
      { email },
      buildConfirmUrl(tokens.confirmToken),
      buildUnsubscribeUrl(tokens.unsubscribeToken)
    );

    if (result.success) {
      emailCooldown.markSent(`newsletter:${email}`);
    }

    res.status(200).json({ success: true, message: GENERIC_SUBSCRIBE_MESSAGE });
  } catch (error) {
    // Course entre deux requêtes sur la même adresse : l'index unique a
    // tranché. On ne la remonte pas comme une erreur serveur.
    if (error.code === 11000) {
      return res.status(200).json({ success: true, message: GENERIC_SUBSCRIBE_MESSAGE });
    }
    console.error("❌ Erreur newsletter subscribe:", error.message);
    res.status(500).json({ message: "Erreur lors de l'inscription à la newsletter" });
  }
};

// ── GET /api/v1/newsletter/confirm?token=... ─────────────────────────────────
const confirm = async (req, res) => {
  try {
    const rawToken = String(req.query.token || "");

    // Jeton absent : inutile d'interroger la base (et le routeur n'a pas de
    // MongoDB monté à cet endroit, d'où l'attente de 10 s avant échec).
    if (!rawToken) {
      return res.status(400).send(
        newsletterPage(
          "Lien invalide",
          "Ce lien de confirmation est incomplet. Refaites une demande depuis le site."
        )
      );
    }

    const hash = crypto.createHash("sha256").update(rawToken).digest("hex");

    const subscriber = await Subscriber.findOne({
      confirmationToken: hash,
      confirmationExpires: { $gt: Date.now() },
    });

    if (!subscriber) {
      return res.status(400).send(
        newsletterPage(
          "Lien expiré ou déjà utilisé",
          "Ce lien de confirmation n'est plus valable. Si vous êtes toujours intéressé, refaites une demande depuis le site."
        )
      );
    }

    // Déjà actif (double clic, onglet rechargé) : succès, pas erreur.
    subscriber.status = "active";
    subscriber.confirmedAt = subscriber.confirmedAt || new Date();
    subscriber.confirmationToken = undefined;
    await subscriber.save();

    res.status(200).send(
      newsletterPage(
        "Inscription confirmée",
        `Bienvenue dans la newsletter ! Vous recevrez désormais les nouveautés de ${process.env.SITE_NAME || "Tekalis"}.`
      )
    );
  } catch (error) {
    console.error("❌ Erreur newsletter confirm:", error.message);
    res.status(500).send(
      newsletterPage("Erreur", "Une erreur est survenue. Merci de réessayer plus tard.")
    );
  }
};

// ── GET|POST /api/v1/newsletter/unsubscribe?token=... ────────────────────────
// Le POST est requis par le One-Click Unsubscribe (RFC 8058) : Gmail et Yahoo
// envoient un POST automatique quand l'utilisateur clique la pastille
// « Se désabonner » dans son client. Sans ce POST, nos envois sont classés spam.
const unsubscribe = async (req, res) => {
  try {
    const rawToken = String((req.query && req.query.token) || (req.body && req.body.token) || "");

    if (!rawToken) {
      return res.status(404).send(
        newsletterPage(
          "Lien invalide",
          "Ce lien de désabonnement est invalide. Écrivez-nous et nous vous désabonnerons manuellement."
        )
      );
    }

    const hash = crypto.createHash("sha256").update(rawToken).digest("hex");

    const subscriber = await Subscriber.findOne({ unsubscribeToken: hash });

    if (!subscriber) {
      return res.status(404).send(
        newsletterPage(
          "Lien invalide",
          "Ce lien de désabonnement est invalide. Écrivez-nous et nous vous désabonnerons manuellement."
        )
      );
    }

    if (subscriber.status !== "unsubscribed") {
      subscriber.status = "unsubscribed";
      subscriber.unsubscribedAt = new Date();
      subscriber.confirmationToken = undefined;
      await subscriber.save();
    }

    // Réponse minimale pour le POST One-Click (une page HTML ferait crier
    // certains proxies), contenu lisible pour le clic humain.
    res.status(200).send(
      newsletterPage(
        "Désabonnement confirmé",
        "Vous avez été désabonné de notre newsletter. Vous ne recevrez plus nos emails."
      )
    );
  } catch (error) {
    console.error("❌ Erreur newsletter unsubscribe:", error.message);
    res.status(500).send(
      newsletterPage("Erreur", "Une erreur est survenue. Merci de réessayer plus tard.")
    );
  }
};

// ── Page HTML autonome ───────────────────────────────────────────────────────
// Servie par l'API : doit être lisible sans feuille de style externe ni
// JavaScript, et s'adapter au thème sombre comme au thème clair.
const newsletterPage = (title, message) => `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${esc(title)} — ${esc(process.env.SITE_NAME || "Tekalis")}</title>
</head>
<body style="margin:0;padding:0;background:#F1F5F9;font-family:Arial,Helvetica,sans-serif;color:#1f2937">
  <div style="max-width:520px;margin:0 auto;padding:48px 16px">
    <div style="background:#1E40AF;padding:24px;text-align:center;border-radius:12px 12px 0 0">
      <h1 style="color:#ffffff;margin:0;font-size:22px">${esc(process.env.SITE_NAME || "Tekalis")}</h1>
    </div>
    <div style="background:#ffffff;padding:32px 28px;border:1px solid #E2E8F0;border-top:none;border-bottom:none;text-align:center">
      <h2 style="margin:0 0 14px;font-size:20px;color:#1E40AF">${esc(title)}</h2>
      <p style="margin:0;font-size:15px;line-height:1.7;color:#475569">${esc(message)}</p>
    </div>
    <div style="background:#0F172A;padding:20px;text-align:center;border-radius:0 0 12px 12px">
      <p style="margin:0;font-size:12px;color:#94A3B8">
        <a href="mailto:${esc(process.env.CONTACT_EMAIL || "support@tekalis.com")}" style="color:#BFDBFE">${esc(process.env.CONTACT_EMAIL || "support@tekalis.com")}</a>
      </p>
    </div>
  </div>
</body>
</html>`;

module.exports = {
  subscribe,
  confirm,
  unsubscribe,
  // exporté pour les tests
  _internal: { buildConfirmUrl, buildUnsubscribeUrl, newsletterPage }
};