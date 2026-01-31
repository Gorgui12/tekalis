// ===============================================
// 18. utils/helpers.js
// ===============================================

// Générer un slug à partir d'un texte
const generateSlug = (text) => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

// Générer un numéro de commande unique
const generateOrderNumber = (prefix = "CMD") => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return `${prefix}-${timestamp}${random}`.toUpperCase();
};

// Formater un prix (FCFA)
const formatPrice = (amount) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    minimumFractionDigits: 0
  }).format(amount);
};

// Formater une date
const formatDate = (date, format = "long") => {
  const options = {
    short: { day: "2-digit", month: "2-digit", year: "numeric" },
    long: { 
      weekday: "long", 
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    },
    time: { 
      hour: "2-digit", 
      minute: "2-digit" 
    }
  };
  
  return new Intl.DateTimeFormat("fr-FR", options[format]).format(new Date(date));
};

// Calculer la différence de jours
const daysBetween = (date1, date2 = new Date()) => {
  const diffTime = Math.abs(date2 - date1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Pagination helper
const paginate = (page = 1, limit = 10) => {
  const p = parseInt(page);
  const l = parseInt(limit);
  
  return {
    page: p,
    limit: l,
    skip: (p - 1) * l
  };
};

// Calculer les métadonnées de pagination
const getPaginationMeta = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    nextPage: page < totalPages ? page + 1 : null,
    prevPage: page > 1 ? page - 1 : null
  };
};

// Générer un code aléatoire
const generateRandomCode = (length = 6) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Générer un token aléatoire
const generateToken = (length = 32) => {
  return require("crypto").randomBytes(length).toString("hex");
};

// Nettoyer un objet (supprimer les valeurs undefined/null)
const cleanObject = (obj) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v != null)
  );
};

// Tronquer un texte
const truncate = (text, length = 100, suffix = "...") => {
  if (text.length <= length) return text;
  return text.substring(0, length).trim() + suffix;
};

// Vérifier si une date est expirée
const isExpired = (date) => {
  return new Date(date) < new Date();
};

// Calculer un pourcentage
const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

// Arrondir à 2 décimales
const round = (number, decimals = 2) => {
  return Math.round(number * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

// Attendre X millisecondes (pour tests)
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Validation email
const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Validation téléphone sénégalais
const isValidSenegalPhone = (phone) => {
  const regex = /^(\+221|0)?[0-9]{9}$/;
  return regex.test(phone);
};

// Masquer un email (jo**@ex*****.com)
const maskEmail = (email) => {
  const [name, domain] = email.split("@");
  const maskedName = name.substring(0, 2) + "**";
  const [domainName, ext] = domain.split(".");
  const maskedDomain = domainName.substring(0, 2) + "***";
  return `${maskedName}@${maskedDomain}.${ext}`;
};

// Masquer un téléphone (77 *** ** **)
const maskPhone = (phone) => {
  if (phone.length < 4) return phone;
  return phone.substring(0, 3) + " *** ** **";
};

module.exports = {
  generateSlug,
  generateOrderNumber,
  formatPrice,
  formatDate,
  daysBetween,
  paginate,
  getPaginationMeta,
  generateRandomCode,
  generateToken,
  cleanObject,
  truncate,
  isExpired,
  calculatePercentage,
  round,
  sleep,
  isValidEmail,
  isValidSenegalPhone,
  maskEmail,
  maskPhone
};
