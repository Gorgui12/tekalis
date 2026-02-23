import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

/**
 * SearchBar — Barre de recherche avec debounce intégré
 * @param {Function} onSearch - (term: string) => void — appelé après debounce
 * @param {string}   placeholder
 * @param {number}   delay - délai debounce ms (défaut 400)
 * @param {string}   className
 * @param {boolean}  autoFocus
 */
const SearchBar = ({
  onSearch,
  placeholder = 'Rechercher…',
  delay = 400,
  className = '',
  autoFocus = false,
  defaultValue = '',
}) => {
  const [value, setValue] = useState(defaultValue);

  /* Debounce */
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch?.(value.trim());
    }, delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return (
    <div className={`relative ${className}`}>
      <Search
        size={15}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="
          w-full h-9 pl-9 pr-9 rounded-xl
          bg-white/5 border border-white/8
          text-sm text-white placeholder:text-gray-600
          focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.07]
          transition-all duration-150
        "
      />
      {value && (
        <button
          onClick={() => setValue('')}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-gray-500 hover:text-gray-300 transition"
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;