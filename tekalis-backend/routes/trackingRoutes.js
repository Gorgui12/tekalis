// ============================================================
// routes/trackingRoutes.js — Endpoints de tracking (publics)
//
//  POST /api/v1/tracking/visit
//      Comptage de page vue pour les analytics admin (taux de
//      conversion, sessions/visiteurs). Body : { sessionId, path }
//
//  POST /api/v1/tracking/event
//      Relais serveur→serveur vers la Meta Conversions API (CAPI)
//      pour les événements de funnel (ViewContent, AddToCart, ...).
//      Le navigateur envoie une copie signée d'un événement déjà
//      tiré côté browser ; le backend la retransmet à Meta avec le
//      même event_id → déduplication. Le Purchase n'est PAS accepté
//      ici : il est géré côté serveur (callback de paiement) — voir
//      le paiement dans une version ultérieure.
//
// Ces routes sont montées AVANT le rate-limiter global d'API dans
// server.js (comme sitemap/feed) ; un rate-limiter dédié est appliqué
// localement.
// ============================================================
const express = require("express");
const rateLimit = require("express-rate-limit");

const router = express.Router();
const Visit = require("../models/Visit");
const MetaCapi = require("../services/metaCapiService");

const isDev = process.env.NODE_ENV === "development";

// Rate-limiter dédié : le trafic de tracking ne doit ni bloquer le
// parcours utilisateur, ni consommer le quota du limiter global.
const trackingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 600,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Trop de requêtes de tracking" },
  skip: () => isDev,
});

router.use(trackingLimiter);

// ── Événements Meta acceptés pour le relais CAPI ────────────────────────────
// Whitelist stricte : on n'envoie à Meta QUE ce que le frontend peut
// raisonnablement déclencher. Le Purchase (paiement) est exclu.
const ALLOWED_EVENTS = new Set([
  "ViewContent",
  "AddToCart",
  "RemoveFromCart",
  "InitiateCheckout",
  "AddPaymentInfo",
  "Search",
  "AddToWishlist",
  "ViewCategory",
  "ProductImpressions",
  "InitiateCheckoutAbandoned",
]);

// ── POST /tracking/visit ─────────────────────────────────────────────────────
router.post("/visit", async (req, res) => {
  try {
    const sessionId = String(req.body?.sessionId || "").slice(0, 100);
    const path = String(req.body?.path || "/").slice(0, 500);

    if (!sessionId) return res.status(400).json({ success: false, message: "sessionId manquant" });

    const today = new Date().toISOString().split("T")[0];

    await Visit.updateOne(
      { date: today, sessionId },
      { $inc: { visits: 1 }, $set: { path } },
      { upsert: true }
    );

    res.json({ success: true });
  } catch (e) {
    console.error("[Tracking] sessionId vide:", e.message);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// ── POST /tracking/event ─────────────────────────────────────────────────────
router.post("/event", async (req, res) => {
  try {
    const {
      event_name: eventName,
      event_id: eventId,
      url = "",
      fbc = "",
      fbp = "",
      custom_data: customData,
    } = req.body || {};

    if (!eventName || !ALLOWED_EVENTS.has(eventName)) {
      return res.status(400).json({ success: false, message: "Événement non autorisé" });
    }

    // Fire-and-forget : on répond immédiatement au navigateur, l'envoi
    // vers Meta se fait en arrière-plan (jamais bloquant pour l'UI).
    MetaCapi.sendEvent({
      eventName,
      eventId: eventId ? String(eventId).slice(0, 100) : undefined,
      actionSource: "website",
      userData: { fbc: fbc || undefined, fbp: fbp || undefined },
      customData: {
        url: String(url || "").slice(0, 500),
        ...(customData && typeof customData === "object" ? customData : {}),
      },
      quiet: true,
    }).catch((err) => {
      console.error(`[Tracking][CAPI] Échec ${eventName}:`, err.message);
    });

    res.json({ success: true });
  } catch (e) {
    console.error("[Tracking] /event:", e.message);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

module.exports = router;