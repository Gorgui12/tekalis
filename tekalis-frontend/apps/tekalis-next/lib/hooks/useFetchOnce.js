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
 * @param {boolean} enabled - Si false, la requête n'est pas déclenchée.
 * @returns {{ data: any, loading: boolean, error: Error|null, refetch: Function, setData: Function }}
 */
const useFetchOnce = (fetchFn, deps = [], enabled = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);

  const fetchFnRef = useRef(fetchFn);
  const abortControllerRef = useRef(null);
  const fetchedKeyRef = useRef(null);

  fetchFnRef.current = fetchFn;

  const doFetch = useCallback(async (signal) => {
    try {
      const result = await fetchFnRef.current(signal);
      if (!signal?.aborted) {
        setData(result);
        setError(null);
      }
    } catch (err) {
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

  useEffect(() => {
    if (!enabled) return;

    const depsKey = JSON.stringify(deps) + "|enabled:" + String(enabled);

    if (fetchedKeyRef.current === depsKey) return;
    fetchedKeyRef.current = depsKey;

    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    setLoading(true);
    doFetch(abortController.signal);

    return () => {
      abortController.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps]);

  const refetch = useCallback(async () => {
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