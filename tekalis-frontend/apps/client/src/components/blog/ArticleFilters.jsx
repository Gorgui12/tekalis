import { useState } from "react";
import { FaSearch, FaFilter, FaTimes } from "react-icons/fa";

const ArticleFilters = ({ 
  onSearch, 
  onCategoryChange, 
  onSortChange,
  categories = [],
  selectedCategory = "all",
  sortBy = "recent",
  showMobileFilters = false,
  onToggleMobileFilters
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Catégories par défaut
  const defaultCategories = [
    { id: "all", label: "Tous", icon: "📚", color: "blue" },
    { id: "test", label: "Tests", icon: "🧪", color: "green" },
    { id: "guide", label: "Guides", icon: "📖", color: "purple" },
    { id: "tutorial", label: "Tutoriels", icon: "🎓", color: "orange" },
    { id: "news", label: "Actualités", icon: "📰", color: "red" },
    { id: "comparison", label: "Comparatifs", icon: "⚖️", color: "indigo" }
  ];

  const displayCategories = categories.length > 0 ? categories : defaultCategories;

  // Options de tri
  const sortOptions = [
    { value: "recent", label: "Plus récents" },
    { value: "popular", label: "Plus populaires" },
    { value: "oldest", label: "Plus anciens" },
    { value: "mostViewed", label: "Plus consultés" }
  ];

  const handleSearch = (value) => {
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    if (onSearch) {
      onSearch("");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un article..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
            >
              <FaTimes />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Filter Toggle */}
      <button
        onClick={onToggleMobileFilters}
        className="md:hidden w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 mb-4"
      >
        <FaFilter />
        Filtres
      </button>

      {/* Filters Row - Desktop */}
      <div className="hidden md:flex flex-col lg:flex-row gap-4">
        {/* Categories */}
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Catégorie
          </label>
          <div className="flex flex-wrap gap-2">
            {displayCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => onCategoryChange && onCategoryChange(cat.id)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition flex items-center gap-2 ${
                  selectedCategory === cat.id
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sort */}
        <div className="lg:w-64">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Trier par
          </label>
          <select
            value={sortBy}
            onChange={(e) => onSortChange && onSortChange(e.target.value)}
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mobile Filters */}
      {showMobileFilters && (
        <div className="md:hidden space-y-4 mt-4 pt-4 border-t">
          {/* Categories Mobile */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Catégorie
            </label>
            <div className="flex flex-wrap gap-2">
              {displayCategories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => {
                    onCategoryChange && onCategoryChange(cat.id);
                    onToggleMobileFilters && onToggleMobileFilters();
                  }}
                  className={`px-3 py-2 rounded-lg font-semibold text-sm transition flex items-center gap-2 ${
                    selectedCategory === cat.id
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  <span>{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Mobile */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Trier par
            </label>
            <select
              value={sortBy}
              onChange={(e) => onSortChange && onSortChange(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {(selectedCategory !== "all" || searchTerm) && (
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Filtres actifs : 
              {searchTerm && <span className="ml-2 font-semibold">"{searchTerm}"</span>}
              {selectedCategory !== "all" && (
                <span className="ml-2 font-semibold">
                  {displayCategories.find(c => c.id === selectedCategory)?.label}
                </span>
              )}
            </p>
            <button
              onClick={() => {
                clearSearch();
                onCategoryChange && onCategoryChange("all");
              }}
              className="text-sm text-red-600 hover:text-red-700 font-semibold"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleFilters;