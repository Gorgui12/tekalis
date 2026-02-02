// 🔥 Format price in FCFA
export const formatPrice = (price) => {
  if (typeof price !== "number") {
    return "0 FCFA";
  }
  return `${price.toLocaleString("fr-FR")} FCFA`;
};

// 🔥 Format compact price (K, M)
export const formatCompactPrice = (price) => {
  if (typeof price !== "number") {
    return "0 FCFA";
  }
  
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(1)}M FCFA`;
  }
  if (price >= 1000) {
    return `${(price / 1000).toFixed(0)}K FCFA`;
  }
  return `${price} FCFA`;
};

// 🔥 Format date
export const formatDate = (date, format = "short") => {
  if (!date) return "";
  
  const d = new Date(date);
  
  if (format === "short") {
    return d.toLocaleDateString("fr-FR");
  }
  
  if (format === "long") {
    return d.toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  }
  
  if (format === "datetime") {
    return d.toLocaleString("fr-FR");
  }
  
  return d.toLocaleDateString("fr-FR");
};

// 🔥 Format relative time
export const formatRelativeTime = (date) => {
  if (!date) return "";
  
  const now = new Date();
  const d = new Date(date);
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays < 7) return `Il y a ${diffDays}j`;
  
  return formatDate(date);
};

// 🔥 Format phone number
export const formatPhoneNumber = (phone) => {
  if (!phone) return "";
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, "");
  
  // Format: +221 XX XXX XX XX
  if (cleaned.startsWith("221")) {
    const number = cleaned.slice(3);
    return `+221 ${number.slice(0, 2)} ${number.slice(2, 5)} ${number.slice(5, 7)} ${number.slice(7, 9)}`;
  }
  
  // Format: XX XXX XX XX
  if (cleaned.length === 9) {
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7, 9)}`;
  }
  
  return phone;
};

// 🔥 Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// 🔥 Format percentage
export const formatPercentage = (value, decimals = 0) => {
  if (typeof value !== "number") return "0%";
  return `${value.toFixed(decimals)}%`;
};

// 🔥 Format order number
export const formatOrderNumber = (orderId) => {
  if (!orderId) return "";
  return `#${orderId.slice(-8).toUpperCase()}`;
};

// 🔥 Format rating
export const formatRating = (rating) => {
  if (typeof rating !== "number") return "0.0";
  return rating.toFixed(1);
};

// 🔥 Truncate text
export const truncateText = (text, maxLength = 100) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

// 🔥 Format slug
export const formatSlug = (text) => {
  if (!text) return "";
  
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with hyphens
    .replace(/(^-|-$)/g, ""); // Remove leading/trailing hyphens
};

// 🔥 Capitalize first letter
export const capitalize = (text) => {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

// 🔥 Format address
export const formatAddress = (address) => {
  if (!address) return "";
  
  const parts = [
    address.street,
    address.city,
    address.region,
    address.postalCode,
    address.country
  ].filter(Boolean);
  
  return parts.join(", ");
};

// 🔥 Format credit card (masqué)
export const formatCreditCard = (cardNumber) => {
  if (!cardNumber) return "";
  const last4 = cardNumber.slice(-4);
  return `**** **** **** ${last4}`;
};

// 🔥 Format duration
export const formatDuration = (minutes) => {
  if (typeof minutes !== "number" || minutes < 0) return "0 min";
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
};

// 🔥 Format warranty period
export const formatWarrantyPeriod = (months) => {
  if (typeof months !== "number" || months <= 0) return "Pas de garantie";
  
  if (months === 12) return "1 an";
  if (months % 12 === 0) return `${months / 12} ans`;
  return `${months} mois`;
};

// 🔥 Format stock status
export const formatStockStatus = (stock) => {
  if (typeof stock !== "number") return { label: "Inconnu", color: "gray" };
  
  if (stock === 0) return { label: "Rupture de stock", color: "red" };
  if (stock < 5) return { label: `Plus que ${stock} en stock`, color: "orange" };
  return { label: "En stock", color: "green" };
};

// 🔥 Format discount
export const formatDiscount = (originalPrice, discountedPrice) => {
  if (!originalPrice || !discountedPrice || originalPrice <= discountedPrice) {
    return null;
  }
  
  const discount = Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
  return discount;
};

// 🔥 Format search query
export const formatSearchQuery = (query) => {
  if (!query) return "";
  return query.trim().replace(/\s+/g, " ");
};

export default {
  formatPrice,
  formatCompactPrice,
  formatDate,
  formatRelativeTime,
  formatPhoneNumber,
  formatFileSize,
  formatPercentage,
  formatOrderNumber,
  formatRating,
  truncateText,
  formatSlug,
  capitalize,
  formatAddress,
  formatCreditCard,
  formatDuration,
  formatWarrantyPeriod,
  formatStockStatus,
  formatDiscount,
  formatSearchQuery
};