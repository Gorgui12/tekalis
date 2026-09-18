// ============================================================
// lib/analytics.js — Couche de tracking client (Meta Pixel + GA4)
// Consent Mode v2 : les scripts ne sont chargés qu'après acceptation
// de l'utilisateur. Les valeurs par défaut (denied) sont posées dans
// le <head> (voir app/layout.jsx) AVANT le chargement de tout script.
//
// Source des IDs : /api/v1/settings/public (admin > Settings > SEO) en
// priorité, avec repli sur les variables NEXT_PUBLIC_*.
//
// Chaque événement :
//   1. part vers Meta (fbq) et GA4 (gtag) avec un event_id unique
//      (déduplication + mesure des conversions API),
//   2. est relayé au backend (POST /api/v1/tracking/event) qui le
//      renvoie à la Meta Conversions API (CAPI) — protège des pertes
//      si le pixel browser est bloqué.
// ============================================================

const PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID || "";
const GA_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || "";

const API_BASE = (() => {
  const raw = process.env.NEXT_PUBLIC_API_BASE || "/api/v1";
  const cleaned = raw.replace(/\/+$/, "").replace(/\/api\/v1$/, "");
  return `${cleaned}/api/v1`;
})();

const CONSENT_KEY = "tekalis_consent";
const SESSION_KEY = "tekalis_session";

export const CONSENT = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
};

// Événements standard Meta (track) — les autres passent en trackCustom
const META_STANDARD_EVENTS = new Set([
  "ViewContent",
  "AddToCart",
  "RemoveFromCart",
  "InitiateCheckout",
  "AddPaymentInfo",
  "Purchase",
  "Search",
  "AddToWishlist",
  "ViewCategory",
]);

// ── IDs dynamiques (settings/public) ─────────────────────────
// Les IDs peuvent être renseignés dans l'admin (Settings > SEO).
// On les charge une seule fois avant de charger les scripts.
let serverSettings = null;
let configLoad = null;

export async function ensureConfig() {
  if (typeof document === "undefined") return;
  if (configLoad) return configLoad;
  configLoad = (async () => {
    try {
      const res = await fetch(`${API_BASE}/settings/public`, {
        cache: "no-store",
      });
      if (res.ok) {
        const json = await res.json();
        const seo = json?.settings?.seo || {};
        serverSettings = {
          pixel: seo.facebookPixelId || PIXEL_ID,
          ga: seo.googleAnalyticsId || GA_ID,
        };
      }
    } catch {
      /* backend indisponible : on garde les valeurs d'environnement */
    } finally {
      configLoad = null;
    }
  })();
  return configLoad;
}

const getPixelId = () => (serverSettings && serverSettings.pixel) || PIXEL_ID;
const getGaId = () => (serverSettings && serverSettings.ga) || GA_ID;

// ── Helpers divers ───────────────────────────────────────────
function newEventId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
}

function getCookie(name) {
  if (typeof document === "undefined") return "";
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  if (!m) return "";
  try {
    return decodeURIComponent(m[1]);
  } catch {
    return m[1];
  }
}

function getSessionId() {
  if (typeof window === "undefined") return "";
  try {
    let id = window.localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = newEventId();
      window.localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return newEventId();
  }
}

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
  const gaId = getGaId();
  if (!gaId) return;
  loadScript(`https://www.googletagmanager.com/gtag/js?id=${gaId}`, "tekalis-ga-script", () => {
    if (window.gtag) {
      gtagConsentUpdate();
      window.gtag("config", gaId, { send_page_view: false });
      // La page vue est émise ici et par AnalyticsProvider : trackPageView
      // déduplique par URL pour éviter les doubles comptages.
      trackPageView();
    }
  });
}

function loadMetaPixel() {
  const pixelId = getPixelId();
  if (!pixelId) return;
  loadScript("https://connect.facebook.net/en_US/fbevents.js", "tekalis-fb-pixel", () => {
    if (window.fbq) {
      window.fbq("consent", "grant");
      window.fbq("init", pixelId);
      trackPageView();
    }
  });
}

