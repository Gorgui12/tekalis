// ============================================================
// lib/authPrompt.js — Pilotage des invites à créer un compte
//
// Pourquoi ce module ?
//   Google ne propose son bouton que sur /login et /register, deux
//   pages que le visiteur n'atteint qu'en fin de parcours. Sur une
//   boutique, le compte est obligatoire pour commander (le middleware
//   protège /checkout), donc l'invite doit apparaître AVANT le rebond :
//   au panier, sur les favoris, après une commande, ou à un moment
//   d'engagement fort.
//
// Règles anti-agacement (le but est de convertir, pas d'énerver) :
//   1. jamais sur les pages d'auth ni celles déjà protégées (/checkout,
//      /dashboard…) : l'utilisateur y est déjà en train de s'authentifier ;
//   2. une seule invitation automatique par session ;
//   3. sept jours minimum entre deux invitations automatiques ;
//   4. aucune invitation automatique si le visiteur n'a montré aucun
//      signal d'intention (panier vide et une seule fiche produit vue) ;
//   5. « Ne plus proposer » désactive définitivement les invitations.
//
// Le module ne dépend ni de React ni du store : il expose un bus
// minimal (`subscribe` / `openAuthPrompt`) consommé par
// components/auth/AuthPromptHost.jsx, seul composant monté en global.
// ============================================================

import { trackEvent } from "@/lib/analytics";
import { isGoogleConfigured } from "@/lib/googleIdentity";

const KEY_SESSION_SHOWN = "tekalis_prompt_shown_session";
const KEY_LAST_SHOWN   = "tekalis_prompt_last_shown";
const KEY_OPT_OUT      = "tekalis_prompt_optout";
const KEY_VISITS       = "tekalis_prompt_visits";
const KEY_ENGAGEMENT   = "tekalis_prompt_engagement";
const KEY_SESSION_PATH = "tekalis_prompt_last_path";
const KEY_SESSION_VIEWS = "tekalis_prompt_product_views";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Délai minimum entre deux invitations automatiques (jours). */
const AUTO_COOLDOWN_DAYS = 7;

/** Délai avant l'invitation « engagement » sur une page produit (ms). */
export const ENGAGEMENT_DELAY_MS = 45000;

/**
 * Délai avant l'apparition du bandeau bas d'écran « Continue avec Google »
 * après l'arrivée d'un visiteur sur le site (ms).
 */
export const LANDING_DELAY_MS = 6000;

// ── Raisons et argumentaires ─────────────────────────────────
// `icon` référence une icône mappée dans AuthPromptCard/AuthPromptModal.
// Les textes sont volontairement orientés bénéfice, pas technique.
export const PROMPT_REASONS = {
  cart: {
    icon: "cart",
    title: "Plus qu'un clic pour commander",
    subtitle:
      "Votre panier est prêt. Créez votre compte en un clic pour finaliser la commande.",
    bullets: [
      { icon: "bolt",   text: "Commande enregistrée avec vos produits favoris" },
      { icon: "truck",  text: "Suivi de livraison et historique de commandes" },
      { icon: "shield", text: "Garanties et SAV centralisés dans votre espace" },
    ],
  },
  wishlist: {
    icon: "heart",
    title: "Gardez vos favoris sur tous vos appareils",
    subtitle:
      "Créez votre compte en un clic : vos favoris et vos prix vous suivent partout.",
    bullets: [
      { icon: "bolt",   text: "Favoris synchronisés sur mobile et ordinateur" },
      { icon: "bell",   text: "Alerte dès qu'un prix baisse" },
      { icon: "shield", text: "Vos garanties constructeur au même endroit" },
    ],
  },
  order: {
    icon: "box",
    title: "Créez votre compte pour suivre votre commande",
    subtitle:
      "Votre commande est confirmée. Un compte gratuit vous donne le suivi en temps réel et vos documents de garantie.",
    bullets: [
      { icon: "truck",  text: "Suivi de la livraison étape par étape" },
      { icon: "shield", text: "Facture et garanties téléchargeables" },
      { icon: "headset", text: "SAV : nos techniciens répondent dans votre dossier" },
    ],
  },
  home: {
    icon: "user",
    title: "Créez votre compte Tekalis en un clic",
    subtitle:
      "Un clic avec Google, sans mot de passe à retenir, et votre compte est prêt.",
    bullets: [
      { icon: "bolt",   text: "Commande en 2 clics, sans ressaisir vos coordonnées" },
      { icon: "truck",  text: "Suivi de livraison et historique" },
      { icon: "shield", text: "Garanties et SAV dans votre espace" },
    ],
  },
  exit: {
    icon: "cart",
    title: "Votre panier vous attend",
    subtitle:
      "Créez votre compte en un clic avec Google : vos articles, vos prix et vos garanties restent enregistrés.",
    bullets: [
      { icon: "bolt",   text: "Aucun mot de passe à créer" },
      { icon: "truck",  text: "Livraison suivie depuis votre espace" },
    ],
  },
  engagement: {
    icon: "bolt",
    title: "Un compte, ça change tout",
    subtitle:
      "Vous faites le tour de nos produits. Créez votre compte en un clic pour gagner du temps à la commande.",
    bullets: [
      { icon: "bolt",   text: "Coordonnées enregistrées pour la prochaine commande" },
      { icon: "shield", text: "Garanties et SAV suivis depuis votre espace" },
    ],
  },
  landing: {
    icon: "user",
    title: "Un compte Tekalis, c'est gratuit",
    subtitle:
      "Connectez-vous avec Google et vos articles, prix et garanties restent enregistrés.",
    bullets: [
      { icon: "bolt",   text: "Aucun mot de passe à retenir" },
      { icon: "truck",  text: "Commande en 2 clics et suivi de livraison" },
      { icon: "shield", text: "Garanties et SAV centralisés dans votre espace" },
    ],
  },
};

