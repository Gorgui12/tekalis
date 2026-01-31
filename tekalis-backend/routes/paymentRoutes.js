// ===============================================
// routes/paymentRoutes.js (UPDATED)
// ===============================================
const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware.js");

const paymentController = require("../controllers/paymentController");

// Déstructuration sécurisée
const {
  createPayDunyaInvoice,
  checkPaymentStatus,
  paydunyaCallback,
  confirmPayment,
  getPaymentReceipt
} = paymentController;

// Log debug pour éviter erreurs undefined
console.log("🔍 Chargement paymentRoutes...");
console.log("   createPayDunyaInvoice:", typeof createPayDunyaInvoice);
console.log("   checkPaymentStatus:", typeof checkPaymentStatus);
console.log("   paydunyaCallback:", typeof paydunyaCallback);
console.log("   confirmPayment:", typeof confirmPayment);
console.log("   getPaymentReceipt:", typeof getPaymentReceipt);

// ===============================================
// Routes protégées (authentification requise)
// ===============================================

// Créer une facture PayDunya pour une commande
router.post("/paydunya/create", protect, createPayDunyaInvoice);

// Vérifier le statut d'un paiement par token
router.get("/paydunya/status/:token", protect, checkPaymentStatus);

// Confirmer un paiement après retour sur le site
router.get("/paydunya/confirm/:orderId", protect, confirmPayment);

// Obtenir le reçu PDF d'un paiement
router.get("/paydunya/receipt/:orderId", protect, getPaymentReceipt);

// ===============================================
// Routes publiques (webhooks)
// ===============================================

// Webhook IPN PayDunya (NON protégé - appelé par PayDunya)
router.post("/paydunya/callback", paydunyaCallback);

console.log("   ✅ paymentRoutes (PayDunya) prêtes");

module.exports = router;
