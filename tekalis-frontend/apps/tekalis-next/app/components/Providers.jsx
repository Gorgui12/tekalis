'use client';

/**
 * components/Providers.jsx
 * Regroupe tous les providers côté client.
 * Utilisé dans app/layout.jsx (Server Component).
 */

import { useRef } from 'react';
import { Provider } from 'react-redux';
import { makeStore } from '@/store';
import ToastProvider from '@/components/shared/ToastProvider';
import ThemeProvider from '@/components/shared/ThemeProvider';

export default function Providers({ children }) {
  // makeStore est appelé une seule fois côté client
  const storeRef = useRef(null);
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  return (
    <Provider store={storeRef.current}>
      <ThemeProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </ThemeProvider>
    </Provider>
  );
}