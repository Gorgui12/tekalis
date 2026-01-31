import { useDispatch, useSelector } from "react-redux";
import { 
  addNotification, 
  removeNotification, 
  clearNotifications 
} from "../redux/slices/uiSlice";

/**
 * Hook personnalisé pour gérer les notifications toast
 * @returns {Object} Fonctions de gestion des toasts
 */
const useToast = () => {
  const dispatch = useDispatch();
  const notifications = useSelector((state) => state.ui.notifications);

  /**
   * Afficher un toast de succès
   * @param {String} message - Message à afficher
   * @param {Number} duration - Durée en ms (défaut: 3000)
   */
  const success = (message, duration = 3000) => {
    dispatch(addNotification({
      type: "success",
      message,
      duration
    }));
  };

  /**
   * Afficher un toast d'erreur
   * @param {String} message - Message à afficher
   * @param {Number} duration - Durée en ms (défaut: 4000)
   */
  const error = (message, duration = 4000) => {
    dispatch(addNotification({
      type: "error",
      message,
      duration
    }));
  };

  /**
   * Afficher un toast d'avertissement
   * @param {String} message - Message à afficher
   * @param {Number} duration - Durée en ms (défaut: 3500)
   */
  const warning = (message, duration = 3500) => {
    dispatch(addNotification({
      type: "warning",
      message,
      duration
    }));
  };

  /**
   * Afficher un toast d'information
   * @param {String} message - Message à afficher
   * @param {Number} duration - Durée en ms (défaut: 3000)
   */
  const info = (message, duration = 3000) => {
    dispatch(addNotification({
      type: "info",
      message,
      duration
    }));
  };

  /**
   * Afficher un toast de chargement
   * @param {String} message - Message à afficher
   * @returns {Number} ID du toast
   */
  const loading = (message) => {
    const id = Date.now();
    dispatch(addNotification({
      type: "loading",
      message,
      duration: 0, // Pas de durée pour loading
      id
    }));
    return id;
  };

  /**
   * Mettre à jour un toast de chargement avec succès
   * @param {Number} id - ID du toast
   * @param {String} message - Message de succès
   */
  const loadingSuccess = (id, message) => {
    dispatch(removeNotification(id));
    success(message);
  };

  /**
   * Mettre à jour un toast de chargement avec erreur
   * @param {Number} id - ID du toast
   * @param {String} message - Message d'erreur
   */
  const loadingError = (id, message) => {
    dispatch(removeNotification(id));
    error(message);
  };

  /**
   * Supprimer un toast spécifique
   * @param {Number} id - ID du toast
   */
  const remove = (id) => {
    dispatch(removeNotification(id));
  };

  /**
   * Effacer tous les toasts
   */
  const clear = () => {
    dispatch(clearNotifications());
  };

  /**
   * Afficher un toast de promesse
   * @param {Promise} promise - Promesse à suivre
   * @param {Object} messages - Messages pour chaque état
   * @returns {Promise} La promesse originale
   */
  const promise = async (promise, messages) => {
    const id = loading(messages.loading || "Chargement...");

    try {
      const result = await promise;
      loadingSuccess(id, messages.success || "Succès !");
      return result;
    } catch (err) {
      loadingError(id, messages.error || "Erreur");
      throw err;
    }
  };

  /**
   * Afficher un toast avec action personnalisée
   * @param {String} message - Message à afficher
   * @param {Object} action - Action à afficher { label, onClick }
   * @param {String} type - Type de toast
   */
  const withAction = (message, action, type = "info") => {
    dispatch(addNotification({
      type,
      message,
      action,
      duration: 5000
    }));
  };

  return {
    // Fonctions de base
    success,
    error,
    warning,
    info,
    
    // Loading
    loading,
    loadingSuccess,
    loadingError,
    
    // Gestion
    remove,
    clear,
    
    // Avancé
    promise,
    withAction,
    
    // État
    notifications
  };
};

export default useToast;