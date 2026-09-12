// ============================================================
// services/metaCapiService.js — Meta Conversions API (CAPI)
// Envoi serveur→serveur des événements de conversion vers le
// Pixel Meta (Graph API), sans dépendre du navigateur client.
// Utile pour : pertes de pixel (AdBlock, consentement refusé,
// navigation inter-appareils), déduplication avec le browser.
//
// Configuration requise (voir .env) :
//   META_PIXEL_ID          — ID du pixel
//   META_CAPI_ACCESS_TOKEN — token d'accès CAPI (Meta Events Manager)
//   META_CAPI_VERSION      — version Graph API (défaut v21.0)
// ============================================================
const crypto = require("crypto");

const PIXEL_ID = process.env.META_PIXEL_ID || "";
const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN || "";
const CAPI_VERSION = process.env.META_CAPI_VERSION || "v21.0";

const isConfigured = !!(PIXEL_ID && ACCESS_TOKEN);

// ── Normalisation + hash SHA-256 (exigence Meta) ─────────────────────────
// Formulaire mobile sénégalais : (00221|+221|0) + 9 chiffres → 9 chiffres
const normalizePhone = (phone) =>
  String(phone || "")
    .replace(/[^0-9]/g, "")
    .replace(/^00/, "")
    .replace(/^221/, "")
    .replace(/^0/, "");

const hashField = (value) => {
  const v = String(value || "").trim().toLowerCase();
  if (!v) return undefined;
  return crypto.createHash("sha256").update(v).digest("hex");
};

const buildUserData = ({ email, phone, fbc, fbp } = {}) => {
  const data = { country: "SN", city: "Dakar" };
  const em = hashField(email);
  const ph = hashField(normalizePhone(phone));
  if (em) data.em = [em];
  if (ph) data.ph = [ph];
  if (fbc) data.fbc = fbc;
  if (fbp) data.fbp = fbp;
  return data;
};

// ── Envoi générique d'événement ────────────────────────────────────────────
async function sendEvent({
  eventName,
  eventId,
  eventTime,
  userData,
  customData,
  actionSource = "website",
}) {
  if (!isConfigured) {
    console.warn(
      `[MetaCAPI] Pixel ou Access Token non configuré — événement "${eventName}" ignoré.`
    );
    return null;
  }

  const payload = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor((eventTime || Date.now()) / 1000),
        action_source: actionSource,
        ...(eventId ? { event_id: String(eventId) } : {}),
        user_data: buildUserData(userData || {}),
        ...(customData ? { custom_data: customData } : {}),
      },
    ],
  };

  const testCode = process.env.META_CAPI_TEST_EVENT_CODE;
  if (testCode) payload.test_event_code = testCode;

  try {
    const res = await fetch(
      `https://graph.facebook.com/${CAPI_VERSION}/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }
    );
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error("[MetaCAPI] Erreur d'envoi:", json?.error?.message || res.status);
      return null;
    }
    console.log(
      `[MetaCAPI] ✅ ${eventName} envoyé — réponses: ${JSON.stringify({ messages_received: json?.events_received }) }`
    );
    return json;
  } catch (err) {
    console.error("[MetaCAPI] Échec réseau:", err.message);
    return null;
  }
}

// ── Événement Purchase (dédupliqué via event_id = orderId) ───────────────
async function trackPurchase({
  orderId,
  value = 0,
  currency = "XOF",
  items = [],
  email,
  phone,
  fbc,
  fbp,
}) {
  return sendEvent({
    eventName: "Purchase",
    eventId: orderId,
    userData: { email, phone, fbc, fbp },
    customData: {
      currency,
      value,
      content_type: "product",
      contents: items.map((it) => ({
        id: it?.product || it?.id || undefined,
        quantity: it?.quantity || 1,
        item_price: it?.price || 0,
      })),
    },
  });
}

module.exports = {
  isConfigured,
  sendEvent,
  trackPurchase,
  normalizePhone,
  hashField,
};