// 🔥 Validation utilities

// 🔥 Email validation
export const validateEmail = (email) => {
  const errors = [];
  
  if (!email || email.trim() === "") {
    errors.push("L'email est requis");
    return { isValid: false, errors };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errors.push("Format d'email invalide");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// 🔥 Password validation
export const validatePassword = (password, confirmPassword = null) => {
  const errors = [];
  
  if (!password || password.trim() === "") {
    errors.push("Le mot de passe est requis");
    return { isValid: false, errors };
  }
  
  if (password.length < 8) {
    errors.push("Le mot de passe doit contenir au moins 8 caractères");
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push("Le mot de passe doit contenir au moins une majuscule");
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push("Le mot de passe doit contenir au moins une minuscule");
  }
  
  if (!/\d/.test(password)) {
    errors.push("Le mot de passe doit contenir au moins un chiffre");
  }
  
  if (confirmPassword !== null && password !== confirmPassword) {
    errors.push("Les mots de passe ne correspondent pas");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// 🔥 Phone validation (Senegal format)
export const validatePhone = (phone) => {
  const errors = [];
  
  if (!phone || phone.trim() === "") {
    errors.push("Le numéro de téléphone est requis");
    return { isValid: false, errors };
  }
  
  const cleaned = phone.replace(/\s/g, "");
  const phoneRegex = /^(\+221|00221)?[0-9]{9}$/;
  
  if (!phoneRegex.test(cleaned)) {
    errors.push("Format de téléphone invalide (ex: +221 XX XXX XX XX)");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// 🔥 Name validation
export const validateName = (name, fieldName = "nom") => {
  const errors = [];
  
  if (!name || name.trim() === "") {
    errors.push(`Le ${fieldName} est requis`);
    return { isValid: false, errors };
  }
  
  if (name.trim().length < 2) {
    errors.push(`Le ${fieldName} doit contenir au moins 2 caractères`);
  }
  
  if (name.trim().length > 50) {
    errors.push(`Le ${fieldName} ne doit pas dépasser 50 caractères`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// 🔥 Address validation
export const validateAddress = (address) => {
  const errors = [];
  
  if (!address || typeof address !== "object") {
    errors.push("Adresse invalide");
    return { isValid: false, errors };
  }
  
  if (!address.street || address.street.trim() === "") {
    errors.push("La rue est requise");
  }
  
  if (!address.city || address.city.trim() === "") {
    errors.push("La ville est requise");
  }
  
  if (address.street && address.street.length < 5) {
    errors.push("L'adresse doit contenir au moins 5 caractères");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// 🔥 Product validation
export const validateProduct = (product) => {
  const errors = [];
  
  if (!product.name || product.name.trim() === "") {
    errors.push("Le nom du produit est requis");
  }
  
  if (!product.price || product.price <= 0) {
    errors.push("Le prix doit être supérieur à 0");
  }
  
  if (product.stock < 0) {
    errors.push("Le stock ne peut pas être négatif");
  }
  
  if (!product.category || product.category === "") {
    errors.push("La catégorie est requise");
  }
  
  if (!product.description || product.description.trim().length < 10) {
    errors.push("La description doit contenir au moins 10 caractères");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// 🔥 Review validation
export const validateReview = (review) => {
  const errors = [];
  
  if (!review.rating || review.rating < 1 || review.rating > 5) {
    errors.push("La note doit être entre 1 et 5");
  }
  
  if (!review.comment || review.comment.trim().length < 10) {
    errors.push("Le commentaire doit contenir au moins 10 caractères");
  }
  
  if (review.comment && review.comment.length > 500) {
    errors.push("Le commentaire ne doit pas dépasser 500 caractères");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// 🔥 Order validation
export const validateOrder = (order) => {
  const errors = [];
  
  if (!order.items || !Array.isArray(order.items) || order.items.length === 0) {
    errors.push("La commande doit contenir au moins un article");
  }
  
  if (!order.deliveryName || order.deliveryName.trim() === "") {
    errors.push("Le nom de livraison est requis");
  }
  
  if (!order.deliveryPhone || order.deliveryPhone.trim() === "") {
    errors.push("Le téléphone de livraison est requis");
  }
  
  if (!order.deliveryAddress || order.deliveryAddress.trim() === "") {
    errors.push("L'adresse de livraison est requise");
  }
  
  if (!order.paymentMethod || order.paymentMethod === "") {
    errors.push("Le mode de paiement est requis");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// 🔥 Credit card validation (basic)
export const validateCreditCard = (cardNumber) => {
  const errors = [];
  
  if (!cardNumber || cardNumber.trim() === "") {
    errors.push("Le numéro de carte est requis");
    return { isValid: false, errors };
  }
  
  const cleaned = cardNumber.replace(/\s/g, "");
  
  if (!/^\d{13,19}$/.test(cleaned)) {
    errors.push("Le numéro de carte doit contenir entre 13 et 19 chiffres");
  }
  
  // Luhn algorithm
  let sum = 0;
  let isEven = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned.charAt(i), 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  if (sum % 10 !== 0) {
    errors.push("Numéro de carte invalide");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// 🔥 File validation
export const validateFile = (file, options = {}) => {
  const errors = [];
  
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ["image/jpeg", "image/png", "image/webp"],
    minWidth = null,
    minHeight = null
  } = options;
  
  if (!file) {
    errors.push("Aucun fichier sélectionné");
    return { isValid: false, errors };
  }
  
  if (file.size > maxSize) {
    errors.push(`La taille du fichier ne doit pas dépasser ${formatBytes(maxSize)}`);
  }
  
  if (!allowedTypes.includes(file.type)) {
    errors.push(`Type de fichier non autorisé. Types acceptés: ${allowedTypes.join(", ")}`);
  }
  
  // Check dimensions for images (requires async handling in actual use)
  if (minWidth || minHeight) {
    // This would need to be async in real implementation
    errors.push("Validation des dimensions à implémenter");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

const formatBytes = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i)) + " " + sizes[i];
};

// 🔥 URL validation
export const validateURL = (url) => {
  const errors = [];
  
  if (!url || url.trim() === "") {
    errors.push("L'URL est requise");
    return { isValid: false, errors };
  }
  
  try {
    new URL(url);
  } catch (e) {
    errors.push("Format d'URL invalide");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// 🔥 Date validation
export const validateDate = (date, options = {}) => {
  const errors = [];
  
  const {
    minDate = null,
    maxDate = null,
    futureOnly = false,
    pastOnly = false
  } = options;
  
  if (!date) {
    errors.push("La date est requise");
    return { isValid: false, errors };
  }
  
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    errors.push("Date invalide");
    return { isValid: false, errors };
  }
  
  const now = new Date();
  
  if (futureOnly && dateObj < now) {
    errors.push("La date doit être dans le futur");
  }
  
  if (pastOnly && dateObj > now) {
    errors.push("La date doit être dans le passé");
  }
  
  if (minDate && dateObj < new Date(minDate)) {
    errors.push(`La date doit être après le ${new Date(minDate).toLocaleDateString()}`);
  }
  
  if (maxDate && dateObj > new Date(maxDate)) {
    errors.push(`La date doit être avant le ${new Date(maxDate).toLocaleDateString()}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// 🔥 Number validation
export const validateNumber = (value, options = {}) => {
  const errors = [];
  
  const {
    min = null,
    max = null,
    integer = false
  } = options;
  
  if (value === null || value === undefined || value === "") {
    errors.push("La valeur est requise");
    return { isValid: false, errors };
  }
  
  const num = Number(value);
  
  if (isNaN(num)) {
    errors.push("Doit être un nombre");
    return { isValid: false, errors };
  }
  
  if (integer && !Number.isInteger(num)) {
    errors.push("Doit être un nombre entier");
  }
  
  if (min !== null && num < min) {
    errors.push(`Doit être supérieur ou égal à ${min}`);
  }
  
  if (max !== null && num > max) {
    errors.push(`Doit être inférieur ou égal à ${max}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// 🔥 Required field validation
export const validateRequired = (value, fieldName = "Ce champ") => {
  const errors = [];
  
  if (value === null || value === undefined || value === "" || 
      (typeof value === "string" && value.trim() === "")) {
    errors.push(`${fieldName} est requis`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// 🔥 Form validation (validates entire form object)
export const validateForm = (formData, rules) => {
  const errors = {};
  let isValid = true;
  
  Object.keys(rules).forEach(field => {
    const rule = rules[field];
    const value = formData[field];
    
    if (rule.required) {
      const result = validateRequired(value, rule.label || field);
      if (!result.isValid) {
        errors[field] = result.errors;
        isValid = false;
        return;
      }
    }
    
    if (rule.type === "email") {
      const result = validateEmail(value);
      if (!result.isValid) {
        errors[field] = result.errors;
        isValid = false;
      }
    }
    
    if (rule.type === "phone") {
      const result = validatePhone(value);
      if (!result.isValid) {
        errors[field] = result.errors;
        isValid = false;
      }
    }
    
    if (rule.type === "password") {
      const result = validatePassword(value, formData[rule.confirmField]);
      if (!result.isValid) {
        errors[field] = result.errors;
        isValid = false;
      }
    }
    
    if (rule.custom) {
      const result = rule.custom(value, formData);
      if (!result.isValid) {
        errors[field] = result.errors;
        isValid = false;
      }
    }
  });
  
  return {
    isValid,
    errors
  };
};

export default {
  validateEmail,
  validatePassword,
  validatePhone,
  validateName,
  validateAddress,
  validateProduct,
  validateReview,
  validateOrder,
  validateCreditCard,
  validateFile,
  validateURL,
  validateDate,
  validateNumber,
  validateRequired,
  validateForm
};