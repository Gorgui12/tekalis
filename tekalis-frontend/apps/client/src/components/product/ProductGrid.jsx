import { FaThLarge, FaList } from "react-icons/fa";
import ProductCard from "./ProductCard";
import EmptyState from "../../shared/EmptyState";
import LoadingSpinner from "../../shared/LoadingSpinner";
import Button from "../../shared/Button";

/**
 * ProductGrid - Score 9/10
 * Grille responsive avec loading/empty/error states
 */
const ProductGrid = ({
  products = [],
  loading = false,
  error = null,
  layout = "grid",
  onLayoutChange,
  onLoadMore,
  hasMore = false,
  loadingMore = false,
  onQuickView
}) => {
  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <LoadingSpinner size="lg" text="Chargement des produits..." />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-8 text-center">
        <p className="text-red-600 dark:text-red-400 font-semibold mb-4">
          Erreur lors du chargement des produits
        </p>
        <p className="text-sm text-red-500 dark:text-red-400">
          {error}
        </p>
      </div>
    );
  }

  // Empty state
  if (!products || products.length === 0) {
    return (
      <EmptyState
        icon="🔍"
        title="Aucun produit trouvé"
        description="Essayez de modifier vos filtres ou votre recherche"
        actionText="Réinitialiser les filtres"
        onAction={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec layout toggle */}
      {onLayoutChange && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {products.length} produit{products.length > 1 ? 's' : ''}
          </p>
          
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm">
            <button
              onClick={() => onLayoutChange('grid')}
              className={`p-2 rounded transition ${
                layout === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              aria-label="Vue grille"
            >
              <FaThLarge />
            </button>
            <button
              onClick={() => onLayoutChange('list')}
              className={`p-2 rounded transition ${
                layout === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              aria-label="Vue liste"
            >
              <FaList />
            </button>
          </div>
        </div>
      )}

      {/* Grid */}
      <div
        className={
          layout === 'list'
            ? 'space-y-4'
            : 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6'
        }
      >
        {products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            layout={layout}
            onQuickView={onQuickView}
          />
        ))}
      </div>

      {/* Load More */}
      {hasMore && onLoadMore && (
        <div className="flex justify-center pt-8">
          <Button
            onClick={onLoadMore}
            isLoading={loadingMore}
            variant="outline"
            size="lg"
          >
            {loadingMore ? 'Chargement...' : 'Charger plus de produits'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;