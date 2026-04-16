/**
 * SearchBarLive — Barre de recherche avec résultats en temps réel
 * Affiche : image, nom, prix, stock directement dans le dropdown
 * Mobile-first · a11y · debounce 300ms
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaTimes, FaSpinner, FaArrowRight } from 'react-icons/fa';
import api from '../../../../packages/shared/api/api';

/* ── Debounce hook ─────────────────────────────────────────────────────── */
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

/* ── StockBadge ────────────────────────────────────────────────────────── */
const StockBadge = ({ stock }) => {
  if (stock === 0) return <span className="text-red-400 text-[10px] font-semibold">Rupture</span>;
  if (stock < 5) return <span className="text-orange-400 text-[10px] font-semibold">Stock limité</span>;
  return <span className="text-emerald-400 text-[10px]">En stock</span>;
};

/* ── ResultItem ────────────────────────────────────────────────────────── */
const ResultItem = ({ product, onSelect }) => {
  const image = product.images?.find(i => i.isPrimary)?.url
    || product.images?.[0]?.url
    || product.image
    || '/images/no-image.webp';

  const discount = product.comparePrice
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : 0;

  return (
    <Link
      to={`/products/${product._id}`}
      onClick={onSelect}
      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition group"
    >
      {/* Image */}
      <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden flex-shrink-0">
        <img
          src={image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-contain p-1"
        />
      </div>

      {/* Infos */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
          {product.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
            {product.price?.toLocaleString()} FCFA
          </span>
          {discount > 0 && (
            <span className="text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded">
              -{discount}%
            </span>
          )}
        </div>
        <StockBadge stock={product.stock} />
      </div>

      {/* Flèche */}
      <FaArrowRight size={11} className="text-gray-300 dark:text-gray-600 group-hover:text-blue-500 transition flex-shrink-0" />
    </Link>
  );
};

/* ── SearchBarLive ─────────────────────────────────────────────────────── */
const SearchBarLive = ({
  placeholder = 'Rechercher un produit, une marque…',
  className = '',
  inputClassName = '',
  maxResults = 6,
  onResultSelect,
}) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [recentSearches, setRecentSearches] = useState([]);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const debouncedQuery = useDebounce(query, 300);

  /* Charger recherches récentes depuis localStorage */
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('tekalis_recent_searches') || '[]');
      setRecentSearches(stored.slice(0, 5));
    } catch {}
  }, []);

  const saveRecentSearch = (term) => {
    try {
      const current = JSON.parse(localStorage.getItem('tekalis_recent_searches') || '[]');
      const updated = [term, ...current.filter(t => t !== term)].slice(0, 5);
      localStorage.setItem('tekalis_recent_searches', JSON.stringify(updated));
      setRecentSearches(updated);
    } catch {}
  };

  /* Recherche API ──────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!debouncedQuery.trim() || debouncedQuery.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const search = async () => {
      try {
        const { data } = await api.get(`/products?search=${encodeURIComponent(debouncedQuery)}&limit=${maxResults}`);
        if (!cancelled) {
          // Normaliser la réponse selon le format backend
          const items = Array.isArray(data) ? data
            : data.products ? data.products
            : data.data ? data.data : [];
          setResults(items.slice(0, maxResults));
          setActiveIdx(-1);
        }
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    search();
    return () => { cancelled = true; };
  }, [debouncedQuery, maxResults]);

  /* Fermer au clic extérieur */
  useEffect(() => {
    const handler = (e) => {
      if (!dropdownRef.current?.contains(e.target) && !inputRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* Navigation clavier */
  const handleKeyDown = (e) => {
    const total = results.length;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(i => Math.min(i + 1, total - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(i => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIdx >= 0 && results[activeIdx]) {
        navigate(`/products/${results[activeIdx]._id}`);
        handleSelect();
      } else if (query.trim()) {
        handleFullSearch();
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleFullSearch = () => {
    if (!query.trim()) return;
    saveRecentSearch(query.trim());
    navigate(`/products?search=${encodeURIComponent(query.trim())}`);
    setOpen(false);
  };

  const handleSelect = () => {
    if (query.trim()) saveRecentSearch(query.trim());
    setOpen(false);
    setQuery('');
    onResultSelect?.();
  };

  const clearQuery = () => {
    setQuery('');
    setResults([]);
    setOpen(false);
    inputRef.current?.focus();
  };

  const showDropdown = open && (query.length >= 2 || recentSearches.length > 0);

  return (
    <div className={`relative ${className}`}>
      {/* Input */}
      <div className="relative flex items-center">
        <FaSearch
          size={14}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck="false"
          aria-label="Rechercher un produit"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
          aria-controls="search-results-dropdown"
          className={`w-full h-11 pl-10 pr-20 rounded-xl border bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 transition ${
            showDropdown
              ? 'border-blue-500 dark:border-blue-500 ring-2 ring-blue-500/20 rounded-b-none'
              : 'border-gray-300 dark:border-gray-600 focus:border-blue-500'
          } ${inputClassName}`}
        />

        {/* Loading indicator */}
        {loading && (
          <FaSpinner size={13} className="absolute right-14 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />
        )}

        {/* Bouton effacer */}
        {query && (
          <button
            onClick={clearQuery}
            className="absolute right-14 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition"
            aria-label="Effacer"
          >
            <FaTimes size={12} />
          </button>
        )}

        {/* Bouton rechercher */}
        <button
          onClick={handleFullSearch}
          disabled={!query.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 h-7 px-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 dark:disabled:bg-gray-700 text-white disabled:text-gray-400 rounded-lg text-xs font-semibold transition"
          aria-label="Lancer la recherche"
        >
          Chercher
        </button>
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div
          id="search-results-dropdown"
          ref={dropdownRef}
          role="listbox"
          className="absolute top-full left-0 right-0 bg-white dark:bg-gray-900 border border-blue-500 border-t-0 rounded-b-xl shadow-2xl z-50 overflow-hidden max-h-[70vh] overflow-y-auto"
        >
          {/* Résultats */}
          {query.length >= 2 && (
            <>
              {results.length > 0 ? (
                <>
                  <div className="px-4 pt-3 pb-1 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                      {results.length} résultat{results.length > 1 ? 's' : ''}
                    </span>
                    {results.length >= maxResults && (
                      <button
                        onClick={handleFullSearch}
                        className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                      >
                        Voir tous les résultats →
                      </button>
                    )}
                  </div>
                  <div role="list">
                    {results.map((product, idx) => (
                      <div
                        key={product._id}
                        role="option"
                        aria-selected={idx === activeIdx}
                        className={idx === activeIdx ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                      >
                        <ResultItem product={product} onSelect={handleSelect} />
                      </div>
                    ))}
                  </div>
                  {/* CTA voir tous */}
                  <div className="border-t border-gray-100 dark:border-gray-800">
                    <button
                      onClick={handleFullSearch}
                      className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
                    >
                      <FaSearch size={12} />
                      Voir tous les résultats pour « {query} »
                    </button>
                  </div>
                </>
              ) : !loading ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    Aucun résultat pour « <strong>{query}</strong> »
                  </p>
                  <Link
                    to="/products"
                    onClick={handleSelect}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Parcourir tous les produits
                  </Link>
                </div>
              ) : (
                /* Skeleton chargement */
                <div className="p-4 space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 animate-pulse">
                      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Recherches récentes (quand query vide) */}
          {query.length < 2 && recentSearches.length > 0 && (
            <div className="py-2">
              <div className="px-4 py-1.5 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                  Recherches récentes
                </span>
                <button
                  onClick={() => {
                    localStorage.removeItem('tekalis_recent_searches');
                    setRecentSearches([]);
                    setOpen(false);
                  }}
                  className="text-[11px] text-gray-400 hover:text-red-500 transition"
                >
                  Effacer
                </button>
              </div>
              {recentSearches.map((term, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setQuery(term);
                    inputRef.current?.focus();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition text-left"
                >
                  <FaSearch size={11} className="text-gray-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{term}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBarLive;
