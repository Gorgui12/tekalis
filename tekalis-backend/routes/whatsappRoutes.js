const express = require("express");
const crypto = require("crypto");
const router = express.Router();

const WhatsAppConversation = require("../models/WhatsAppConversation");
const { handleWhatsAppMessage } = require("../services/whatsappAI");

// ===============================================
// routes/whatsappRoutes.js
// Webhook Meta WhatsApp Business Cloud API.
//
// Deux routes, comme exigé par Meta :
//   GET  /api/v1/whatsapp/webhook  — vérification lors de la configuration
//   POST /api/v1/whatsapp/webhook  — réception des messages entrants
// ===============================================

const GRAPH_API_URL = `https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

// ── Vérification de signature Meta ───────────────────────────────────────────
// Meta signe chaque requête webhook avec votre App Secret (header
// X-Hub-Signature-256). Sans cette vérification, n'importe qui connaissant
// l'URL du webhook pourrait poster de faux messages et déclencher des appels
// d'outils (recherche produit, statut de commande) en votre nom.
function verifyMetaSignature(req) {
  const signature = req.headers["x-hub-signature-256"];
  if (!signature || !process.env.WHATSAPP_APP_SECRET) return false;
  const expected =
    "sha256=" +
    crypto
      .createHmac("sha256", process.env.WHATSAPP_APP_SECRET)
      .update(req.rawBody || JSON.stringify(req.body))
      .digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false; // longueurs différentes, etc.
  }
}

// ── Diagnostic temporaire (retirer après validation) ─────────────────────────
router.get("/debug", (req, res) => {
  res.json({
    verifySet: !!process.env.WHATSAPP_VERIFY_TOKEN,
    verifyLen: (process.env.WHATSAPP_VERIFY_TOKEN || "").length,
    phoneSet: !!process.env.WHATSAPP_PHONE_NUMBER_ID,
    accessTokenSet: !!process.env.WHATSAPP_ACCESS_TOKEN,
    appSecretSet: !!process.env.WHATSAPP_APP_SECRET
  });
});

// ── Diagnostic temporaire (retirer après validation) : compare le token ──────
router.get("/check", (req, res) => {
  const given = req.query.token || "";
  const envVal = process.env.WHATSAPP_VERIFY_TOKEN || "";
  res.json({
    givenLen: given.length,
    envLen: envVal.length,
    equal: given === envVal,
    envHead4: envVal.slice(0, 4),
    givenHead4: given.slice(0, 4),
    envTail4: envVal.slice(-4),
    givenTail4: given.slice(-4),
  });
});

// ── Vérification du webhook (obligatoire, appelée une fois par Meta) ────────
router.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log("✅ Webhook WhatsApp vérifié par Meta");
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

// ── Réception des messages ───────────────────────────────────────────────────
router.post("/webhook", async (req, res) => {
  // Répondre 200 immédiatement : Meta réessaie si on ne répond pas vite,
  // ce qui peut dupliquer le traitement. Le vrai traitement se fait après.
  res.sendStatus(200);

  if (!verifyMetaSignature(req)) {
    console.warn("🚫 Webhook WhatsApp reçu avec une signature invalide — ignoré");
    return;
  }

  try {
    const entry = req.body?.entry?.[0];
    const change = entry?.changes?.[0]?.value;
    const message = change?.messages?.[0];
    if (!message || message.type !== "text") return; // ignore accusés de lecture, médias non gérés, etc.

    const phone = message.from; // format international sans "+", ex: "221771234567"
    const userText = message.text.body;

    // ── Récupération / création de la conversation ──────────────────────────
    let convo = await WhatsAppConversation.findOne({ phone });
    if (!convo) convo = new WhatsAppConversation({ phone });

    // Une conversation déjà escaladée reste gérée par un humain : le bot ne
    // reprend pas la main tout seul, il faut une action explicite côté admin
    // (hors périmètre de ce premier lot — voir docs-whatsapp-strategie.md).
    if (convo.status === "escalated") {
      console.log(`↪️  Message ignoré par le bot (conversation ${phone} déjà escaladée)`);
      return;
    }

    const history = convo.messages.map((m) => ({ role: m.role, content: m.content }));
    const { reply, escalate, escalationReason } = await handleWhatsAppMessage(history, userText);

    convo.pushMessage("user", userText);
    convo.pushMessage("assistant", reply);

    if (escalate) {
      convo.status = "escalated";
      convo.escalatedAt = new Date();
      convo.escalationReason = escalationReason;
      await notifyHumanTeam(phone, userText, escalationReason);
    }

    await convo.save();
    await sendWhatsAppMessage(phone, reply);
  } catch (err) {
    console.error("❌ Erreur traitement webhook WhatsApp:", err);
  }
});

// ── Envoi d'un message via l'API Meta ────────────────────────────────────────
async function sendWhatsAppMessage(to, body) {
  const res = await fetch(GRAPH_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body },
    }),
  });
  if (!res.ok) {
    console.error("❌ Échec envoi WhatsApp:", res.status, await res.text());
  }
}

// ── Notification de l'équipe humaine lors d'une escalade ────────────────────
// Version minimale : un message WhatsApp direct vers le numéro de l'équipe.
// Une vraie interface admin (liste des conversations escaladées) est une
// itération naturelle une fois le concept validé — voir docs-whatsapp-strategie.md.
async function notifyHumanTeam(clientPhone, lastMessage, reason) {
  const teamPhone = process.env.WHATSAPP_TEAM_NOTIFY_NUMBER;
  if (!teamPhone) {
    console.warn("⚠️  WHATSAPP_TEAM_NOTIFY_NUMBER non configuré — escalade non notifiée");
    return;
  }
  const text =
    `🔔 Escalade WhatsApp\n` +
    `Client : +${clientPhone}\n` +
    `Raison : ${reason}\n` +
    `Dernier message : "${lastMessage}"\n\n` +
    `Répondez directement au client sur WhatsApp.`;
  await sendWhatsAppMessage(teamPhone, text);
}

module.exports = router;
