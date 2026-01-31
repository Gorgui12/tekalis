// ===============================================
// controllers/paymentController.js
// Intégration PayDunya
// ===============================================
const paydunya = require('paydunya');
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const crypto = require('crypto');

// Configuration PayDunya
const setup = new paydunya.Setup({
  masterKey: process.env.PAYDUNYA_MASTER_KEY,
  privateKey: process.env.PAYDUNYA_PRIVATE_KEY,
  publicKey: process.env.PAYDUNYA_PUBLIC_KEY,
  token: process.env.PAYDUNYA_TOKEN,
  mode: process.env.PAYDUNYA_MODE || 'test'
});

// Configuration du magasin
const store = new paydunya.Store({
  name: process.env.STORE_NAME || "Ma Boutique",
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
// Créer une facture PayDunya et rediriger
// ===============================================
const createPayDunyaInvoice = async (req, res) => {
  try {
    const { orderId } = req.body;

    console.log("💳 Tentative de création de facture PayDunya pour orderId:", orderId);

    // Vérifier que la commande existe et appartient à l'utilisateur
    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id
    }).populate("products.product", "name images price");

    if (!order) {
      console.log("❌ Commande introuvable:", orderId);
      return res.status(404).json({
        success: false,
        message: "Commande introuvable"
      });
    }

    console.log("✅ Commande trouvée:", order.orderNumber, "| Status paiement:", order.paymentStatus);

    // Vérifier que la commande n'est pas déjà payée
    if (order.paymentStatus === "paid") {
      console.log("⚠️ Commande déjà payée");
      return res.status(400).json({
        success: false,
        message: "Cette commande est déjà payée"
      });
    }

    // 🔁 Si facture déjà en attente → renvoyer l'URL existante
    if (order.paymentToken && order.paymentStatus === "awaiting") {
      console.log("⚠️ Une facture existe déjà pour cette commande:", order.paymentToken);

      try {
        const existingInvoice = new paydunya.CheckoutInvoice(setup, store);
        await existingInvoice.confirm(order.paymentToken);

        if (existingInvoice.status === "completed") {
          order.paymentStatus = "paid";
          order.isPaid = true;
          order.paidAt = new Date();
          await order.save();

          return res.status(200).json({
            success: true,
            message: "Commande déjà payée",
            order
          });
        }

        if (existingInvoice.status === "pending") {
          return res.status(200).json({
            success: true,
            message: "Une facture existe déjà pour cette commande",
            paymentUrl: existingInvoice.url,
            token: order.paymentToken,
            orderId
          });
        }

      } catch (err) {
        console.log("⚠️ Facture existante invalide, création d'une nouvelle...");
        // Réinitialiser le token pour créer une nouvelle facture
        order.paymentToken = null;
        order.paymentStatus = 'pending';
        await order.save();
      }
    }

    console.log("🔨 Création d'une nouvelle facture PayDunya...");
    const invoice = new paydunya.CheckoutInvoice(setup, store);

    // Ajouter les produits
    if (order.products && order.products.length > 0) {
      for (const item of order.products) {
        const product = item.product;
        const quantity = item.quantity || 1;
        const price = item.price || product.price || 0;

        console.log(`  📦 ${product.name} x${quantity} = ${quantity * price} FCFA`);
        
        invoice.addItem(
          product.name || "Produit",
          quantity,
          price,
          quantity * price,
          product.name || "Produit"
        );
      }
    }

    // Ajouter frais de livraison si existants
    if (order.shippingCost && order.shippingCost > 0) {
      console.log(`  🚚 Frais de livraison: ${order.shippingCost} FCFA`);
      invoice.addTax("Frais de livraison", order.shippingCost);
    }

    invoice.totalAmount = order.totalPrice || 0;
    console.log(`  💰 Total: ${invoice.totalAmount} FCFA`);

    // ✅ CORRECTION : Ajouter un identifiant unique pour éviter les doublons
    const uniqueId = `${orderId}-${Date.now()}`;
    invoice.addCustomData("unique_id", uniqueId);
    invoice.addCustomData("order_id", orderId);
    invoice.addCustomData("user_id", req.user._id.toString());
    invoice.addCustomData("customer_name", order.deliveryName || "Client");
    invoice.addCustomData("customer_phone", order.deliveryPhone || "0000000000");

    // ✅ CORRECTION : Ajouter timestamp dans la description pour unicité
    invoice.description = `Commande #${order.orderNumber || orderId.slice(-8)} - ${Date.now()}`;
    
    invoice.returnURL = `${process.env.FRONTEND_URL}/payment/success/${orderId}`;
    invoice.cancelURL = `${process.env.FRONTEND_URL}/payment/cancel/${orderId}`;

    console.log("📡 Envoi de la facture à PayDunya...");
    const result = await invoice.create();

    if (!result) {
      console.error("❌ Échec de création:");
      console.error("  Status:", invoice.status);
      console.error("  Response:", invoice.responseText);
      throw new Error(invoice.responseText || "Erreur création facture PayDunya");
    }

    // Sauvegarder le token et status
    order.paymentToken = invoice.token;
    order.paymentStatus = "awaiting";
    await order.save();

    console.log("✅ Facture PayDunya créée avec succès !");
    console.log(`  🔑 Token: ${invoice.token}`);
    console.log(`  🔗 URL: ${invoice.url}`);

    res.status(200).json({
      success: true,
      message: "Facture créée avec succès",
      paymentUrl: invoice.url,
      token: invoice.token,
      orderId
    });

  } catch (error) {
    console.error("❌ Erreur createPayDunyaInvoice:", error.message);
    console.error("   Stack:", error.stack);

    res.status(500).json({
      success: false,
      message: "Erreur lors de la création de la facture PayDunya",
      error: error.message || error.toString()
    });
  }
};

