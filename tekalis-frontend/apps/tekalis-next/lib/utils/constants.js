// 🔥 API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://tekalis.onrender.com/api";

// 🔥 App Configuration
export const APP_NAME = "Tekalis";
export const APP_VERSION = "1.0.0";
export const CURRENCY = "FCFA";

// 🔥 Order Status
export const ORDER_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  REFUNDED: "refunded"
};

export const ORDER_STATUS_LABELS = {
  pending: "En attente",
  processing: "En traitement",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
  refunded: "Remboursée"
};

export const ORDER_STATUS_COLORS = {
  pending: { bg: "bg-yellow-100", text: "text-yellow-700" },
  processing: { bg: "bg-blue-100", text: "text-blue-700" },
  shipped: { bg: "bg-purple-100", text: "text-purple-700" },
  delivered: { bg: "bg-green-100", text: "text-green-700" },
  cancelled: { bg: "bg-red-100", text: "text-red-700" },
  refunded: { bg: "bg-gray-100", text: "text-gray-700" }
};

// 🔥 Payment Methods
export const PAYMENT_METHODS = {
  CASH: "cash",
  WAVE: "wave",
  ORANGE_MONEY: "om",
  FREE_MONEY: "free",
  CARD: "card"
};

export const PAYMENT_METHOD_LABELS = {
  cash: "Paiement à la livraison",
  wave: "Wave",
  om: "Orange Money",
  free: "Free Money",
  card: "Carte bancaire"
};

// 🔥 Product Categories
export const PRODUCT_CATEGORIES = [
  "Laptops",
  "PC Bureau",
  "Composants",
  "Périphériques",
  "Accessoires",
  "Gaming",
  "Smartphones",
  "Tablettes",
  "Monitors",
  "Storage"
];

// 🔥 RMA Status
export const RMA_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  REJECTED: "rejected"
};

export const RMA_STATUS_LABELS = {
  pending: "En attente",
  approved: "Approuvée",
  in_progress: "En cours",
  completed: "Terminée",
  rejected: "Refusée"
};

// 🔥 RMA Types
export const RMA_TYPES = {
  REPAIR: "repair",
  REPLACEMENT: "replacement",
  REFUND: "refund",
  TECHNICAL_SUPPORT: "technical_support"
};

export const RMA_TYPE_LABELS = {
  repair: "Réparation",
  replacement: "Remplacement",
  refund: "Remboursement",
  technical_support: "Support technique"
};

// 🔥 Warranty Status
export const WARRANTY_STATUS = {
  ACTIVE: "active",
  EXPIRING: "expiring",
  EXPIRED: "expired"
};

// 🔥 Review Rating
export const RATING_LABELS = {
  5: "Excellent",
  4: "Très bien",
  3: "Bien",
  2: "Moyen",
  1: "Mauvais"
};

// 🔥 Article Categories
export const ARTICLE_CATEGORIES = {
  TEST: "test",
  GUIDE: "guide",
  TUTORIAL: "tutorial",
  NEWS: "news",
  COMPARISON: "comparison"
};

export const ARTICLE_CATEGORY_LABELS = {
  test: "Test",
  guide: "Guide",
  tutorial: "Tutoriel",
  news: "Actualités",
  comparison: "Comparatif"
};

// 🔥 Shipping Configuration
export const SHIPPING = {
  FREE_SHIPPING_THRESHOLD: 50000, // FCFA
  STANDARD_SHIPPING_COST: 2500, // FCFA
  EXPRESS_SHIPPING_COST: 5000, // FCFA
  DELIVERY_TIME: {
    DAKAR: "2-3 jours",
    REGIONS: "4-7 jours"
  }
};

// 🔥 Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 12,
  PAGE_SIZE_OPTIONS: [12, 24, 36, 48]
};

// 🔥 Image Configuration
export const IMAGE = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ["image/jpeg", "image/png", "image/webp"],
  PLACEHOLDER: "/placeholder.png"
};

// 🔥 Notification Types
export const NOTIFICATION_TYPES = {
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning",
  INFO: "info"
};

// 🔥 Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: "token",
  USER: "user",
  CART: "cart",
  THEME: "theme",
  LANGUAGE: "language"
};

// 🔥 Routes
export const ROUTES = {
  HOME: "/",
  PRODUCTS: "/products",
  CART: "/cart",
  CHECKOUT: "/checkout",
  DASHBOARD: "/dashboard",
  LOGIN: "/login",
  REGISTER: "/register",
  ADMIN_DASHBOARD: "/admin",
  ADMIN_PRODUCTS: "/admin/products",
  ADMIN_ORDERS: "/admin/orders"
};

// 🔥 Regex Patterns
export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_SN: /^(\+221|00221)?[0-9]{9}$/,
  PASSWORD_STRONG: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
};

// 🔥 Error Messages
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: "Ce champ est requis",
  INVALID_EMAIL: "Adresse email invalide",
  INVALID_PHONE: "Numéro de téléphone invalide",
  PASSWORD_TOO_SHORT: "Le mot de passe doit contenir au moins 8 caractères",
  PASSWORDS_DONT_MATCH: "Les mots de passe ne correspondent pas",
  NETWORK_ERROR: "Erreur de connexion. Vérifiez votre connexion internet.",
  SERVER_ERROR: "Erreur serveur. Veuillez réessayer plus tard."
};

// 🔥 Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: "Connexion réussie !",
  REGISTER_SUCCESS: "Inscription réussie !",
  LOGOUT_SUCCESS: "Déconnexion réussie !",
  PRODUCT_ADDED_TO_CART: "Produit ajouté au panier",
  ORDER_CREATED: "Commande créée avec succès",
  PROFILE_UPDATED: "Profil mis à jour",
  REVIEW_SUBMITTED: "Avis publié avec succès"
};

export default {
  API_BASE_URL,
  APP_NAME,
  APP_VERSION,
  CURRENCY,
  ORDER_STATUS,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  PRODUCT_CATEGORIES,
  RMA_STATUS,
  RMA_STATUS_LABELS,
  RMA_TYPES,
  RMA_TYPE_LABELS,
  WARRANTY_STATUS,
  RATING_LABELS,
  ARTICLE_CATEGORIES,
  ARTICLE_CATEGORY_LABELS,
  SHIPPING,
  PAGINATION,
  IMAGE,
  NOTIFICATION_TYPES,
  STORAGE_KEYS,
  ROUTES,
  REGEX,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES
};