"use client";
import { Provider } from 'react-redux';
import { store } from '../../store'; // Ajuste le chemin selon ton dossier store
import { ThemeProvider } from './ThemeProvider';
import { ToastProvider } from './ToastProvider';

export default function Providers({ children }) {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </ThemeProvider>
    </Provider>
  );
}