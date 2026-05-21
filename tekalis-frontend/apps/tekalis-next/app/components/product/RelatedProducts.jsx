import { useState, useRef } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import ProductCard from "./ProductCard";
import LoadingSpinner from "../../shared/LoadingSpinner";

/**
 * RelatedProducts - Score 9/10
 * Carousel produits similaires avec navigation
 */
const RelatedProducts = ({ 
  products = [], 
  title = "Produits similaires",
  loading = false,
  onQuickView
}) => {
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollButtons = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    );
  };

  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = container.clientWidth * 0.8;
    const targetScroll = direction === 'left'
      ? container.scrollLeft - scrollAmount
      : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });

    setTimeout(updateScrollButtons, 300);
  };

  if (loading) {
    return (
      <div className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {title}
          </h2>
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" text="Chargement..." />
          </div>
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="py-12 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            {title}
          </h2>

          {/* Navigation buttons (desktop) */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={`p-3 rounded-full transition ${
                canScrollLeft
                  ? 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-600 hover:text-white shadow-md'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
              aria-label="Précédent"
            >
              <FaChevronLeft />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={`p-3 rounded-full transition ${
                canScrollRight
                  ? 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-600 hover:text-white shadow-md'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
              aria-label="Suivant"
            >
              <FaChevronRight />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div className="relative">
          <div
            ref={scrollContainerRef}
            onScroll={updateScrollButtons}
            className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {products.map((product) => (
              <div key={product._id} className="flex-shrink-0 w-64">
                <ProductCard 
                  product={product} 
                  onQuickView={onQuickView}
                />
              </div>
            ))}
          </div>

          {/* Gradient overlays (desktop) */}
          {canScrollLeft && (
            <div className="hidden md:block absolute left-0 top-0 bottom-4 w-20 bg-gradient-to-r from-gray-50 dark:from-gray-900 to-transparent pointer-events-none" />
          )}
          {canScrollRight && (
            <div className="hidden md:block absolute right-0 top-0 bottom-4 w-20 bg-gradient-to-l from-gray-50 dark:from-gray-900 to-transparent pointer-events-none" />
          )}
        </div>

        {/* Scroll indicator (mobile) */}
        <div className="md:hidden mt-4 flex justify-center gap-2">
          <div className={`h-1 w-8 rounded-full transition ${canScrollLeft ? 'bg-gray-300' : 'bg-blue-600'}`} />
          <div className={`h-1 w-8 rounded-full transition ${!canScrollLeft && !canScrollRight ? 'bg-blue-600' : 'bg-gray-300'}`} />
          <div className={`h-1 w-8 rounded-full transition ${canScrollRight ? 'bg-gray-300' : 'bg-blue-600'}`} />
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default RelatedProducts;