// ── Bus minimal ──────────────────────────────────────────────
let listener = null;

export function subscribeAuthPrompt(fn) {
  listener = fn;
  return () => {
    if (listener === fn) listener = null;
  };
}

/**
 * Demande l'affichage d'une invitation.
 * @param {{reason?: keyof PROMPT_REASONS, source?: string}} options
 * @returns {boolean} true si l'invitation a réellement été demandée
 */
export function openAuthPrompt({ reason = "exit", source = "auto" } = {}) {
  if (typeof window === "undefined") return false;
  if (!listener) return false;
  const config = PROMPT_REASONS[reason];
  if (!config) return false;
  listener({ ...config, reason, source });
  return true;
}

// ── Stockage (tolérant aux navigations privées) ──────────────
function readLocal(key) {
  try {
    return window.localStorage.getItem(key) || "";
  } catch {
    return "";
  }
}

function writeLocal(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* navigation privée : le plafond est simplement ignoré */
  }
}

function readSession(key) {
  try {
    return window.sessionStorage.getItem(key) || "";
  } catch {
    return "";
  }
}

function writeSession(key, value) {
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    /* idem */
  }
}

export function isPromptOptedOut() {
  return readLocal(KEY_OPT_OUT) === "1";
}

export function optOutAuthPrompt() {
  writeLocal(KEY_OPT_OUT, "1");
}

// ── Contexte visiteur ────────────────────────────────────────
// Renseigné par AuthPromptHost (seul composant connecté au store et
// au routeur). On lit l'intention depuis le panier et depuis le nombre
// de fiches produits vues, pas depuis le temps passé : c'est un signal
// beaucoup plus fiable pour décider de proposer un compte.
let engagement = { cartCount: 0, wishlistCount: 0, productViews: 0, visits: 0 };

export function markEngagement({ cartCount, wishlistCount, path } = {}) {
  if (typeof window === "undefined") return;

  if (typeof cartCount === "number") {
    engagement.cartCount = cartCount;
  }
  if (typeof wishlistCount === "number") {
    engagement.wishlistCount = wishlistCount;
  }
  if (typeof path === "string") {
    engagement.productViews = countProductView(path);
  }
  engagement.visits = getVisitCount();

  writeLocal(KEY_ENGAGEMENT, JSON.stringify(engagement));
}

function countProductView(path) {
  const previousPath = readSession(KEY_SESSION_PATH);
  const isProductOrCategory =
    path.startsWith("/products/") ||
    path.startsWith("/category/") ||
    path.startsWith("/prix");
  // On ne compte qu'une vue par fiche et par session : revenir en arrière
  // dans l'historique ne doit pas gonfler le compteur.
  if (previousPath === path) return Number(readSession(KEY_SESSION_VIEWS)) || 0;
  writeSession(KEY_SESSION_PATH, path);
  if (!isProductOrCategory) return Number(readSession(KEY_SESSION_VIEWS)) || 0;
  const next = (Number(readSession(KEY_SESSION_VIEWS)) || 0) + 1;
  writeSession(KEY_SESSION_VIEWS, String(next));
  return next;
}

