// 🔥 Calculate discount percentage
export const calculateDiscount = (originalPrice, salePrice) => {
  if (!originalPrice || !salePrice || originalPrice <= salePrice) {
    return 0;
  }
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
};

// 🔥 Calculate days remaining
export const getDaysRemaining = (endDate) => {
  if (!endDate) return 0;
  
  const now = new Date();
  const end = new Date(endDate);
  const diffTime = end - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

// 🔥 Check if warranty is expiring soon (within 30 days)
export const isWarrantyExpiring = (endDate, threshold = 30) => {
  const daysRemaining = getDaysRemaining(endDate);
  return daysRemaining > 0 && daysRemaining <= threshold;
};

// 🔥 Check if warranty is expired
export const isWarrantyExpired = (endDate) => {
  return getDaysRemaining(endDate) <= 0;
};

// 🔥 Generate random ID
export const generateId = (prefix = "id") => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// 🔥 Deep clone object
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// 🔥 Group array by key
export const groupBy = (array, key) => {
  if (!Array.isArray(array)) return {};
  
  return array.reduce((result, item) => {
    const group = item[key];
    if (!result[group]) {
      result[group] = [];
    }
    result[group].push(item);
    return result;
  }, {});
};

// 🔥 Sort array by key
export const sortBy = (array, key, order = "asc") => {
  if (!Array.isArray(array)) return [];
  
  return [...array].sort((a, b) => {
    const valueA = a[key];
    const valueB = b[key];
    
    if (order === "asc") {
      return valueA > valueB ? 1 : -1;
    } else {
      return valueA < valueB ? 1 : -1;
    }
  });
};

// 🔥 Remove duplicates from array
export const uniqueArray = (array, key = null) => {
  if (!Array.isArray(array)) return [];
  
  if (key) {
    const seen = new Set();
    return array.filter(item => {
      const value = item[key];
      if (seen.has(value)) {
        return false;
      }
      seen.add(value);
      return true;
    });
  }
  
  return [...new Set(array)];
};

// 🔥 Debounce function
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// 🔥 Throttle function
export const throttle = (func, limit = 300) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// 🔥 Check if object is empty
export const isEmpty = (obj) => {
  if (obj === null || obj === undefined) return true;
  if (Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === "object") return Object.keys(obj).length === 0;
  return !obj;
};

// 🔥 Merge objects deeply
export const deepMerge = (target, source) => {
  const output = { ...target };
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  
  return output;
};

const isObject = (item) => {
  return item && typeof item === "object" && !Array.isArray(item);
};

// 🔥 Calculate cart total
export const calculateCartTotal = (items = []) => {
  if (!Array.isArray(items)) return 0;
  
  return items.reduce((total, item) => {
    const price = item.price || 0;
    const quantity = item.quantity || 0;
    return total + (price * quantity);
  }, 0);
};

// 🔥 Calculate shipping cost
export const calculateShipping = (subtotal, freeShippingThreshold = 50000) => {
  if (subtotal >= freeShippingThreshold) {
    return 0;
  }
  return 2500; // Default shipping cost
};

// 🔥 Validate email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 🔥 Validate phone (Senegal format)
export const isValidPhone = (phone) => {
  const phoneRegex = /^(\+221|00221)?[0-9]{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
};

// 🔥 Validate password strength
export const isStrongPassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return strongRegex.test(password);
};

// 🔥 Get password strength
export const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: "Très faible", color: "red" };
  
  let score = 0;
  
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[@$!%*?&]/.test(password)) score++;
  
  if (score <= 2) return { score, label: "Très faible", color: "red" };
  if (score <= 3) return { score, label: "Faible", color: "orange" };
  if (score <= 4) return { score, label: "Moyen", color: "yellow" };
  if (score <= 5) return { score, label: "Fort", color: "lightgreen" };
  return { score, label: "Très fort", color: "green" };
};

// 🔥 Extract initials from name
export const getInitials = (name) => {
  if (!name) return "";
  
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

// 🔥 Generate color from string (for avatars)
export const stringToColor = (str) => {
  if (!str) return "#000000";
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const h = hash % 360;
  return `hsl(${h}, 60%, 50%)`;
};

// 🔥 Format credit card number
export const formatCardNumber = (value) => {
  const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
  const matches = v.match(/\d{4,16}/g);
  const match = (matches && matches[0]) || "";
  const parts = [];

  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4));
  }

  if (parts.length) {
    return parts.join(" ");
  } else {
    return value;
  }
};

// 🔥 Copy to clipboard
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error("Failed to copy:", err);
    return false;
  }
};

// 🔥 Download file
export const downloadFile = (url, filename) => {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// 🔥 Scroll to top
export const scrollToTop = (smooth = true) => {
  window.scrollTo({
    top: 0,
    behavior: smooth ? "smooth" : "auto"
  });
};

// 🔥 Scroll to element
export const scrollToElement = (elementId, offset = 0) => {
  const element = document.getElementById(elementId);
  if (element) {
    const top = element.offsetTop - offset;
    window.scrollTo({
      top,
      behavior: "smooth"
    });
  }
};

// 🔥 Get query params from URL
export const getQueryParams = () => {
  const params = new URLSearchParams(window.location.search);
  const result = {};
  for (const [key, value] of params) {
    result[key] = value;
  }
  return result;
};

// 🔥 Update query params in URL
export const updateQueryParams = (params) => {
  const url = new URL(window.location);
  Object.keys(params).forEach(key => {
    if (params[key]) {
      url.searchParams.set(key, params[key]);
    } else {
      url.searchParams.delete(key);
    }
  });
  window.history.pushState({}, "", url);
};

// 🔥 Format bytes to readable size
export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

// 🔥 Chunk array
export const chunkArray = (array, size) => {
  if (!Array.isArray(array)) return [];
  
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

// 🔥 Sleep/delay function
export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export default {
  calculateDiscount,
  getDaysRemaining,
  isWarrantyExpiring,
  isWarrantyExpired,
  generateId,
  deepClone,
  groupBy,
  sortBy,
  uniqueArray,
  debounce,
  throttle,
  isEmpty,
  deepMerge,
  calculateCartTotal,
  calculateShipping,
  isValidEmail,
  isValidPhone,
  isStrongPassword,
  getPasswordStrength,
  getInitials,
  stringToColor,
  formatCardNumber,
  copyToClipboard,
  downloadFile,
  scrollToTop,
  scrollToElement,
  getQueryParams,
  updateQueryParams,
  formatBytes,
  chunkArray,
  sleep
};