// ===============================================
// controllers/paymentController.js
// Intégration PayDunya — VERSION CORRIGÉE
// CRITIQUE 4 : Vérification webhook renforcée
// ===============================================
const paydunya = require("paydunya");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const crypto = require("crypto");

// Configuration PayDunya
const setup = new paydunya.Setup({
  masterKey: process.env.PAYDUNYA_MASTER_KEY,
  privateKey: process.env.PAYDUNYA_PRIVATE_KEY,
  publicKey: process.env.PAYDUNYA_PUBLIC_KEY,
  token: process.env.PAYDUNYA_TOKEN,
  mode: process.env.PAYDUNYA_MODE || "test"
});

// Configuration du magasin
const store = new paydunya.Store({
  name: process.env.STORE_NAME || "Tekalis",
  tagline: process.env.STORE_TAGLINE || "Vente en ligne",
  phoneNumber: process.env.STORE_PHONE || "221771234567",
  postalAddress: process.env.STORE_ADDRESS || "Dakar, Sénégal",
  websiteURL: process.env.STORE_WEBSITE || process.env.FRONTEND_URL,
  logoURL: process.env.STORE_LOGO || `${process.env.FRONTEND_URL}/logo.png`,
  callbackURL: `${process.env.BACKEND_URL}/api/v1/payment/paydunya/callback`,
  returnURL: `${process.env.FRONTEND_URL}/payment/success`,
  cancelURL: `${process.env.FRONTEND_URL}/payment/cancel`
});

// ===============================================
// CRITIQUE 4 : Vérification webhook PayDunya
// ─────────────────────────────────────────────
// Problème original : sha512(masterKey) est calculé localement
// et comparé au hash reçu — toute personne connaissant la clé
// peut forger un appel et confirmer un paiement fictif.
//
// Correction :
// 1. Vérifier le hash IPN comme documenté par PayDunya
// 2. Re-confirmer systématiquement le token auprès de l'API PayDunya
//    (source of truth) avant de marquer la commande payée
// 3. Vérifier que le montant reçu correspond au montant de la commande
// ===============================================
const verifyWebhookHash = (receivedHash) => {
  if (!receivedHash) return false;
  const expectedHash = crypto
    .createHash("sha512")
    .update(process.env.PAYDUNYA_MASTER_KEY)
    .digest("hex");
  // Comparaison à temps constant pour éviter timing attack
  try {
    return crypto.timingSafeEqual(
      Buffer.from(receivedHash, "hex"),
      Buffer.from(expectedHash, "hex")
    );
  } catch {
    return false;
  }
};

// ===============================================
// Créer une facture PayDunya
// ===============================================
const createPayDunyaInvoice = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id
    }).populate("products.product", "name images price");

    if (!order) {
      return res.status(404).json({ success: false, message: "Commande introuvable" });
    }

    if (order.paymentStatus === "paid") {
      return res.status(400).json({ success: false, message: "Cette commande est déjà payée" });
    }

    // Facture existante encore en attente → renvoyer l'URL existante
    if (order.paymentToken && order.paymentStatus === "awaiting") {
      try {
        const existingInvoice = new paydunya.CheckoutInvoice(setup, store);
        await existingInvoice.confirm(order.paymentToken);

        if (existingInvoice.status === "completed") {
          order.paymentStatus = "paid";
          order.isPaid = true;
          order.paidAt = new Date();
          await order.save();
          return res.status(200).json({ success: true, message: "Commande déjà payée", order });
        }

        if (existingInvoice.status === "pending") {
          return res.status(200).json({
            success: true,
            message: "Facture existante",
            paymentUrl: existingInvoice.url,
            token: order.paymentToken,
            orderId
          });
        }
      } catch {
        order.paymentToken = null;
        order.paymentStatus = "pending";
        await order.save();
      }
    }

    const invoice = new paydunya.CheckoutInvoice(setup, store);

    if (order.products && order.products.length > 0) {
      for (const item of order.products) {
        const product = item.product;
        const quantity = item.quantity || 1;
        const price = item.price || product.price || 0;
        invoice.addItem(
          product.name || "Produit",
          quantity,
          price,
          quantity * price,
          product.name || "Produit"
        );
      }
    }

    if (order.shippingCost && order.shippingCost > 0) {
      invoice.addTax("Frais de livraison", order.shippingCost);
    }

    invoice.totalAmount = order.totalPrice || 0;

    const uniqueId = `${orderId}-${Date.now()}`;
    invoice.addCustomData("unique_id", uniqueId);
    invoice.addCustomData("order_id", orderId);
    invoice.addCustomData("user_id", req.user._id.toString());
    invoice.addCustomData("customer_name", order.deliveryName || "Client");
    invoice.addCustomData("customer_phone", order.deliveryPhone || "0000000000");

    invoice.description = `Commande #${order.orderNumber || orderId.slice(-8)} - ${Date.now()}`;
    invoice.returnURL = `${process.env.FRONTEND_URL}/payment/success/${orderId}`;
    invoice.cancelURL = `${process.env.FRONTEND_URL}/payment/cancel/${orderId}`;

    const result = await invoice.create();

    if (!result) {
      throw new Error(invoice.responseText || "Erreur création facture PayDunya");
    }

    order.paymentToken = invoice.token;
    order.paymentStatus = "awaiting";
    await order.save();

    res.status(200).json({
      success: true,
      message: "Facture créée avec succès",
      paymentUrl: invoice.url,
      token: invoice.token,
      orderId
    });

  } catch (error) {
    console.error("❌ Erreur createPayDunyaInvoice:", error.message);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la création de la facture PayDunya",
      error: error.message
    });
  }
};

