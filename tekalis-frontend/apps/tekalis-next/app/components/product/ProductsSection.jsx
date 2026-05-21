import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import ProductCard from "./ProductCard";
import LoadingSpinner from "../../shared/LoadingSpinner";

/**
 * ProductsSection V2 - Score 9/10
 * Section produits réutilisable avec ProductCard externe
 * 
 * Améliorations vs V1:
 * - Import corrigé
 * - Encodage UTF-8
 * - Utilise ProductCard externe
 * - Loading state
 * - Error handling
 * - Props simplifiées
 */
const ProductsSection = ({ 
  title, 
  subtitle,
  icon,
  products = [], 
  viewAllLink, 
  viewAllText = "Voir tout",
  columns = 4,
  theme = "light",
  loading = false,
  error = null,
  onQuickView
}) => {
  // Déterminer les colonnes responsive
  const getGridCols = () => {
    const colsMap = {
      3: "md:grid-cols-3",
      4: "md:grid-cols-3 lg:grid-cols-4",
      5: "md:grid-cols-3 lg:grid-cols-5",
      6: "md:grid-cols-3 lg:grid-cols-6"
    };
    return colsMap[columns] || "md:grid-cols-3 lg:grid-cols-4";
  };

  // Loading state
  if (loading) {
    return (
      <section className={`py-8 md:py-12 ${theme === "dark" ? "bg-gray-900" : ""}`}>
        <div className="container mx-auto px-4">
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" text="Chargement des produits..." />
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className={`py-8 md:py-12 ${theme === "dark" ? "bg-gray-900" : ""}`}>
        <div className="container mx-auto px-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-8 text-center">
            <p className="text-red-600 dark:text-red-400 font-semibold">
              Erreur lors du chargement
            </p>
            <p className="text-sm text-red-500 dark:text-red-400 mt-2">
              {error}
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Empty state
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className={`py-8 md:py-12 ${theme === "dark" ? "bg-gray-900" : ""}`}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 md:mb-8">
          <div>
            <h2 className={`text-2xl md:text-3xl font-bold mb-2 flex items-center gap-3 ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}>
              {icon && <span className="text-3xl md:text-4xl">{icon}</span>}
              {title}
            </h2>
            {subtitle && (
              <p className={`text-sm md:text-base ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}>
                {subtitle}
              </p>
            )}
          </div>
          
          {viewAllLink && (
            <Link
              to={viewAllLink}
              className={`mt-4 sm:mt-0 font-semibold flex items-center gap-2 hover:gap-3 transition-all ${
                theme === "dark" 
                  ? "text-blue-400 hover:text-blue-300" 
                  : "text-blue-600 hover:text-blue-700"
              }`}
            >
              {viewAllText}
              <FaArrowRight />
            </Link>
          )}
        </div>

        {/* Products Grid */}
        <div className={`grid grid-cols-2 sm:grid-cols-2 ${getGridCols()} gap-3 md:gap-4 lg:gap-6`}>
          {products.map((product) => (
            <ProductCard 
              key={product._id} 
              product={product}
              onQuickView={onQuickView}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;
