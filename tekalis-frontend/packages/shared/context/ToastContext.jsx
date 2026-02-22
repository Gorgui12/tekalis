import React, { createContext, useContext, useState, useCallback } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes, FaExclamationTriangle } from 'react-icons/fa';

/**
 * Context pour gérer les notifications Toast de manière globale
 * Remplace l'ancien système useToast + uiSlice
 */

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast doit être utilisé dans ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children, maxToasts = 5 }) => {
  const [toasts, setToasts] = useState([]);

  /**
   * Ajouter un toast
   */
  const addToast = useCallback((message, type = 'info', duration = 4000, options = {}) => {
    const id = Date.now() + Math.random();
    
    const toast = {
      id,
      message,
      type,
      duration,
      ...options
    };

    setToasts(prev => {
      // Limiter le nombre de toasts
      const newToasts = [...prev, toast];
      if (newToasts.length > maxToasts) {
        return newToasts.slice(-maxToasts);
      }
      return newToasts;
    });

    // Auto-remove après duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, [maxToasts]);

  /**
   * Supprimer un toast
   */
  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  /**
   * Supprimer tous les toasts
   */
  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  // Raccourcis pour les types courants
  const success = useCallback((message, duration, options) => 
    addToast(message, 'success', duration, options), 
    [addToast]
  );

  const error = useCallback((message, duration, options) => 
    addToast(message, 'error', duration, options), 
    [addToast]
  );

  const info = useCallback((message, duration, options) => 
    addToast(message, 'info', duration, options), 
    [addToast]
  );

  const warning = useCallback((message, duration, options) => 
    addToast(message, 'warning', duration, options), 
    [addToast]
  );

  const value = {
    toasts,
    addToast,
    removeToast,
    clearAll,
    success,
    error,
    info,
    warning
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

/**
 * Conteneur des toasts
 */
const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div 
      className="fixed top-4 right-4 z-[9999] space-y-2 pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

/**
 * Composant Toast individuel
 */
const Toast = ({ toast, onClose }) => {
  const config = {
    success: {
      icon: <FaCheckCircle className="text-green-500 text-xl" />,
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-900'
    },
    error: {
      icon: <FaExclamationCircle className="text-red-500 text-xl" />,
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-900'
    },
    warning: {
      icon: <FaExclamationTriangle className="text-yellow-600 text-xl" />,
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-900'
    },
    info: {
      icon: <FaInfoCircle className="text-blue-500 text-xl" />,
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-900'
    }
  };

  const style = config[toast.type] || config.info;

  return (
    <div 
      className={`
        ${style.bg} 
        ${style.border} 
        border-2 
        rounded-lg 
        shadow-lg 
        p-4 
        min-w-[320px] 
        max-w-md 
        flex 
        items-start 
        gap-3 
        animate-slide-in
        pointer-events-auto
      `}
      role="alert"
    >
      {/* Icône */}
      <div className="flex-shrink-0 mt-0.5">
        {style.icon}
      </div>

      {/* Message */}
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className={`font-semibold ${style.text} mb-1`}>
            {toast.title}
          </p>
        )}
        <p className={`text-sm ${style.text} break-words`}>
          {toast.message}
        </p>
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className={`mt-2 text-sm font-semibold ${style.text} hover:underline`}
          >
            {toast.action.label}
          </button>
        )}
      </div>

      {/* Bouton fermer */}
      <button
        onClick={onClose}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition"
        aria-label="Fermer la notification"
      >
        <FaTimes className="text-lg" />
      </button>
    </div>
  );
};

export default ToastProvider;

/**
 * UTILISATION :
 * 
 * // 1. Wrapper l'app avec ToastProvider dans App.jsx
 * import { ToastProvider } from './context/ToastContext';
 * 
 * function App() {
 *   return (
 *     <ToastProvider>
 *       <YourApp />
 *     </ToastProvider>
 *   );
 * }
 * 
 * // 2. Utiliser dans les composants
 * import { useToast } from '../context/ToastContext';
 * 
 * const MyComponent = () => {
 *   const toast = useToast();
 * 
 *   const handleSuccess = () => {
 *     toast.success('Produit ajouté au panier !');
 *   };
 * 
 *   const handleError = () => {
 *     toast.error('Une erreur est survenue');
 *   };
 * 
 *   const handleWarning = () => {
 *     toast.warning('Stock limité !');
 *   };
 * 
 *   const handleInfo = () => {
 *     toast.info('Livraison gratuite dès 50 000 FCFA');
 *   };
 * 
 *   // Avec action
 *   const handleWithAction = () => {
 *     toast.success('Commande passée !', 4000, {
 *       title: 'Succès',
 *       action: {
 *         label: 'Voir la commande',
 *         onClick: () => navigate('/orders')
 *       }
 *     });
 *   };
 * 
 *   // Durée personnalisée
 *   toast.error('Erreur critique', 10000); // 10 secondes
 * 
 *   // Permanent (durée 0)
 *   toast.info('Important', 0); // Ne disparaît pas automatiquement
 * };
 * 
 * // REMPLACE TOUS LES :
 * // ❌ alert("Message")
 * // ❌ console.log("Message") pour les users
 * // ❌ useToast de Redux uiSlice
 */
