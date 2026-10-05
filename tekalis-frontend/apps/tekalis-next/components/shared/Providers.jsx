"use client";

import { useRef, useState, useEffect } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { makeStore } from "@/store";
import ThemeProvider from "./ThemeProvider";
import ToastProvider from "./ToastProvider";

/**
 * PersistGate ne peut pas attendre la rehydratation de redux-persist sur le
 * serveur : `makeStore()` ne cree le persistor que dans le navigateur
 * (store/index.js), donc le persistor est `undefined` pendant le rendu serveur.
 * Rendu tel quel, le gate bloquait indefiniment sur `loading={null}` et le HTML
 * servi etait vide sur toutes les pages du site (aucun H1, aucun contenu).
 *
 * On rend donc les enfants directement tant que la rehydratation n'a pas
 * commence. `hydrated` passe a true apres le montage, ce qui garantit aussi que
 * le premier rendu client est identique a celui du serveur (pas de
 * hydratation mismatch).
 */
export default function Providers({ children }) {
  const storeRef = useRef(null);
  const [hydrated, setHydrated] = useState(false);

  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  useEffect(() => {
    setHydrated(true);
  }, []);

  const content = (
    <ThemeProvider>
      <ToastProvider>{children}</ToastProvider>
    </ThemeProvider>
  );

  const persistor = storeRef.current.__persistor;

  if (!hydrated || !persistor) {
    return <Provider store={storeRef.current}>{content}</Provider>;
  }

  return (
    <Provider store={storeRef.current}>
      <PersistGate loading={null} persistor={persistor}>
        {content}
      </PersistGate>
    </Provider>
  );
}