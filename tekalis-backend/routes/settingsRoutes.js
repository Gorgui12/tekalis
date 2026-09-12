/**
 * routes/settingsRoutes.js
 *
 * Endpoint PUBLIC des paramètres (sans authentification).
 * N'expose QUE les informations sûres et nécessaires au frontend
 * (contact, réseaux sociaux, config de tracking). Rien de sensible.
 *
 * GET /api/v1/settings/public
 */

const express = require("express");
const router = express.Router();
const Settings = require("../models/Settings");

router.get("/settings/public", async (req, res) => {
  try {
    const s = await Settings.findOne({ _id: "site_settings" }).lean();

    const settings = {
      siteName: s?.siteName || "Tekalis",
      siteDescription: s?.siteDescription || "",
      logo: s?.logo || "",
      contactEmail: s?.contactEmail || "",
      contactPhone: s?.contactPhone || "",
      contactAddress: s?.contactAddress || "",
      socialLinks: s?.socialLinks || {},
      shipping: {
        standardCost: s?.shipping?.standardCost ?? 2500,
        freeShippingThreshold: s?.shipping?.freeShippingThreshold ?? 50000,
        expressAvailable: s?.shipping?.expressAvailable ?? true,
        expressCost: s?.shipping?.expressCost ?? 5000,
      },
      paymentMethods: s?.paymentMethods || {},
      maintenance: {
        enabled: s?.maintenance?.enabled ?? false,
        message: s?.maintenance?.message || "",
      },
      seo: {
        googleAnalyticsId:
          s?.seo?.googleAnalyticsId || process.env.GA_MEASUREMENT_ID || "",
        facebookPixelId:
          s?.seo?.facebookPixelId || process.env.META_PIXEL_ID || "",
      },
    };

    res.json({ success: true, settings });
  } catch (err) {
    console.error("❌ Erreur /settings/public:", err.message);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

module.exports = router;