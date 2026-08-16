import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Hook pour effectuer une requête API une seule fois au montage du composant.
 *
 * Protections intégrées :
 * - **Déduplication** : un ref basé sur la sérialisation des dépendances empêche
 *   les appels multiples (StrictMode, Fast Refresh, re-renders) de déclencher
 *   plus d'une requête pour les mêmes dépendances.
 * - **Annulation** : un AbortController annule la requête en cours au démontage,
 *   évitant les mises à jour d'état sur un composant démonté ("memory leak").
 * - **Stabilité** : la fonction de fetch est stockée dans un ref, donc l'effet
 *   ne se re-déclenche pas quand le composant re-render.
 * - **Gate conditionnelle** : le paramètre `enabled` permet d'attendre qu'une
 *   condition soit remplie (ex: user chargé) avant de fetch.
 *
 * @param {Function} fetchFn - Fonction async qui reçoit un AbortSignal et retourne les données.
 * @param {Array} deps - Dépendances stables (primitives) qui déclenchent un refetch si elles changent.
 * @param {boolean} enabled - Si false, la requête n'est pas déclenchée. Quand il passe à true, la requête part.
 * @returns {{ data: any, loading: boolean, error: Error|null, refetch: Function, setData: Function }}
 *
 * @example
 * const { data: addresses, loading, refetch } = useFetchOnce(
 *   async (signal) => {
 *     const { data } = await api.get("/addresses", { signal });
 *     return data.addresses || [];
 *   },
 *   [userId],
 *   !!userId // enabled : ne fetch que quand userId est disponible
 * );
 */
const useFetchOnce = (fetchFn, deps = [], enabled = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);

  // Refs pour éviter les boucles et les appels en double
  const fetchFnRef = useRef(fetchFn);
  const abortControllerRef = useRef(null);
  // Stocke la "clé" des dépendances déjà fetchées pour éviter les doublons
  const fetchedKeyRef = useRef(null);

  // Toujours garder la dernière version de fetchFn sans re-déclencher l'effet
  fetchFnRef.current = fetchFn;

  /**
   * Exécute la fonction de fetch avec gestion d'annulation.
   * Stable grâce à useCallback([]) — ne change jamais de référence.
   */
  const doFetch = useCallback(async (signal) => {
    try {
      const result = await fetchFnRef.current(signal);
      // Ne mettre à jour l'état que si la requête n'a pas été annulée
      if (!signal?.aborted) {
        setData(result);
        setError(null);
      }
    } catch (err) {
      // Ignorer les erreurs d'annulation (démontage du composant)
      if (err.name !== "AbortError" && !signal?.aborted) {
        setError(err);
        console.error("useFetchOnce — erreur de fetch:", err);
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  // Effet de montage : exécuter une seule fois (ou quand deps change)
  useEffect(() => {
    // Ne pas fetch si la condition n'est pas remplie
    if (!enabled) return;

    // Construire une clé unique à partir des dépendances + enabled
    const depsKey = JSON.stringify(deps) + "|enabled:" + String(enabled);

    // Si on a déjà fetché avec exactement les mêmes dépendances, on skip.
    // Cela gère :
    // - StrictMode (double-invoke en dev)
    // - Fast Refresh (re-déclenche les effets)
    // - Les re-renders qui ne changent pas les deps
    if (fetchedKeyRef.current === depsKey) return;
    fetchedKeyRef.current = depsKey;

    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    setLoading(true);
    doFetch(abortController.signal);

    // Cleanup : annuler la requête si le composant est démonté
    return () => {
      abortController.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps]);

  /**
   * Refetch manuel : annule la requête en cours et en lance une nouvelle.
   * À utiliser après une mutation (ajout, modification, suppression).
   */
  const refetch = useCallback(async () => {
    // Annuler la requête précédente si elle est encore en cours
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setLoading(true);
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    await doFetch(abortController.signal);
  }, [doFetch]);

  return { data, loading, error, refetch, setData };
};

export default useFetchOnce;