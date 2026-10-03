const express = require("express");
const router = express.Router();
const newsletterController = require("../controllers/newsletterController");
const { newsletterValidation } = require("../middlewares/validation");

// POST /api/v1/newsletter/subscribe — demande d'inscription (double opt-in)
// Le rate-limit par IP est monté dans server.js sur /newsletter.
router.post("/subscribe", newsletterValidation.subscribe, newsletterController.subscribe);

// GET /api/v1/newsletter/confirm?token=... — confirmation (clic dans l'email)
// GET et non POST : le lien doit pouvoir être suivi depuis n'importe quel
// client email. Le jeton opaque tient lieu de preuve du consentement.
router.get("/confirm", newsletterController.confirm);

// GET|POST /api/v1/newsletter/unsubscribe?token=... — désabonnement
// Le POST est requis par le One-Click Unsubscribe (RFC 8058) : Gmail et
// Yahoo déclenchent un POST automatique, pas un GET.
router.get("/unsubscribe", newsletterController.unsubscribe);
router.post("/unsubscribe", newsletterController.unsubscribe);

module.exports = router;