// ===============================================
// Vérifier le statut d'un paiement
// ===============================================
const checkPaymentStatus = async (req, res) => {
  try {
    const { token } = req.params;
    
    if (!token) {
      return res.status(400).json({ 
        success: false,
        message: "Token requis" 
      });
    }
    
    console.log("🔍 Vérification du statut de paiement pour token:", token);
    
    // Créer une instance de facture
    const invoice = new paydunya.CheckoutInvoice(setup, store);
    
    // Vérifier le statut sur PayDunya
    await invoice.confirm(token);
    
    console.log("✅ Statut récupéré:", invoice.status);
    
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
// Webhook IPN - Instant Payment Notification
// ===============================================
const paydunyaCallback = async (req, res) => {
  try {
    console.log("📨 Callback PayDunya reçu");
    console.log("📦 Body:", JSON.stringify(req.body, null, 2));
    
    // PayDunya envoie les données dans req.body.data
    const paymentData = req.body.data;
    
    if (!paymentData) {
      console.log("⚠️ Aucune donnée reçue");
      return res.status(200).json({ success: true });
    }
    
    const { hash, status, invoice, custom_data } = paymentData;
    
    // Vérifier le hash pour s'assurer que les données viennent de PayDunya
    const masterKeyHash = crypto
      .createHash('sha512')
      .update(process.env.PAYDUNYA_MASTER_KEY)
      .digest('hex');
    
    if (hash !== masterKeyHash) {
      console.log("⚠️ Hash invalide - requête non authentifiée");
      console.log("  Hash reçu:", hash);
      console.log("  Hash attendu:", masterKeyHash);
      return res.status(200).json({ success: true });
    }
    
    console.log("✅ Hash valide - requête authentifiée");
    
    // Récupérer l'ID de commande depuis les custom_data
    const orderId = custom_data?.order_id;
    
    if (!orderId) {
      console.log("⚠️ Aucun order_id trouvé dans custom_data");
      return res.status(200).json({ success: true });
    }
    
    console.log("🔍 Recherche de la commande:", orderId);
    
    // Trouver la commande
    const order = await Order.findById(orderId).populate('user', 'name email');
    
    if (!order) {
      console.log(`⚠️ Commande ${orderId} introuvable`);
      return res.status(200).json({ success: true });
    }
    
    console.log(`📦 Commande trouvée: ${order.orderNumber}`);
    console.log(`💳 Statut PayDunya: ${status}`);
    
    // Mettre à jour le statut de la commande selon le statut PayDunya
    if (status === "completed") {
      order.paymentStatus = 'paid';
      order.isPaid = true;
      order.paidAt = new Date();
      order.paymentMethod = invoice?.payment_method || 'online';
      order.transactionId = invoice?.token || paymentData.token;
      
      // Si la commande était en attente, la passer en "processing"
      if (order.status === 'pending') {
        order.status = 'processing';
      }
      
      await order.save();
      
      console.log(`✅ Paiement confirmé pour commande ${order.orderNumber}`);
      console.log(`  💰 Montant: ${order.totalPrice} FCFA`);
      console.log(`  📅 Date: ${order.paidAt}`);
      
      // TODO: Envoyer email de confirmation
      // TODO: Créer une notification pour l'utilisateur
      
    } else if (status === "cancelled") {
      order.paymentStatus = 'failed';
      await order.save();
      console.log(`❌ Paiement annulé pour commande ${order.orderNumber}`);
    } else {
      console.log(`⚠️ Statut inconnu pour commande ${order.orderNumber}: ${status}`);
    }
    
    // Toujours retourner 200 pour que PayDunya ne renvoie pas le webhook
    res.status(200).json({ success: true });
    
  } catch (error) {
    console.error("❌ Erreur paydunyaCallback:", error);
    // Toujours retourner 200 même en cas d'erreur
    res.status(200).json({ success: true });
  }
};

// ===============================================
// Confirmer un paiement après retour sur le site
// ===============================================
const confirmPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    console.log("🔍 Confirmation de paiement pour commande:", orderId);
    
    // Vérifier que la commande existe
    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id
    });
    
    if (!order) {
      console.log("❌ Commande introuvable");
      return res.status(404).json({ 
        success: false,
        message: "Commande introuvable" 
      });
    }
    
    console.log("✅ Commande trouvée:", order.orderNumber);
    
    // Si la commande n'a pas de token PayDunya, erreur
    if (!order.paymentToken) {
      console.log("⚠️ Aucun token PayDunya trouvé");
      return res.status(400).json({ 
        success: false,
        message: "Aucun paiement en cours pour cette commande" 
      });
    }
    
    console.log("🔍 Vérification du token PayDunya:", order.paymentToken);
    
    // Vérifier le statut sur PayDunya
    const invoice = new paydunya.CheckoutInvoice(setup, store);
    await invoice.confirm(order.paymentToken);
    
    console.log("📊 Statut PayDunya:", invoice.status);
    
    // Mettre à jour la commande selon le statut PayDunya
    if (invoice.status === "completed") {
      order.paymentStatus = 'paid';
      order.isPaid = true;
      order.paidAt = new Date();
      
      if (invoice.customer) {
        order.customerInfo = {
          name: invoice.customer.name,
          phone: invoice.customer.phone,
          email: invoice.customer.email
        };
      }
      
      if (order.status === 'pending') {
        order.status = 'processing';
      }
      
      await order.save();
      
      console.log(`✅ Paiement confirmé pour ${order.orderNumber}`);
      
      res.status(200).json({
        success: true,
        message: "Paiement confirmé",
        order,
        receiptURL: invoice.receiptURL
      });
      
    } else if (invoice.status === "pending") {
      console.log("⏳ Paiement toujours en attente");
      res.status(200).json({
        success: false,
        message: "Paiement en attente",
        status: "pending"
      });
      
    } else {
      console.log("❌ Paiement non complété, statut:", invoice.status);
      res.status(200).json({
        success: false,
        message: "Paiement non complété",
        status: invoice.status
      });
    }
    
  } catch (error) {
    console.error("❌ Erreur confirmPayment:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la confirmation du paiement",
      error: error.message
    });
  }
};

