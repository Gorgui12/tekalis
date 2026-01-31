import { Link } from "react-router-dom";
import { FaArrowRight, FaStar, FaShoppingCart } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { addToCart } from "";

const ProductsSection = ({ 
  title, 
  subtitle,
  products, 
  viewAllLink, 
  viewAllText = "Voir tout",
  columns = 4,
  showQuickAdd = true,
  theme = "light",
  icon
}) => {
  const dispatch = useDispatch();

  // Gérer l'ajout rapide au panier
  const handleQuickAdd = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addToCart(product));
    // Optionnel : toast notification
    alert(`${product.name} ajouté au panier !`);
  };

  // ProductCard
  const ProductCard = ({ product }) => {
    const discount = product.comparePrice
      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
      : 0;

    return (
      <Link
        to={`/product/${product._id}`}
        className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
      >
        {/* Image Container */}
        <div className="relative overflow-hidden bg-gray-50 aspect-square">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-300"
          />
          
          {/* Badges */}
          {discount > 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold z-10">
              -{discount}%
            </div>
          )}
          
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-gray-900 text-white px-4 py-2 rounded-lg font-bold text-sm">
                Rupture de stock
              </span>
            </div>
          )}
          
          {product.stock > 0 && product.stock < 5 && (
            <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded-md text-xs font-bold">
              Stock limité
            </div>
          )}

          {product.isNew && (
            <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-md text-xs font-bold">
              Nouveau
            </div>
          )}

          {/* Quick Add Button */}
          {showQuickAdd && product.stock > 0 && (
            <button
              onClick={(e) => handleQuickAdd(e, product)}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 flex items-center gap-2 shadow-lg"
            >
              <FaShoppingCart />
              <span className="hidden sm:inline">Ajouter</span>
            </button>
          )}
        </div>

        {/* Info Container */}
        <div className="p-4 flex flex-col flex-grow">
          {/* Brand */}
          {product.brand && (
            <span className="text-xs text-gray-500 uppercase font-semibold mb-1">
              {product.brand}
            </span>
          )}
          
          {/* Name */}
          <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition">
            {product.name}
          </h3>

          {/* Rating */}
          {product.rating?.average > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <FaStar className="text-yellow-400 text-xs" />
              <span className="text-xs font-medium text-gray-700">
                {product.rating.average.toFixed(1)}
              </span>
              <span className="text-xs text-gray-500">
                ({product.rating.count})
              </span>
            </div>
          )}

          {/* Specs (optionnel) */}
          {product.specs && (
            <div className="text-xs text-gray-600 mb-2 space-y-1">
              {product.specs.ram && (
                <div className="flex items-center gap-1">
                  <span className="font-medium">RAM:</span>
                  <span>{product.specs.ram}</span>
                </div>
              )}
            </div>
          )}

          {/* Price */}
          <div className="mt-auto">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-lg md:text-xl font-bold text-blue-600">
                {product.price.toLocaleString()} FCFA
              </span>
            </div>
            {product.comparePrice && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 line-through">
                  {product.comparePrice.toLocaleString()} FCFA
                </span>
                {discount > 0 && (
                  <span className="text-xs text-red-500 font-semibold">
                    Économisez {(product.comparePrice - product.price).toLocaleString()} FCFA
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </Link>
    );
  };

  if (!products || products.length === 0) {
    return null;
  }

  // Déterminer les colonnes en responsive
  const getGridCols = () => {
    if (columns === 3) return "md:grid-cols-3";
    if (columns === 4) return "md:grid-cols-3 lg:grid-cols-4";
    if (columns === 5) return "md:grid-cols-3 lg:grid-cols-5";
    if (columns === 6) return "md:grid-cols-3 lg:grid-cols-6";
    return "md:grid-cols-3 lg:grid-cols-4";
  };

  return (
    <section className={`py-8 md:py-12 ${theme === "dark" ? "bg-gray-900" : ""}`}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 md:mb-8">
          <div>
            <h2 className={`text-2xl md:text-3xl font-bold mb-2 flex items-center gap-3 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              {icon && <span className="text-3xl md:text-4xl">{icon}</span>}
              {title}
            </h2>
            {subtitle && (
              <p className={`text-sm md:text-base ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                {subtitle}
              </p>
            )}
          </div>
          
          {viewAllLink && (
            <Link
              to={viewAllLink}
              className={`mt-4 sm:mt-0 font-semibold flex items-center gap-2 hover:gap-3 transition-all ${theme === "dark" ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"}`}
            >
              {viewAllText}
              <FaArrowRight />
            </Link>
          )}
        </div>

        {/* Products Grid */}
        <div className={`grid grid-cols-2 sm:grid-cols-2 ${getGridCols()} gap-3 md:gap-4 lg:gap-6`}>
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;