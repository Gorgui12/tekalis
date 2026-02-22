import React, { createContext, useContext, useState, useEffect } from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';

/**
 * Context pour gérer le thème (clair/sombre)
 */

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme doit être utilisé dans ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    // Vérifier localStorage
    const saved = localStorage.getItem('theme');
    if (saved) {
      return saved === 'dark';
    }
    
    // Sinon, vérifier la préférence système
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  const setTheme = (theme) => {
    setIsDark(theme === 'dark');
  };

  const value = {
    isDark,
    isLight: !isDark,
    theme: isDark ? 'dark' : 'light',
    toggleTheme,
    setTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Composant Toggle pour le header
 */
export const ThemeToggle = ({ className = '' }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        p-2.5 
        rounded-lg 
        transition-all 
        duration-200
        hover:bg-gray-100 
        dark:hover:bg-gray-800
        focus:outline-none 
        focus:ring-2 
        focus:ring-blue-500
        ${className}
      `}
      aria-label={isDark ? 'Activer le mode clair' : 'Activer le mode sombre'}
      title={isDark ? 'Mode clair' : 'Mode sombre'}
    >
      {isDark ? (
        <FaSun className="text-yellow-400 text-xl" />
      ) : (
        <FaMoon className="text-gray-600 text-xl" />
      )}
    </button>
  );
};

export default ThemeProvider;

/**
 * UTILISATION :
 * 
 * // 1. Ajouter darkMode dans tailwind.config.js
 * module.exports = {
 *   darkMode: 'class', // ✅ IMPORTANT
 *   // ... reste de la config
 * };
 * 
 * // 2. Wrapper l'app avec ThemeProvider dans App.jsx
 * import { ThemeProvider } from './context/ThemeContext';
 * 
 * function App() {
 *   return (
 *     <ThemeProvider>
 *       <YourApp />
 *     </ThemeProvider>
 *   );
 * }
 * 
 * // 3. Ajouter le toggle dans le Header/Navbar
 * import { ThemeToggle } from '../context/ThemeContext';
 * 
 * const Header = () => {
 *   return (
 *     <header>
 *       {// ... autres éléments //}
 *       <ThemeToggle />
 *     </header>
 *   );
 * };
 * 
 * // 4. Utiliser les classes dark: dans les composants
 * <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
 *   <h1 className="text-blue-600 dark:text-blue-400">Titre</h1>
 *   <p className="text-gray-600 dark:text-gray-300">Texte</p>
 * </div>
 * 
 * // 5. Utiliser le hook dans les composants
 * import { useTheme } from '../context/ThemeContext';
 * 
 * const MyComponent = () => {
 *   const { isDark, theme, toggleTheme, setTheme } = useTheme();
 * 
 *   return (
 *     <div>
 *       <p>Mode actuel: {theme}</p>
 *       <button onClick={toggleTheme}>Toggle</button>
 *       <button onClick={() => setTheme('dark')}>Sombre</button>
 *       <button onClick={() => setTheme('light')}>Clair</button>
 *     </div>
 *   );
 * };
 * 
 * // CLASSES UTILES POUR LE MODE SOMBRE :
 * 
 * // Backgrounds
 * bg-white dark:bg-gray-900
 * bg-gray-50 dark:bg-gray-800
 * bg-gray-100 dark:bg-gray-700
 * 
 * // Texte
 * text-gray-900 dark:text-white
 * text-gray-600 dark:text-gray-300
 * text-gray-500 dark:text-gray-400
 * 
 * // Borders
 * border-gray-300 dark:border-gray-600
 * border-gray-200 dark:border-gray-700
 * 
 * // Cards
 * <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
 *   <h3 className="text-gray-900 dark:text-white">Titre</h3>
 *   <p className="text-gray-600 dark:text-gray-300">Description</p>
 * </div>
 * 
 * // Inputs
 * <input className="
 *   bg-white dark:bg-gray-800 
 *   text-gray-900 dark:text-white 
 *   border-gray-300 dark:border-gray-600
 *   focus:ring-blue-500 dark:focus:ring-blue-400
 * " />
 * 
 * // Buttons
 * <button className="
 *   bg-blue-600 dark:bg-blue-500
 *   hover:bg-blue-700 dark:hover:bg-blue-600
 *   text-white
 * ">
 *   Cliquez
 * </button>
 */