export function getVisitCount() {
  if (typeof window === "undefined") return 0;
  const inSession = readSession("tekalis_prompt_visited");
  if (inSession === "1") return Number(readLocal(KEY_VISITS)) || 1;
  writeSession("tekalis_prompt_visited", "1");
  const next = (Number(readLocal(KEY_VISITS)) || 0) + 1;
  writeLocal(KEY_VISITS, String(next));
  return next;
}

/** Panier non vide, favori ajouté, ou au moins deux fiches produits vues. */
export function hasSignupIntent() {
  return (
    engagement.cartCount > 0 ||
    engagement.wishlistCount > 0 ||
    engagement.productViews >= 2
  );
}

export function isReturningVisitor() {
  return getVisitCount() > 1;
}

// ── Éligibilité ──────────────────────────────────────────────
// Les pages où l'invite n'a aucun sens : on est déjà en train de
// s'authentifier, ou le compte est déjà établi (checkout, dashboard).
// /payment est volontairement absent : la page de confirmation de
// commande est le meilleur moment pour proposer le suivi.
const EXCLUDED_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/checkout",
  "/dashboard",
  "/profile",
];

export function isAuthenticated() {
  if (typeof window === "undefined") return false;
  try {
    return !!window.localStorage.getItem("token");
  } catch {
    return false;
  }
}

// Les sources « automatiques » : l'invite surgit sans que le visiteur
// l'ait demandée. Elles restent plafonnées (une par session au maximum).
//   "auto"        : exit intent / engagement, avec en plus un délai de
//                   sept jours entre deux invites.
//   "landing"     : bandeau bas d'écran affiché peu après l'arrivée.
//   "wishlist-add": le visiteur vient d'ajouter un favori — signal
//                   d'intention explicite, pas besoin d'une semaine de
//                   délai, mais une seule fois par session suffit.
const AUTOMATIC_SOURCES = ["auto", "landing", "wishlist-add"];

export function canPrompt({ source = "auto", requireIntent = false } = {}) {
  if (typeof window === "undefined") return false;
  if (isAuthenticated()) return false;
  if (isPromptOptedOut()) return false;
  if (!isGoogleConfigured()) return false;

  const path = window.location.pathname;
  if (EXCLUDED_PATHS.some((p) => path === p || path.startsWith(`${p}/`))) return false;

  // Les invitations affichées dans une carte font déjà partie d'un
  // parcours choisi par le visiteur : elles ne sont jamais plafonnées.
  if (!AUTOMATIC_SOURCES.includes(source)) return true;

  // Le signal d'intention est exigé uniquement pour les invites
  // « auto » (exit intent, engagement) : là, il vient du comportement
  // de navigation, pas d'un clic. Pour « wishlist-add », le geste
  // lui-même (ajouter un favori) EST le signal.
  if (source === "auto" && requireIntent && !hasSignupIntent()) return false;
  if (readSession(KEY_SESSION_SHOWN) === "1") return false;

  if (source === "auto" || source === "landing") {
    const last = Number(readLocal(KEY_LAST_SHOWN)) || 0;
    if (last && Date.now() - last < AUTO_COOLDOWN_DAYS * MS_PER_DAY) return false;
  }

  return true;
}

/** À appeler quand une invitation est effectivement affichée. */
export function notePromptShown(source = "auto") {
  writeSession(KEY_SESSION_SHOWN, "1");
  if (source === "auto" || source === "landing") writeLocal(KEY_LAST_SHOWN, String(Date.now()));
}

// ── Tracking ─────────────────────────────────────────────────
// Ces événements ne partent que si le consentement a été accordé
// (garde-fou de trackEvent) : aucune donnée n'est collectée avant.
export function trackPromptViewed({ reason, source }) {
  trackEvent("AuthPromptViewed", { reason, source, auto: source === "auto" });
}

export function trackPromptDismissed({ reason, source }) {
  trackEvent("AuthPromptDismissed", { reason, source });
}

export function trackPromptFallback({ reason, source }) {
  trackEvent("AuthPromptEmailFallback", { reason, source });
}

export function trackGoogleAuthStarted({ reason, source }) {
  trackEvent("AuthPromptGoogleClick", { reason, source });
}

export function trackAuthSuccess({ reason, source, isNewAccount }) {
  trackEvent(isNewAccount ? "SignUp" : "Login", {
    method: "google",
    reason,
    source,
  });
}