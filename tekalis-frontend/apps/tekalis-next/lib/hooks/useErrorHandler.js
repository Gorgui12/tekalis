"use client";

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRouter } from "next/navigation";
/**
 * Hook pour gérer les erreurs de manière centralisée
 * @returns {Object} error, handleError, clearError
 */
const useErrorHandler = () => {
  const [error, setError] = useState(null);
  const navigate = const router = useRouter()
router.push();

  /**
   * Gérer une erreur
   * @param {Error|Object} err - L'erreur à gérer
   * @param {Object} options - Options de gestion
   */
  const handleError = useCallback((err, options = {}) => {
    const {
      showToast = true,
      redirectTo = null,
      logToService = true,
      customMessage = null
    } = options;

    // Log l'erreur
    console.error('🔴 Error handled:', err);

    // TODO: Envoyer à un service de logging (Sentry, LogRocket, etc.)
    if (logToService && process.env.NODE_ENV === 'production') {
      // window.Sentry?.captureException(err);
    }

    // Parser le message d'erreur
    let message = customMessage || 'Une erreur est survenue';
    
    if (err?.response?.data?.message) {
      message = err.response.data.message;
    } else if (err?.message) {
      message = err.message;
    }

    // Gérer les codes d'erreur HTTP spécifiques
    const statusCode = err?.response?.status;

    switch (statusCode) {
      case 400:
        message = 'Requête invalide';
        break;
      
      case 401:
        message = 'Session expirée. Veuillez vous reconnecter.';
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
        return message;
      
      case 403:
        message = 'Accès refusé';
        break;
      
      case 404:
        message = 'Ressource introuvable';
        if (redirectTo !== false) {
          navigate(redirectTo || '/404');
          return message;
        }
        break;
      
      case 422:
        message = 'Données invalides';
        break;
      
      case 429:
        message = 'Trop de requêtes. Veuillez patienter.';
        break;
      
      case 500:
        message = 'Erreur serveur. Veuillez réessayer.';
        break;
      
      case 503:
        message = 'Service temporairement indisponible';
        break;
    }

    // Définir l'erreur dans l'état
    setError({
      message,
      statusCode,
      originalError: err,
      timestamp: new Date()
    });

    // Afficher une notification toast
    if (showToast && window.toast) {
      window.toast.error(message);
    }

    // Rediriger si nécessaire
    if (redirectTo && statusCode !== 401 && statusCode !== 404) {
      navigate(redirectTo);
    }

    return message;
  }, [navigate]);

  /**
   * Effacer l'erreur
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Gérer une erreur de validation
   * @param {Object} validationErrors - Erreurs de validation {field: message}
   */
  const handleValidationErrors = useCallback((validationErrors) => {
    const errorMessages = Object.values(validationErrors).filter(Boolean);
    
    if (errorMessages.length > 0) {
      const message = errorMessages[0]; // Prendre la première erreur
      setError({
        message,
        type: 'validation',
        fields: validationErrors,
        timestamp: new Date()
      });

      if (window.toast) {
        window.toast.error(message);
      }

      return true;
    }

    return false;
  }, []);

  /**
   * Wrapper pour les fonctions async
   * @param {Function} asyncFn - Fonction asynchrone à exécuter
   * @param {Object} options - Options
   */
  const withErrorHandler = useCallback(async (asyncFn, options = {}) => {
    try {
      clearError();
      const result = await asyncFn();
      return { success: true, data: result };
    } catch (err) {
      const message = handleError(err, options);
      return { success: false, error: message };
    }
  }, [handleError, clearError]);

  /**
   * Créer un error boundary handler
   */
  const createErrorBoundary = useCallback((fallbackUI) => {
    return {
      error,
      hasError: !!error,
      resetError: clearError,
      fallbackUI: error ? fallbackUI : null
    };
  }, [error, clearError]);

  return {
    // État
    error,
    hasError: !!error,
    
    // Actions
    handleError,
    clearError,
    handleValidationErrors,
    withErrorHandler,
    createErrorBoundary
  };
};

export default useErrorHandler;

/**
 * EXEMPLES D'UTILISATION :
 * 
 * // Basique
 * const { error, handleError, clearError } = useErrorHandler();
 * 
 * const fetchData = async () => {
 *   try {
 *     const { data } = await api.get('/products');
 *     setProducts(data);
 *   } catch (err) {
 *     handleError(err);
 *   }
 * };
 * 
 * // Avec options
 * try {
 *   await api.delete(`/products/${id}`);
 * } catch (err) {
 *   handleError(err, {
 *     customMessage: 'Impossible de supprimer ce produit',
 *     redirectTo: '/products',
 *     showToast: true
 *   });
 * }
 * 
 * // Avec wrapper
 * const { handleError, withErrorHandler } = useErrorHandler();
 * 
 * const handleSubmit = async () => {
 *   const { success, data } = await withErrorHandler(
 *     () => api.post('/orders', orderData),
 *     { customMessage: 'Erreur lors de la commande' }
 *   );
 *   
 *   if (success) {
 *     navigate('/orders');
 *   }
 * };
 * 
 * // Validation
 * const { handleValidationErrors } = useErrorHandler();
 * 
 * const validate = () => {
 *   const errors = {};
 *   if (!email) errors.email = 'Email requis';
 *   if (!password) errors.password = 'Mot de passe requis';
 *   
 *   if (handleValidationErrors(errors)) {
 *     return false; // Validation failed
 *   }
 *   return true; // Validation passed
 * };
 * 
 * // Afficher l'erreur
 * {error && (
 *   <div className="bg-red-50 border border-red-200 p-4 rounded">
 *     <p className="text-red-900">{error.message}</p>
 *     <button onClick={clearError}>Fermer</button>
 *   </div>
 * )}
 */

