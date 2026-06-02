'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export default function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = saved ? saved === 'dark' : prefersDark;
    setIsDark(dark);
    document.documentElement.classList.toggle('dark', dark);
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      localStorage.setItem('theme', next ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', next);
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function ThemeToggle({ className = '' }) {
  const { isDark, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className={`p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition ${className}`}
      aria-label={isDark ? 'Mode clair' : 'Mode sombre'}
    >
      {isDark
        ? <FaSun className="text-yellow-400 text-xl" />
        : <FaMoon className="text-gray-600 text-xl" />
      }
    </button>
  );
}