// ⚠️ fbq doit exister dès le chargement du script d'init — on le définit
// même si le script fbevents.js n'est pas encore arrivé.
function ensureFbq() {
  if (typeof window === "undefined") return null;
  if (!getPixelId()) return null;
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

// ── Relais serveur (Meta CAPI) ──────────────────────────────
// Envoie une copie de l'événement au backend, qui le renvoie à la
// Conversions API. `_fbc`/`_fbp` (cookies Meta) sont transmis pour
// conserver l'attribution cross-device. Fire-and-forget : jamais
// bloquant pour l'interface.
function relayEvent(eventName, eventId, customData) {
  if (!getPixelId()) return;
  try {
    fetch(`${API_BASE}/tracking/event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_name: eventName,
        event_id: String(eventId),
        url: window.location.href,
        fbc: getCookie("_fbc") || undefined,
        fbp: getCookie("_fbp") || undefined,
        custom_data: customData || {},
      }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* le tracking ne doit jamais casser l'UI */
  }
}

// ── API publique ────────────────────────────────────────────
export async function grantConsent() {
  setConsent(CONSENT.ACCEPTED);
  gtagConsentUpdate();
  await ensureConfig();
  loadGtag();
  ensureFbq();
  loadMetaPixel();
  notifyConsentChanged();
}

export function revokeConsent() {
  setConsent(CONSENT.REJECTED);
  gtagConsentRevoke();
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("consent", "revoke");
  }
  notifyConsentChanged();
}

// Événement custom — permet aux composants React (AnalyticsProvider, etc.)
// de réagir au changement de consentement sans polling localStorage.
function notifyConsentChanged() {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(
      new CustomEvent("tekalis:consent-changed", { detail: getConsent() })
    );
  } catch {
    /* no-op */
  }
}

// Appelé au montage : charge la config puis charge les scripts si un
// consentement a déjà été accordé lors d'une visite précédente.
export async function initAnalytics() {
  if (typeof window === "undefined") return;
  await ensureConfig();
  if (getConsent() === CONSENT.ACCEPTED) {
    ensureFbq();
    loadGtag();
    loadMetaPixel();
  }
}

// Événement générique, propagé vers GA4 + Meta + relais CAPI.
export function trackEvent(eventName, params = {}, options = {}) {
  if (typeof window === "undefined") return;
  if (!isConsentGranted()) return;

  // event_id unique systématique → déduplication browser/CAPI et GA4.
  const { eventId } = options;
  const resolvedId = eventId != null ? String(eventId) : newEventId();

  try {
    const gaId = getGaId();
    if (window.gtag && gaId) {
      window.gtag("event", eventName, {
        ...params,
        event_id: resolvedId,
      });
    }

    const fbq = ensureFbq();
    if (fbq) {
      const metaParams = { ...params };
      const opts = { eventID: resolvedId };
      if (META_STANDARD_EVENTS.has(eventName)) {
        fbq("track", eventName, metaParams, opts);
      } else {
        fbq("trackCustom", eventName, metaParams, opts);
      }
    }

    relayEvent(eventName, resolvedId, params);
  } catch {
    /* le tracking ne doit jamais casser l'UI */
  }
}

// PageView SPA : appelé à chaque changement de route, ainsi qu'au
// chargement des scripts (onload). Dédupliqué PAR TRACKER et par URL
// pour émettre exactement une page_view par route et par système.
let lastGtagUrl = "";
let lastFbqUrl = "";

export function trackPageView() {
  if (typeof window === "undefined") return;
  if (!isConsentGranted()) return;
  const url = window.location.href;
  try {
    const gaId = getGaId();
    if (window.gtag && gaId && url !== lastGtagUrl) {
      lastGtagUrl = url;
      window.gtag("event", "page_view", { page_location: url });
    }
    const fbq = ensureFbq();
    if (fbq && url !== lastFbqUrl) {
      lastFbqUrl = url;
      fbq("track", "PageView");
    }
  } catch {
    /* no-op */
  }
}

// Page vue côté serveur (comptage sessions pour l'admin analytics).
export function trackPageVisit() {
  if (typeof window === "undefined") return;
  if (!isConsentGranted()) return;
  try {
    fetch(`${API_BASE}/tracking/visit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: getSessionId(),
        path: window.location.pathname,
      }),
      keepalive: true,
    }).catch(() => {});
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

export function trackRemoveFromCart(product, quantity = 1) {
  trackEvent("RemoveFromCart", productParams(product, quantity), { eventId: product?._id });
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

export function trackViewCategory(name) {
  if (!name) return;
  trackEvent(
    "ViewCategory",
    {
      content_type: "product",
      content_name: name,
      content_category: name,
    },
    { eventId: name }
  );
}

export function trackProductImpressions(products = []) {
  const ids = (products || [])
    .map((p) => p?._id || p?.id)
    .filter(Boolean);
  if (ids.length === 0) return;
  trackEvent("ProductImpressions", {
    content_type: "product",
    content_ids: ids,
    contents: ids.map((id) => ({ id, quantity: 1 })),
  });
}

export const analytics = {
  PIXEL_ID,
  GA_ID,
};