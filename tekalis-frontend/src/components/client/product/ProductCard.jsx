// components/client/product/ProductCard.jsx
import { useDispatch } from "react-redux";
import { addToCart } from "../../../redux/slices/cartSlice";
import { Link } from "react-router-dom";
import { FaStar, FaShoppingCart } from "react-icons/fa";

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();

  if (!product) {
    return (
      <div className="p-2 border rounded text-red-500 shadow">
        Produit introuvable
      </div>
    );
  }

  // Gérer les images multiples (nouveau modèle)
  const primaryImage = product.images?.find(img => img.isPrimary);
  const imageUrl = primaryImage?.url || product.image || "/images/no-image.webp";

  // Calculer la réduction
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  // Gérer le stock
  const isLowStock = product.stock > 0 && product.stock < 5;
  const isOutOfStock = product.stock === 0;

  const handleAddToCart = (e) => {
    e.preventDefault(); // Empêcher la navigation
    e.stopPropagation();
    
    if (isOutOfStock) {
      alert("Ce produit est en rupture de stock");
      return;
    }
    
    dispatch(addToCart(product));
  };

  return (
    <Link
      to={`/products/${product._id}`}
      className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full"
    >
      {/* Image Container */}
      <div className="relative overflow-hidden bg-gray-50 aspect-square">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-300"
          onError={(e) => {
            e.target.src = "/images/no-image.webp";
          }}
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discount > 0 && (
            <div className="bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold">
              -{discount}%
            </div>
          )}
          {isLowStock && (
            <div className="bg-orange-500 text-white px-2 py-1 rounded-md text-xs font-bold">
              Stock limité
            </div>
          )}
          {isOutOfStock && (
            <div className="bg-gray-500 text-white px-2 py-1 rounded-md text-xs font-bold">
              Rupture
            </div>
          )}
          {product.isFeatured && (
            <div className="bg-yellow-500 text-white px-2 py-1 rounded-md text-xs font-bold">
              ⭐ Vedette
            </div>
          )}
        </div>

        {/* Badge status */}
        {product.status === "preorder" && (
          <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-md text-xs font-bold">
            Précommande
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Brand */}
        {product.brand && (
          <span className="text-xs text-gray-500 uppercase font-semibold mb-1">
            {product.brand}
          </span>
        )}
        
        {/* Title */}
        <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition min-h-[2.5rem]">
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

        {/* Specs Preview (si disponibles) */}
        {product.specs && (
          <div className="text-xs text-gray-600 mb-2 space-y-1">
            {product.specs.processor && (
              <p className="line-clamp-1">🔧 {product.specs.processor}</p>
            )}
            {product.specs.ram && (
              <p>💾 RAM: {product.specs.ram}</p>
            )}
            {product.specs.storage && product.specs.storageType && (
              <p>💿 {product.specs.storage} {product.specs.storageType}</p>
            )}
          </div>
        )}

        {/* Price */}
        <div className="mt-auto">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-lg font-bold text-blue-600">
              {product.price.toLocaleString()} FCFA
            </span>
          </div>
          {product.comparePrice && (
            <span className="text-xs text-gray-400 line-through">
              {product.comparePrice.toLocaleString()} FCFA
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`mt-3 w-full py-2 px-4 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
            isOutOfStock
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg"
          }`}
        >
          <FaShoppingCart />
          {isOutOfStock ? "Rupture de stock" : "Ajouter au panier"}
        </button>
      </div>
    </Link>
  );
};

export default ProductCard;