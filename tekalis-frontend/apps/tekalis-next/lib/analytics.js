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
const DEBUG_KEY = "tekalis_debug";

let pendingMetaEvents = [];
let pixelInitialized = false;
let fbScriptLoaded = false;

function debugLog(...args) {
  if (typeof window === "undefined") return;
  try {
    if (window.localStorage.getItem(DEBUG_KEY) === "1") {
      console.log("[tekalis:analytics]", ...args);
    }
  } catch {
    return;
  }
}

export const CONSENT = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
};

// Événement écouté par ConsentBanner pour se rouvrir (lien « Cookies »).
export const OPEN_CONSENT_EVENT = "tekalis:open-consent";

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
  "Contact",
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
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const seo = json?.settings?.seo || {};
      serverSettings = {
        pixel: seo.facebookPixelId || PIXEL_ID,
        ga: seo.googleAnalyticsId || GA_ID,
      };
      debugLog("IDs resolved", {
        pixel: serverSettings.pixel,
        ga: serverSettings.ga,
        source: seo.facebookPixelId ? "settings/public" : "env",
      });
    } catch (err) {
      configLoad = null;
      debugLog("settings/public unavailable", err.message);
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

function currentPageUrl() {
  return typeof window === "undefined" ? "" : window.location.href;
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
    const value = window.localStorage.getItem(CONSENT_KEY) || CONSENT.PENDING;
    debugLog("consent read", value);
    return value;
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

// Enregistre auprès de GA4 l'état de consentement courant puis configure la
// propriété. Appelable AVANT le chargement de gtag.js : le bootstrap du <head>
// définit déjà window.gtag comme file d'attente (dataLayer), donc les commandes
// sont bufferisées puis rejouées dès l'arrivée du script.
function primeGtag() {
  if (typeof window === "undefined" || !window.gtag) return false;
  const gaId = getGaId();
  if (!gaId) return false;
  if (isConsentGranted()) gtagConsentUpdate();
  else gtagConsentRevoke();
  window.gtag("config", gaId, { send_page_view: false });
  return true;
}

// ── Chargement des scripts —─────────────────────────────────
function loadScript(src, id, onLoad, onError) {
  if (typeof document === "undefined") return;
  const existing = document.getElementById(id);
  if (existing) {
    if (existing.dataset.loaded === "1") {
      if (onLoad) onLoad();
    } else {
      existing.addEventListener("load", () => {
        existing.dataset.loaded = "1";
        if (onLoad) onLoad();
      }, { once: true });
      existing.addEventListener("error", () => {
        if (onError) onError();
      }, { once: true });
    }
    return;
  }
  const s = document.createElement("script");
  s.id = id;
  s.src = src;
  s.async = true;
  s.onload = () => {
    s.dataset.loaded = "1";
    if (onLoad) onLoad();
  };
  s.onerror = () => {
    if (onError) onError();
  };
  document.head.appendChild(s);
}

function loadGtag() {
  const gaId = getGaId();
  if (!gaId) return;
  loadScript(`https://www.googletagmanager.com/gtag/js?id=${gaId}`, "tekalis-ga-script", () => {
    // Le consentement + la config sont posés par primeGtag() (avant/à
    // l'init). Ici on émet la page vue GA4 éventuelle.
    trackPageView();
  });
}

function loadMetaPixel() {
  if (getConsent() !== CONSENT.ACCEPTED) return;
  loadScript(
    "https://connect.facebook.net/en_US/fbevents.js",
    "tekalis-fb-pixel",
    () => {
      fbScriptLoaded = true;
      debugLog("fbevents.js loaded");
      initMetaPixel(getPixelId());
      flushMetaQueue();
    },
    () => debugLog("fbevents.js load failed")
  );
}

function initMetaPixel(pixelId) {
  if (!pixelId || pixelInitialized) return;
  const fbq = ensureFbq();
  if (!fbq) return;
  pixelInitialized = true;
  debugLog("Meta pixel initialized", pixelId);
  fbq("consent", "grant");
  fbq("init", pixelId);
  trackPageView();
}

function flushMetaQueue() {
  if (!pixelInitialized || !fbScriptLoaded) return;
  const fbq = ensureFbq();
  if (!fbq) return;
  const queued = pendingMetaEvents.splice(0);
  for (const buildArgs of queued) fbq(...buildArgs());
  if (queued.length) debugLog("queued Meta events flushed", queued.length);
}

async function ensurePixel() {
  if (getConsent() !== CONSENT.ACCEPTED) return null;
  await ensureConfig();
  const pixelId = getPixelId();
  if (!pixelId) {
    debugLog("Meta pixel waiting for ID");
    return null;
  }
  ensureFbq();
  loadMetaPixel();
  initMetaPixel(pixelId);
  flushMetaQueue();
  return window.fbq || null;
}

function sendMetaEvent(eventName, params, options = {}) {
  if (!isConsentGranted()) return;
  const fbq = ensureFbq();
  if (!fbq) return;
  const buildArgs = () => {
    const eventParams = { ...params, event_source_url: currentPageUrl() };
    return META_STANDARD_EVENTS.has(eventName)
      ? ["track", eventName, eventParams, options]
      : ["trackCustom", eventName, eventParams, options];
  };
  if (pixelInitialized && fbScriptLoaded) fbq(...buildArgs());
  else pendingMetaEvents.push(buildArgs);
  debugLog("Meta event", eventName, options.eventID);
  ensurePixel();
}

// ⚠️ fbq doit exister dès le chargement du script d'init — on le définit
// même si le script fbevents.js n'est pas encore arrivé.
function ensureFbq() {
  if (typeof window === "undefined") return null;
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
  if (!isConsentGranted()) return;
  const eventSourceUrl = currentPageUrl();
  try {
    debugLog("CAPI relay", eventName, String(eventId));
    fetch(`${API_BASE}/tracking/event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_name: eventName,
        event_id: String(eventId),
        url: eventSourceUrl,
        event_source_url: eventSourceUrl,
        consent: true,
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
  await ensureConfig();
  primeGtag();
  loadGtag();
  await ensurePixel();
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

// Rouvre la bannière de consentement (lien « Gérer mes cookies » du footer).
// Indispensable depuis l'ajout du gating : sans cela, un visiteur ayant
// refusé ne pouvait plus jamais changer d'avis.
export function openConsentBanner() {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(new CustomEvent(OPEN_CONSENT_EVENT));
  } catch {
    /* no-op */
  }
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

// Appelé au montage : charge la config puis prépare/charge les scripts.
// GA4 est chargé systématiquement (Consent Mode v2) — le script démarre en
// "denied" et émet des pings anonymes, puis bascule en "granted" dès que
// l'utilisateur accepte. Le Pixel Meta reste conditionné au consentement.
export async function initAnalytics() {
  if (typeof window === "undefined") return;
  await ensureConfig();
  primeGtag();
  loadGtag();
  if (getConsent() === CONSENT.ACCEPTED) {
    await ensurePixel();
  }
}

// Événement générique, propagé vers GA4 + Meta + relais CAPI.
export function trackEvent(eventName, params = {}, options = {}) {
  if (typeof window === "undefined") return;

  // event_id unique systématique → déduplication browser/CAPI et GA4.
  const { eventId, metaEventName, relay = true } = options;
  const resolvedId = eventId != null ? String(eventId) : newEventId();

  try {
    // GA4 : toujours émis. En Consent Mode v2, un consentement "denied"
    // anonymise l'événement (cookieless) au lieu de le bloquer.
    const gaId = getGaId();
    if (window.gtag && gaId) {
      window.gtag("event", eventName, {
        ...params,
        event_id: resolvedId,
      });
      debugLog("GA4 event", eventName, resolvedId);
    }

    // Meta (Pixel + relais CAPI) : uniquement après consentement explicite,
    // car ces signaux sont publicitaires.
    if (isConsentGranted()) {
      const metaName = metaEventName || eventName;
      sendMetaEvent(metaName, { ...params }, { eventID: resolvedId });
      if (relay) relayEvent(metaName, resolvedId, params);
    }
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
  const url = currentPageUrl();
  try {
    // GA4 : émis dans tous les cas. En Consent Mode v2, un consentement
    // "denied" transforme l'événement en ping anonyme (sans cookie) : Google
    // reçoit donc des données même sans acceptation, et les données complètes
    // dès que l'utilisateur accepte.
    const gaId = getGaId();
    if (window.gtag && gaId && url !== lastGtagUrl) {
      lastGtagUrl = url;
      window.gtag("event", "page_view", { page_location: url });
    }
    // Meta : uniquement après consentement explicite.
    if (isConsentGranted() && url !== lastFbqUrl) {
      const fbq = ensureFbq();
      if (fbq) {
        lastFbqUrl = url;
        const buildArgs = () => ["track", "PageView", { event_source_url: currentPageUrl() }];
        if (pixelInitialized && fbScriptLoaded) fbq(...buildArgs());
        else pendingMetaEvents.push(buildArgs);
        debugLog("Meta event", "PageView", "-");
      }
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
  if (typeof window === "undefined") return;

  // Un achat ne doit être compté qu'une fois par commande : la page de
  // confirmation (ou un simple rafraîchissement) peut être rechargée. Meta
  // déduplique via event_id, mais GA4 non — d'où ce garde-fou local.
  const transactionId = orderId ? String(orderId) : "";
  if (!isConsentGranted() && transactionId) {
    debugLog("Purchase dedupe skipped (no consent)", transactionId);
  }
  if (transactionId && isConsentGranted()) {
    try {
      const key = `tekalis_purchase_${transactionId}`;
      if (window.localStorage.getItem(key)) return;
      window.localStorage.setItem(key, "1");
    } catch {
      /* localStorage indisponible : on émet quand même l'événement */
    }
  }

  const contents = items
    .map((it) => ({ id: it?._id || it?.id || it?.product?._id, quantity: it?.quantity || 1, price: it?.price }))
    .filter((it) => it.id);

  // GA4 attend `items` (item_id, item_name, price, quantity) pour alimenter
  // ses rapports e-commerce ; Meta attend `contents`. On envoie les deux.
  const gaItems = items
    .map((it) => {
      const product = it?.product || {};
      return {
        item_id: String(it?._id || it?.id || product?._id || ""),
        item_name: it?.name || product?.name || undefined,
        price: Number(it?.price ?? product?.price) || 0,
        quantity: it?.quantity || 1,
      };
    })
    .filter((it) => it.item_id);

  trackEvent(
    "Purchase",
    {
      value,
      currency,
      content_type: "product",
      transaction_id: transactionId || undefined,
      contents,
      content_ids: contents.map((c) => c.id),
      num_items: contents.reduce((s, c) => s + c.quantity, 0),
      items: gaItems,
    },
    { eventId: transactionId || undefined }
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

// ── WhatsApp : conversion principale ────────────────────────
// Google Ads importe l'événement GA4 `whatsapp_click` comme conversion.
// Le numéro est le +221 78 634 69 46 ; tous les liens passent par wa.me.
export function trackWhatsAppClick({ linkText = "", linkUrl = "" } = {}) {
  if (typeof window === "undefined") return;
  trackEvent(
    "whatsapp_click",
    {
      link_text: linkText.slice(0, 100),
      link_url: linkUrl,
      page_location: currentPageUrl(),
      page_path: window.location.pathname,
    },
    { eventId: newEventId(), metaEventName: "Contact" }
  );
}

// Un seul listener délégué au niveau du document couvre TOUS les liens
// WhatsApp — header, fiche produit, footer, configurateur solaire, guides
// de prix… — y compris ceux rendus côté serveur. C'est plus fiable que
// d'instrumenter chaque composant, et les futurs liens sont couverts.
let whatsappListenerAttached = false;

export function initWhatsAppTracking() {
  if (typeof document === "undefined" || whatsappListenerAttached) return;
  whatsappListenerAttached = true;

  document.addEventListener(
    "click",
    (event) => {
      const target = event.target;
      if (!target || typeof target.closest !== "function") return;
      const anchor = target.closest(
        'a[href*="wa.me/"], a[href^="whatsapp://"]'
      );
      if (!anchor) return;
      trackWhatsAppClick({
        linkText: (anchor.getAttribute("aria-label") || anchor.textContent || "")
          .replace(/\s+/g, " ")
          .trim(),
        linkUrl: anchor.getAttribute("href") || "",
      });
    },
    { capture: true, passive: true }
  );
}

export const analytics = {
  PIXEL_ID,
  GA_ID,
};