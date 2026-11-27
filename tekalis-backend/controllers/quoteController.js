const path = require("path");
const QuoteRequest = require("../models/QuoteRequest");
const Product = require("../models/Product");
const Settings = require("../models/Settings");
const EmailService = require("../services/emailService");
const { calculateQuoteTotals, generateQuotePdf, quotePdfFilename } = require("../services/quotePdfService");
const { escapeRegex } = require("../utils/regexEscape");

const QUOTE_STATUSES = ["pending", "sent", "accepted", "rejected", "converted", "cancelled"];
const isValidId = (value) => typeof value === "string" && /^[0-9a-fA-F]{24}$/.test(value);

const sanitizeFilename = (name) => {
  const cleaned = path.basename(String(name || "attachment"))
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^\.+/, "")
    .slice(0, 120);
  return cleaned || "attachment";
};

const normalizeItems = (value) => {
  let items = value;
  if (typeof items === "string") {
    try {
      items = JSON.parse(items);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(items)) return [];

  const merged = new Map();
  for (const item of items) {
    const id = String(item && item.product || "");
    const quantity = parseInt(item && item.quantity, 10);
    if (!isValidId(id) || !Number.isInteger(quantity) || quantity < 1 || quantity > 1000) continue;
    if (merged.has(id)) {
      merged.set(id, Math.min(1000, merged.get(id) + quantity));
    } else {
      merged.set(id, quantity);
    }
  }
  return [...merged.entries()].map(([product, quantity]) => ({ product, quantity }));
};

exports.createQuote = async (req, res) => {
  try {
    const normalized = normalizeItems(req.body.items);
    const ids = normalized.map((item) => item.product);
    let dbProducts = [];

    if (ids.length) {
      dbProducts = await Product.find({ _id: { $in: ids } });
    }

    const productMap = new Map(dbProducts.map((product) => [product._id.toString(), product]));
    const unknown = ids.filter((id) => !productMap.has(id));
    if (unknown.length) {
      return res.status(400).json({
        success: false,
        errors: [{ field: "items", message: `Produit introuvable: ${unknown.join(", ")}` }]
      });
    }

    const items = normalized.map(({ product: id, quantity }) => {
      const product = productMap.get(id);
      const price = Math.round(Number(product.price) || 0);
      return {
        product: product._id,
        name: product.name,
        sku: product.sku || product.mpn || "",
        price,
        quantity,
        lineTotal: price * quantity
      };
    });
    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);

    let settings = null;
    try {
      settings = await Settings.findById("site_settings").lean();
    } catch (error) {
      console.error("⚠️ Lecture Settings devis impossible:", error.message);
    }
    const totals = calculateQuoteTotals(subtotal, settings);

    const attachments = (req.files || []).map((file) => ({
      name: sanitizeFilename(file.originalname),
      mimeType: String(file.mimetype || "application/octet-stream").toLowerCase(),
      size: file.size,
      data: file.buffer.toString("base64"),
      uploadedAt: new Date()
    }));

    const quote = new QuoteRequest({
      quoteNumber: QuoteRequest.generateQuoteNumber(),
      company: String(req.body.company || "").trim(),
      name: String(req.body.name || "").trim(),
      email: String(req.body.email || "").trim().toLowerCase(),
      phone: String(req.body.phone || "").trim(),
      message: String(req.body.message || "").trim(),
      source: req.body.source || "web",
      solarSummary: String(req.body.solarSummary || "").trim(),
      user: req.user && req.user._id || null,
      items,
      ...totals,
      attachments
    });

    await quote.save();

    res.status(201).json({
      success: true,
      quote: {
        id: quote._id.toString(),
        quoteNumber: quote.quoteNumber,
        items,
        subtotal: quote.subtotal,
        shippingCost: quote.shippingCost,
        total: quote.total,
        status: quote.status,
        validUntil: quote.validUntil,
        createdAt: quote.createdAt
      }
    });

    const emailQuote = quote.toObject();
    const emailAttachments = emailQuote.attachments.map((file) => ({
      filename: file.name,
      content: Buffer.from(file.data, "base64")
    }));

    generateQuotePdf(emailQuote)
      .then((pdfBuffer) =>
        EmailService.sendQuoteRequestConfirmation(emailQuote, pdfBuffer, emailQuote.validUntil)
          .then((result) => {
            if (!result || (!result.success && !result.queued)) return null;
            return QuoteRequest.findOneAndUpdate(
              { _id: emailQuote._id, status: "pending" },
              {
                $set: { status: "sent" },
                $push: { statusHistory: { status: "sent", updatedAt: new Date() } }
              },
              { new: true }
            );
          })
      )
      .catch((error) => console.error("⚠️ Email devis client non envoyé:", error.message));

    EmailService.notifyAdminNewQuote(emailQuote, emailAttachments)
      .catch((error) => console.error("⚠️ Email devis admin non envoyé:", error.message));

  } catch (error) {
    console.error("❌ Erreur createQuote:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAdminQuotes = async (req, res) => {
  try {
    const requestedPage = parseInt(req.query.page, 10);
    const requestedLimit = parseInt(req.query.limit, 10);
    const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;
    const limit = Number.isFinite(requestedLimit) && requestedLimit > 0
      ? Math.min(requestedLimit, 100)
      : 20;

    const filter = {};
    if (typeof req.query.status === "string" && req.query.status.trim()) {
      filter.status = req.query.status.trim();
    }
    if (typeof req.query.search === "string" && req.query.search.trim()) {
      const search = escapeRegex(req.query.search.trim());
      filter.$or = [
        { quoteNumber: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    const [quotes, total] = await Promise.all([
      QuoteRequest.find(filter)
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      QuoteRequest.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      quotes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("❌ Erreur getAdminQuotes:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAdminQuote = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(404).json({ success: false, message: "Devis introuvable" });
    }
    const quote = await QuoteRequest.findById(req.params.id).populate("user", "name email");
    if (!quote) {
      return res.status(404).json({ success: false, message: "Devis introuvable" });
    }
    res.status(200).json({ success: true, quote });
  } catch (error) {
    console.error("❌ Erreur getAdminQuote:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateQuoteStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!QUOTE_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        errors: [{ field: "status", message: "Statut invalide" }]
      });
    }
    if (!isValidId(req.params.id)) {
      return res.status(404).json({ success: false, message: "Devis introuvable" });
    }

    const quote = await QuoteRequest.findByIdAndUpdate(
      req.params.id,
      {
        $set: { status },
        $push: { statusHistory: { status, updatedAt: new Date() } }
      },
      { new: true }
    ).populate("user", "name email");

    if (!quote) {
      return res.status(404).json({ success: false, message: "Devis introuvable" });
    }

    res.status(200).json({ success: true, quote });
  } catch (error) {
    console.error("❌ Erreur updateQuoteStatus:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.downloadQuotePdf = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(404).json({ success: false, message: "Devis introuvable" });
    }
    const quote = await QuoteRequest.findById(req.params.id);
    if (!quote) {
      return res.status(404).json({ success: false, message: "Devis introuvable" });
    }
    const pdf = await generateQuotePdf(quote.toObject());
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${quotePdfFilename(quote)}"`);
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.send(pdf);
  } catch (error) {
    console.error("❌ Erreur downloadQuotePdf:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.downloadAttachment = async (req, res) => {
  try {
    if (!isValidId(req.params.id) || !/^\d+$/.test(req.params.index)) {
      return res.status(404).json({ success: false, message: "Pièce jointe introuvable" });
    }
    const quote = await QuoteRequest.findById(req.params.id).select("+attachments.data");
    if (!quote) {
      return res.status(404).json({ success: false, message: "Devis introuvable" });
    }
    const attachment = quote.attachments[Number(req.params.index)];
    if (!attachment || !attachment.data) {
      return res.status(404).json({ success: false, message: "Pièce jointe introuvable" });
    }
    const filename = sanitizeFilename(attachment.name);
    res.setHeader("Content-Type", attachment.mimeType || "application/octet-stream");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`
    );
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.send(Buffer.from(attachment.data, "base64"));
  } catch (error) {
    console.error("❌ Erreur downloadAttachment:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