// ===============================================
// Vérifier le statut d'un paiement par token
// ===============================================
const checkPaymentStatus = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ success: false, message: "Token requis" });
    }

    const invoice = new paydunya.CheckoutInvoice(setup, store);
    await invoice.confirm(token);

    res.status(200).json({
      success: true,
      status: invoice.status,
      responseText: invoice.responseText,
      customer: invoice.customer,
      receiptURL: invoice.receiptURL
    });

  } catch (error) {
    console.error("❌ Erreur checkPaymentStatus:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la vérification du paiement",
      error: error.message
    });
  }
};

// ===============================================
// Webhook IPN PayDunya — VERSION SÉCURISÉE
// CRITIQUE 4 : Double vérification
// 1. Vérification hash IPN (comme avant)
// 2. Re-confirmation auprès de l'API PayDunya (nouvelle couche)
// 3. Vérification du montant avant validation
// ===============================================
const paydunyaCallback = async (req, res) => {
  try {
    console.log("📨 Callback PayDunya reçu");

    const paymentData = req.body.data;

    if (!paymentData) {
      console.warn("⚠️ Callback PayDunya : aucune donnée reçue");
      return res.status(200).json({ success: true });
    }

    const { hash, status, invoice, custom_data } = paymentData;

    // ── ÉTAPE 1 : Vérifier le hash IPN à temps constant ──────────────────────
    if (!verifyWebhookHash(hash)) {
      console.warn("⚠️ Callback PayDunya : hash invalide — requête rejetée");
      // On répond 200 pour que PayDunya ne renvoie pas le webhook en boucle
      return res.status(200).json({ success: true });
    }

    console.log("✅ Hash IPN vérifié");

    const orderId = custom_data?.order_id;
    if (!orderId) {
      console.warn("⚠️ Callback PayDunya : order_id absent des custom_data");
      return res.status(200).json({ success: true });
    }

    const order = await Order.findById(orderId).populate("user", "name email");
    if (!order) {
      console.warn(`⚠️ Commande ${orderId} introuvable`);
      return res.status(200).json({ success: true });
    }

    // ── ÉTAPE 2 : Re-confirmer le token auprès de PayDunya ───────────────────
    // C'est la vraie défense : même si le hash est correct, on re-vérifie
    // le statut réel de la facture sur les serveurs PayDunya.
    if (!order.paymentToken) {
      console.warn(`⚠️ Commande ${order.orderNumber} : aucun token PayDunya enregistré`);
      return res.status(200).json({ success: true });
    }

    let confirmedInvoice;
    try {
      confirmedInvoice = new paydunya.CheckoutInvoice(setup, store);
      await confirmedInvoice.confirm(order.paymentToken);
    } catch (confirmErr) {
      console.error("❌ Erreur re-confirmation PayDunya:", confirmErr.message);
      return res.status(200).json({ success: true });
    }

    // ── ÉTAPE 3 : S'assurer que le statut côté PayDunya est bien "completed" ──
    if (confirmedInvoice.status !== "completed") {
      console.warn(`⚠️ Statut PayDunya confirmé : ${confirmedInvoice.status} (attendu: completed)`);
      return res.status(200).json({ success: true });
    }

    // ── ÉTAPE 4 : Vérifier le montant pour éviter le sous-paiement ───────────
    const receivedAmount = invoice?.total_amount || paymentData?.invoice?.total_amount;
    if (receivedAmount && Math.round(receivedAmount) < Math.round(order.totalPrice)) {
      console.error(
        `❌ Montant insuffisant pour commande ${order.orderNumber}:`,
        `reçu ${receivedAmount} FCFA, attendu ${order.totalPrice} FCFA`
      );
      return res.status(200).json({ success: true });
    }

    // ── ÉTAPE 5 : Mettre à jour la commande ──────────────────────────────────
    if (order.paymentStatus !== "paid") {
      order.paymentStatus = "paid";
      order.isPaid = true;
      order.paidAt = new Date();
      order.paymentMethod = invoice?.payment_method || "online";
      order.transactionId = invoice?.token || paymentData.token;

      if (order.status === "pending") {
        order.status = "processing";
      }

      await order.save();

      console.log(`✅ Paiement confirmé (double vérification) — commande ${order.orderNumber}`);
    } else {
      console.log(`ℹ️ Commande ${order.orderNumber} déjà marquée payée`);
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("❌ Erreur paydunyaCallback:", error);
    return res.status(200).json({ success: true });
  }
};

// ===============================================
// Confirmer un paiement après retour sur le site
// ===============================================
const confirmPayment = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ _id: orderId, user: req.user._id });

    if (!order) {
      return res.status(404).json({ success: false, message: "Commande introuvable" });
    }

    if (!order.paymentToken) {
      return res.status(400).json({ success: false, message: "Aucun paiement en cours pour cette commande" });
    }

    const invoice = new paydunya.CheckoutInvoice(setup, store);
    await invoice.confirm(order.paymentToken);

    if (invoice.status === "completed") {
      order.paymentStatus = "paid";
      order.isPaid = true;
      order.paidAt = new Date();

      if (invoice.customer) {
        order.customerInfo = {
          name: invoice.customer.name,
          phone: invoice.customer.phone,
          email: invoice.customer.email
        };
      }

      if (order.status === "pending") {
        order.status = "processing";
      }

      await order.save();

      return res.status(200).json({
        success: true,
        message: "Paiement confirmé",
        order,
        receiptURL: invoice.receiptURL
      });

    } else if (invoice.status === "pending") {
      return res.status(200).json({ success: false, message: "Paiement en attente", status: "pending" });

    } else {
      return res.status(200).json({ success: false, message: "Paiement non complété", status: invoice.status });
    }

  } catch (error) {
    console.error("❌ Erreur confirmPayment:", error);
    res.status(500).json({ success: false, message: "Erreur lors de la confirmation du paiement", error: error.message });
  }
};

// ===============================================
// Obtenir le reçu PDF
// ===============================================
const getPaymentReceipt = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ _id: orderId, user: req.user._id });

    if (!order) {
      return res.status(404).json({ success: false, message: "Commande introuvable" });
    }

    if (!order.paymentToken || order.paymentStatus !== "paid") {
      return res.status(400).json({ success: false, message: "Aucun reçu disponible pour cette commande" });
    }

    const mode = process.env.PAYDUNYA_MODE === "live" ? "" : "sandbox-";
    const receiptURL = `https://app.paydunya.com/${mode}checkout/receipt/pdf/${order.paymentToken}.pdf`;

    res.status(200).json({ success: true, receiptURL });

  } catch (error) {
    console.error("❌ Erreur getPaymentReceipt:", error);
    res.status(500).json({ success: false, message: "Erreur lors de la récupération du reçu", error: error.message });
  }
};

module.exports = {
  createPayDunyaInvoice,
  checkPaymentStatus,
  paydunyaCallback,
  confirmPayment,
  getPaymentReceipt
};
