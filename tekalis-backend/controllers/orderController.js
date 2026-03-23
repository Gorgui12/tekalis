const Order = require("../models/Order");
const Product = require("../models/Product");
const Cart = require("../models/Cart");
const PromoCode = require("../models/PromoCode");
const nodemailer = require("nodemailer");

// ===============================================
// Transporter email
// ===============================================
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 465,
  secure: Number(process.env.EMAIL_PORT) === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ===============================================
// POST /api/v1/orders — Créer une commande
// ===============================================
exports.createOrder = async (req, res) => {
  try {
    const {
      products,
      totalPrice,
      shippingCost,
      paymentMethod,
      deliveryName,
      deliveryPhone,
      deliveryAddress,
      deliveryCity,
      deliveryRegion,
      promoCode // ✅ récupérer le code promo si présent
    } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ message: "Aucun produit dans la commande" });
    }

    // ─── Vérification et décrément du stock ───────────────────────────────────
    const productIds = products.map(p => p.product);
    const dbProducts = await Product.find({ _id: { $in: productIds } });

    const productMap = {};
    dbProducts.forEach(p => { productMap[p._id.toString()] = p; });

    const stockErrors = [];
    for (const item of products) {
      const dbProduct = productMap[item.product];
      if (!dbProduct) {
        stockErrors.push(`Produit ${item.product} introuvable`);
        continue;
      }
      if (dbProduct.stock < item.quantity) {
        stockErrors.push(`Stock insuffisant pour "${dbProduct.name}" (disponible: ${dbProduct.stock})`);
      }
    }

    if (stockErrors.length > 0) {
      return res.status(400).json({ message: "Problème de stock", errors: stockErrors });
    }

    // ─── Créer la commande ────────────────────────────────────────────────────
    const newOrder = new Order({
      user: req.user._id,
      products,
      totalPrice,
      shippingCost: shippingCost || 0,
      paymentMethod,
      deliveryName,
      deliveryPhone,
      deliveryAddress,
      deliveryCity: deliveryCity || "Dakar",
      deliveryRegion: deliveryRegion || "Dakar"
    });

    await newOrder.save();

    // ─── Décrémenter le stock (opération atomique) ────────────────────────────
    const bulkOps = products.map(item => ({
      updateOne: {
        filter: { _id: item.product },
        update: {
          $inc: { stock: -item.quantity, salesCount: item.quantity }
        }
      }
    }));
    await Product.bulkWrite(bulkOps);

    // ─── Incrémenter l'usage du code promo ✅ ─────────────────────────────────
    if (promoCode) {
      try {
        await PromoCode.findOneAndUpdate(
          { code: promoCode.trim().toUpperCase(), isActive: true },
          {
            $inc: { usageCount: 1 },
            $push: {
              usedBy: {
                user: req.user._id,
                usedAt: new Date(),
                orderAmount: totalPrice
              }
            }
          }
        );
      } catch (promoErr) {
        // Non bloquant : la commande est déjà créée
        console.error("⚠️ Erreur mise à jour code promo:", promoErr.message);
      }
    }

    // ─── Vider le panier ──────────────────────────────────────────────────────
    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { $set: { items: [], subtotal: 0, discount: 0, total: 0, promoCode: undefined } }
    );

    // ─── Répondre immédiatement ───────────────────────────────────────────────
    res.status(201).json({ success: true, ...newOrder.toObject() });

    // ─── Email en arrière-plan ────────────────────────────────────────────────
    const canSendEmail =
      process.env.EMAIL_USER &&
      process.env.EMAIL_PASS &&
      process.env.ADMIN_EMAIL;

    if (canSendEmail) {
      const productList = products
        .map(p => {
          const prod = productMap[p.product] || {};
          return `<li>${prod.name || p.product} — ${p.quantity} × ${(p.price || 0).toLocaleString()} FCFA</li>`;
        })
        .join("");

      const mailOptions = {
        from: `"Tekalis" <${process.env.EMAIL_USER}>`,
        to: process.env.ADMIN_EMAIL,
        subject: `🛍️ Nouvelle commande #${newOrder.orderNumber || newOrder._id}`,
        html: `
          <div style="font-family:Arial,sans-serif;color:#333;max-width:600px;margin:0 auto">
            <h2 style="color:#1E40AF;border-bottom:3px solid #1E40AF;padding-bottom:10px">📦 Nouvelle commande reçue</h2>
            <div style="background:#f3f4f6;padding:15px;border-radius:8px;margin:20px 0">
              <h3 style="margin-top:0">👤 Informations client</h3>
              <p><b>Nom :</b> ${deliveryName}</p>
              <p><b>Téléphone :</b> ${deliveryPhone}</p>
              <p><b>Ville :</b> ${deliveryCity || "Non spécifié"}</p>
              <p><b>Adresse :</b> ${deliveryAddress}</p>
            </div>
            <div style="background:#fef3c7;padding:15px;border-radius:8px;margin:20px 0">
              <h3 style="margin-top:0">💳 Paiement</h3>
              <p><b>Méthode :</b> ${paymentMethod === "cash" ? "💵 Paiement à la livraison" : paymentMethod.toUpperCase()}</p>
              ${promoCode ? `<p><b>Code promo :</b> ${promoCode}</p>` : ""}
              <p><b>Total :</b> <strong style="color:#1E40AF;font-size:1.5em">${totalPrice.toLocaleString()} FCFA</strong></p>
            </div>
            <div style="margin:20px 0">
              <h3>🛒 Produits :</h3>
              <ul>${productList}</ul>
            </div>
            <p style="font-size:12px;color:#777;text-align:center">Commande du ${new Date().toLocaleString("fr-FR")} — #${newOrder.orderNumber || newOrder._id}</p>
          </div>
        `
      };

      transporter.sendMail(mailOptions)
        .then(() => console.log("✅ Email commande envoyé"))
        .catch(err => console.error("❌ Email non envoyé:", err.message));
    }
  } catch (error) {
    console.error("❌ Erreur createOrder:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===============================================
// GET /api/v1/orders — Toutes les commandes (Admin)
// ===============================================
exports.getAllOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      paymentStatus,
      search
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { deliveryName: { $regex: search, $options: "i" } },
        { deliveryPhone: { $regex: search, $options: "i" } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("user", "name email")
        .populate("products.product", "name price images")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Order.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      orders,
      pagination: {
        page: Number(page),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================================
// GET /api/v1/orders/my-orders — Commandes utilisateur
// ===============================================
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("products.product", "name price images")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================================
// GET /api/v1/orders/:id — Détail commande
// ===============================================
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email phone")
      .populate("products.product", "name price images warranty");

    if (!order) {
      return res.status(404).json({ message: "Commande introuvable" });
    }

    if (
      order.user._id.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    ) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================================
// PUT /api/v1/orders/:id/status — Modifier statut (Admin)
// ===============================================
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Statut invalide" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Commande introuvable" });
    }

    if (status === "cancelled") {
      const bulkOps = order.products.map(item => ({
        updateOne: {
          filter: { _id: item.product },
          update: { $inc: { stock: item.quantity, salesCount: -item.quantity } }
        }
      }));
      await Product.bulkWrite(bulkOps);
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================================
// PUT /api/v1/orders/:id/pay — Marquer comme payé (Admin)
// ===============================================
exports.markAsPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Commande introuvable" });
    }

    order.isPaid = true;
    order.paidAt = new Date();
    order.paymentStatus = "paid";
    if (order.status === "pending") order.status = "processing";

    await order.save();

    res.status(200).json({ success: true, message: "Commande marquée comme payée", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================================
// DELETE /api/v1/orders/:id — Supprimer (Admin)
// ===============================================
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Commande introuvable" });
    }
    res.status(200).json({ success: true, message: "Commande supprimée" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = exports;