// ============================================================
// lib/analytics.js — Couche de tracking client (Meta Pixel + GA4)
// Consent Mode v2 : les scripts ne sont chargés qu'après acceptation
// de l'utilisateur. Les valeurs par défaut (denied) sont posées dans
// le <head> (voir app/layout.jsx) AVANT le chargement de tout script.
// ============================================================

const PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID || "";
const GA_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || "";

const CONSENT_KEY = "tekalis_consent";

export const CONSENT = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
};

// Événements standard Meta (track) — les autres passent en trackCustom
const META_STANDARD_EVENTS = new Set([
  "ViewContent",
  "AddToCart",
  "InitiateCheckout",
  "AddPaymentInfo",
  "Purchase",
  "Search",
  "AddToWishlist",
  "ViewCategory",
]);

// ── Gestion du consentement ─────────────────────────────────
export function getConsent() {
  if (typeof window === "undefined") return CONSENT.PENDING;
  try {
    return window.localStorage.getItem(CONSENT_KEY) || CONSENT.PENDING;
  } catch {
    return CONSENT.PENDING;
  }
}

export function setConsent(value) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CONSENT_KEY, value);
  } catch {
    /* localStorage indisponible (navigation privée) : sans effet */
  }
}

export function isConsentGranted() {
  return getConsent() === CONSENT.ACCEPTED;
}

const CONSENT_FIELDS = {
  ad_storage: "granted",
  ad_user_data: "granted",
  ad_personalization: "granted",
  analytics_storage: "granted",
};

function gtagConsentUpdate() {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("consent", "update", { ...CONSENT_FIELDS });
}

function gtagConsentRevoke() {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("consent", "update", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
  });
}

// ── Chargement des scripts —─────────────────────────────────
function loadScript(src, id, onLoad) {
  if (typeof document === "undefined") return;
  if (document.getElementById(id)) {
    if (onLoad) onLoad();
    return;
  }
  const s = document.createElement("script");
  s.id = id;
  s.src = src;
  s.async = true;
  s.onload = () => onLoad && onLoad();
  document.head.appendChild(s);
}

function loadGtag() {
  if (!GA_ID) return;
  loadScript(`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`, "tekalis-ga-script", () => {
    if (window.gtag) {
      gtagConsentUpdate();
      window.gtag("config", GA_ID, { send_page_view: false });
      window.gtag("event", "page_view", { page_location: window.location.href });
    }
  });
}

function loadMetaPixel() {
  if (!PIXEL_ID) return;
  loadScript("https://connect.facebook.net/en_US/fbevents.js", "tekalis-fb-pixel", () => {
    if (window.fbq) {
      window.fbq("consent", "grant");
      window.fbq("init", PIXEL_ID);
      window.fbq("track", "PageView");
    }
  });
}

// ⚠️ fbq doit exister dès le chargement du script d'init — on le définit
// même si le script fbevents.js n'est pas encore arrivé.
function ensureFbq() {
  if (typeof window === "undefined") return null;
  if (!PIXEL_ID) return null;
  if (!window.fbq) {
    window.fbq = function fbq(...args) {
      window.fbq.callMethod
        ? window.fbq.callMethod.apply(window.fbq, args)
        : window.fbq.queue.push(args);
    };
    if (!window._fbq) window._fbq = window.fbq;
    window.fbq.push = window.fbq;
    window.fbq.loaded = true;
    window.fbq.version = "2.0";
    window.fbq.queue = [];
  }
  return window.fbq;
}

// ── API publique ────────────────────────────────────────────
export function grantConsent() {
  setConsent(CONSENT.ACCEPTED);
  gtagConsentUpdate();
  loadGtag();
  ensureFbq();
  loadMetaPixel();
}

export function revokeConsent() {
  setConsent(CONSENT.REJECTED);
  gtagConsentRevoke();
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("consent", "revoke");
  }
}

// Appelé au montage : charge les scripts si un consentement
// a déjà été accordé lors d'une visite précédente.
export function initAnalytics() {
  if (typeof window === "undefined") return;
  if (getConsent() === CONSENT.ACCEPTED) {
    ensureFbq();
    loadGtag();
    loadMetaPixel();
  }
}

// Événement générique, propagé vers GA4 + Meta (si consentement).
export function trackEvent(eventName, params = {}, options = {}) {
  if (typeof window === "undefined") return;
  if (!isConsentGranted()) return;

  const { eventId } = options;

  try {
    if (window.gtag && GA_ID) {
      window.gtag("event", eventName, {
        ...params,
        ...(eventId ? { event_id: eventId } : {}),
      });
    }

    const fbq = ensureFbq();
    if (fbq) {
      const metaParams = { ...params };
      const opts = eventId ? { eventID: eventId } : undefined;
      if (META_STANDARD_EVENTS.has(eventName)) {
        fbq("track", eventName, metaParams, opts);
      } else {
        fbq("trackCustom", eventName, metaParams, opts);
      }
    }
  } catch {
    /* le tracking ne doit jamais casser l'UI */
  }
}

// PageView SPA : appelé à chaque changement de route.
export function trackPageView() {
  if (typeof window === "undefined") return;
  if (!isConsentGranted()) return;
  try {
    if (window.gtag && GA_ID) {
      window.gtag("event", "page_view", { page_location: window.location.href });
    }
    const fbq = ensureFbq();
    if (fbq) fbq("track", "PageView");
  } catch {
    /* no-op */
  }
}

// ── Helpers métier ──────────────────────────────────────────
function productParams(product, quantity = 1) {
  const id = product?._id || product?.id;
  return {
    content_type: "product",
    content_ids: id ? [id] : [],
    contents: id ? [{ id, quantity }] : [],
    content_name: product?.name,
    value: (product?.price || 0) * quantity,
    currency: "XOF",
  };
}

export function trackViewContent(product) {
  trackEvent("ViewContent", productParams(product, 1), { eventId: product?._id });
}

export function trackAddToCart(product, quantity = 1) {
  trackEvent("AddToCart", productParams(product, quantity), { eventId: product?._id });
}

export function trackInitiateCheckout({ items = [], value = 0, currency = "XOF" } = {}) {
  const contents = items
    .map((it) => ({ id: it?._id || it?.id, quantity: it?.quantity || 1 }))
    .filter((it) => it.id);
  trackEvent("InitiateCheckout", {
    content_type: "product",
    contents,
    content_ids: contents.map((c) => c.id),
    num_items: items.length,
    value,
    currency,
  });
}

export function trackAddPaymentInfo({ items = [], value = 0, currency = "XOF" } = {}) {
  const contents = items
    .map((it) => ({ id: it?._id || it?.id, quantity: it?.quantity || 1 }))
    .filter((it) => it.id);
  trackEvent("AddPaymentInfo", {
    content_type: "product",
    contents,
    content_ids: contents.map((c) => c.id),
    value,
    currency,
  });
}

export function trackPurchase({ orderId, value = 0, currency = "XOF", items = [] } = {}) {
  const contents = items
    .map((it) => ({ id: it?._id || it?.id || it?.product?._id, quantity: it?.quantity || 1, price: it?.price }))
    .filter((it) => it.id);
  trackEvent(
    "Purchase",
    {
      value,
      currency,
      transaction_id: orderId,
      contents,
      content_ids: contents.map((c) => c.id),
      num_items: contents.reduce((s, c) => s + c.quantity, 0),
    },
    { eventId: orderId }
  );
}

export function trackSearch(searchTerm) {
  trackEvent("Search", { search_string: searchTerm || "" });
}

export const analytics = {
  PIXEL_ID,
  GA_ID,
};