// ===============================================
// Obtenir le reçu PDF d'un paiement
// ===============================================
const getPaymentReceipt = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    console.log("📄 Demande de reçu pour commande:", orderId);
    
    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id
    });
    
    if (!order) {
      console.log("❌ Commande introuvable");
      return res.status(404).json({ 
        success: false,
        message: "Commande introuvable" 
      });
    }
    
    if (!order.paymentToken || order.paymentStatus !== 'paid') {
      console.log("⚠️ Aucun reçu disponible - Token:", order.paymentToken, "Status:", order.paymentStatus);
      return res.status(400).json({ 
        success: false,
        message: "Aucun reçu disponible pour cette commande" 
      });
    }
    
    // Construire l'URL du reçu PDF
    const mode = process.env.PAYDUNYA_MODE === 'live' ? '' : 'sandbox-';
    const receiptURL = `https://app.paydunya.com/${mode}checkout/receipt/pdf/${order.paymentToken}.pdf`;
    
    console.log("✅ URL du reçu générée:", receiptURL);
    
    res.status(200).json({
      success: true,
      receiptURL
    });
    
  } catch (error) {
    console.error("❌ Erreur getPaymentReceipt:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération du reçu",
      error: error.message
    });
  }
};

// ===============================================
// EXPORTS
// ===============================================
module.exports = {
  createPayDunyaInvoice,
  checkPaymentStatus,
  paydunyaCallback,
  confirmPayment,
  getPaymentReceipt
};