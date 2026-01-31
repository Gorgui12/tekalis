import { useState, useEffect } from "react";

/**
 * Hook pour débouncer une valeur (utile pour les recherches)
 * @param {*} value - Valeur à débouncer
 * @param {Number} delay - Délai en millisecondes (défaut: 500ms)
 * @returns {*} Valeur debouncée
 * 
 * @example
 * const [searchTerm, setSearchTerm] = useState("");
 * const debouncedSearch = useDebounce(searchTerm, 500);
 * 
 * useEffect(() => {
 *   // API call avec debouncedSearch
 * }, [debouncedSearch]);
 */
const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Créer un timer qui met à jour la valeur après le délai
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Nettoyer le timer si la valeur change avant la fin du délai
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Hook pour débouncer une fonction callback
 * @param {Function} callback - Fonction à débouncer
 * @param {Number} delay - Délai en millisecondes
 * @returns {Function} Fonction debouncée
 * 
 * @example
 * const handleSearch = (term) => {
 *   // API call
 * };
 * 
 * const debouncedSearch = useDebouncedCallback(handleSearch, 500);
 */
export const useDebouncedCallback = (callback, delay = 500) => {
  const [timer, setTimer] = useState(null);

  const debouncedCallback = (...args) => {
    // Annuler le timer précédent
    if (timer) {
      clearTimeout(timer);
    }

    // Créer un nouveau timer
    const newTimer = setTimeout(() => {
      callback(...args);
    }, delay);

    setTimer(newTimer);
  };

  // Nettoyer au démontage
  useEffect(() => {
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [timer]);

  return debouncedCallback;
};

/**
 * Hook pour débouncer avec état de chargement
 * @param {*} value - Valeur à débouncer
 * @param {Number} delay - Délai en millisecondes
 * @returns {Object} { value, isDebouncing }
 * 
 * @example
 * const { value: debouncedSearch, isDebouncing } = useDebouncedValue(searchTerm, 500);
 * 
 * {isDebouncing && <Spinner />}
 */
export const useDebouncedValue = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const [isDebouncing, setIsDebouncing] = useState(false);

  useEffect(() => {
    // Indiquer qu'on est en train de débouncer
    if (value !== debouncedValue) {
      setIsDebouncing(true);
    }

    const timer = setTimeout(() => {
      setDebouncedValue(value);
      setIsDebouncing(false);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay, debouncedValue]);

  return {
    value: debouncedValue,
    isDebouncing
  };
};

/**
 * Hook pour débouncer avec annulation manuelle
 * @param {*} value - Valeur à débouncer
 * @param {Number} delay - Délai en millisecondes
 * @returns {Object} { value, cancel, flush }
 * 
 * @example
 * const { value, cancel, flush } = useDebouncedValueWithControls(searchTerm, 500);
 * 
 * // Annuler le debounce
 * cancel();
 * 
 * // Appliquer immédiatement
 * flush();
 */
export const useDebouncedValueWithControls = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const [timer, setTimer] = useState(null);

  useEffect(() => {
    const newTimer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    setTimer(newTimer);

    return () => {
      clearTimeout(newTimer);
    };
  }, [value, delay]);

  // Annuler le debounce
  const cancel = () => {
    if (timer) {
      clearTimeout(timer);
      setTimer(null);
    }
  };

  // Appliquer immédiatement
  const flush = () => {
    if (timer) {
      clearTimeout(timer);
      setTimer(null);
    }
    setDebouncedValue(value);
  };

  return {
    value: debouncedValue,
    cancel,
    flush
  };
};

export default useDebounce;