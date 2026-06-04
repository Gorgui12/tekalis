"use client";
import { Provider } from 'react-redux';
import { store } from '../../store'; // Vérifie que ton store/index.js exporte bien 'store'
import { ThemeProvider } from 'next-themes'; // Utilise la lib standard
import { Toaster } from 'react-hot-toast'; // Ou ton système de toast

export default function Providers({ children }) {
  return (
    <Provider store={store}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
        <Toaster />
      </ThemeProvider>
    </Provider>
  );
}