import { useState, useEffect, useCallback } from 'react';

/**
 * Hook pour gérer le localStorage de manière sécurisée avec React
 * @param {string} key - Clé de stockage
 * @param {*} initialValue - Valeur initiale
 * @returns {[value, setValue, removeValue]} - Valeur, setter, remover
 */
const useLocalStorage = (key, initialValue) => {
  // État avec lazy initialization
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  /**
   * Sauvegarder la valeur dans le localStorage
   */
  const setValue = useCallback((value) => {
    try {
      // Permet de passer une fonction comme avec useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        
        // Déclencher un event pour synchroniser entre tabs
        window.dispatchEvent(new Event('localStorage'));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  /**
   * Supprimer la valeur du localStorage
   */
  const removeValue = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
        setStoredValue(initialValue);
        
        window.dispatchEvent(new Event('localStorage'));
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  /**
   * Synchroniser entre tabs
   */
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const item = window.localStorage.getItem(key);
        if (item) {
          setStoredValue(JSON.parse(item));
        }
      } catch (error) {
        console.error(`Error syncing localStorage key "${key}":`, error);
      }
    };

    // Écouter les changements de localStorage
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('localStorage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorage', handleStorageChange);
    };
  }, [key]);

  return [storedValue, setValue, removeValue];
};

/**
 * Hook pour vérifier la disponibilité du localStorage
 */
export const useIsLocalStorageAvailable = () => {
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    try {
      const testKey = '__test__';
      window.localStorage.setItem(testKey, testKey);
      window.localStorage.removeItem(testKey);
      setIsAvailable(true);
    } catch (e) {
      setIsAvailable(false);
    }
  }, []);

  return isAvailable;
};

/**
 * Hook pour obtenir la taille du localStorage
 */
export const useLocalStorageSize = () => {
  const [size, setSize] = useState(0);

  useEffect(() => {
    try {
      let total = 0;
      for (let key in window.localStorage) {
        if (window.localStorage.hasOwnProperty(key)) {
          total += window.localStorage.getItem(key).length + key.length;
        }
      }
      setSize(total);
    } catch (error) {
      console.error('Error calculating localStorage size:', error);
    }
  }, []);

  return {
    bytes: size,
    kilobytes: (size / 1024).toFixed(2),
    megabytes: (size / 1024 / 1024).toFixed(2)
  };
};

export default useLocalStorage;

/**
 * EXEMPLES D'UTILISATION :
 * 
 * // Basique
 * const [name, setName, removeName] = useLocalStorage('user-name', '');
 * 
 * <input 
 *   value={name}
 *   onChange={(e) => setName(e.target.value)}
 * />
 * <button onClick={removeName}>Clear</button>
 * 
 * // Avec objet
 * const [user, setUser] = useLocalStorage('user', {
 *   name: '',
 *   email: '',
 *   preferences: {}
 * });
 * 
 * setUser(prev => ({
 *   ...prev,
 *   name: 'John'
 * }));
 * 
 * // Avec tableau
 * const [favorites, setFavorites] = useLocalStorage('favorites', []);
 * 
 * const addFavorite = (item) => {
 *   setFavorites(prev => [...prev, item]);
 * };
 * 
 * const removeFavorite = (id) => {
 *   setFavorites(prev => prev.filter(item => item.id !== id));
 * };
 * 
 * // Vérifier la disponibilité
 * const isAvailable = useIsLocalStorageAvailable();
 * 
 * if (!isAvailable) {
 *   return <div>localStorage not available</div>;
 * }
 * 
 * // Obtenir la taille
 * const { kilobytes } = useLocalStorageSize();
 * console.log(`Using ${kilobytes} KB of localStorage`);
 */