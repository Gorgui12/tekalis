import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../../../../../packages/shared/redux/slices/cartSlice";
import { FaStar, FaShoppingCart, FaEye } from "react-icons/fa";
import { useToast } from '../../../../../packages/shared/context/ToastContext';


const CartItem = ({ product }) => {
  const toast = useToast();
  const dispatch = useDispatch();

  // Calcul de la note moyenne (si disponible)
  const avgRating = product.rating?.average || 0;
  const reviewCount = product.rating?.count || 0;

  // Calcul de la réduction
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addToCart(product));
    // Optionnel : notification toast
    toast.success(`${product.name} ajouté au panier !`);
  };

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
        
        {/* Badge réduction */}
        {discount > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold">
            -{discount}%
          </div>
        )}

        {/* Badge Stock */}
        {product.stock === 0 && (
          <div className="absolute top-2 right-2 bg-gray-800 text-white px-2 py-1 rounded-md text-xs font-bold">
            Rupture
          </div>
        )}
        {product.stock > 0 && product.stock < 5 && (
          <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded-md text-xs font-bold">
            Stock limité
          </div>
        )}

        {/* Overlay actions au hover */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex gap-2">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              title="Ajouter au panier"
            >
              <FaShoppingCart size={18} />
            </button>
            <Link
              to={`/product/${product._id}`}
              className="bg-white hover:bg-gray-100 text-gray-800 p-3 rounded-full transition"
              title="Voir détails"
            >
              <FaEye size={18} />
            </Link>
          </div>
        </div>
      </div>

      {/* Infos Produit */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Marque */}
        {product.brand && (
          <span className="text-xs text-gray-500 uppercase font-semibold mb-1">
            {product.brand}
          </span>
        )}

        {/* Nom du produit */}
        <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition">
          {product.name}
        </h3>

        {/* Note et avis */}
        {reviewCount > 0 && (
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center">
              <FaStar className="text-yellow-400" size={14} />
              <span className="text-sm font-medium text-gray-700 ml-1">
                {avgRating.toFixed(1)}
              </span>
            </div>
            <span className="text-xs text-gray-500">({reviewCount})</span>
          </div>
        )}

        {/* Specs rapides (si disponibles) */}
        {product.specs && (
          <div className="text-xs text-gray-600 mb-2 space-y-1">
            {product.specs.ram && (
              <div className="flex items-center gap-1">
                <span className="font-medium">RAM:</span>
                <span>{product.specs.ram}</span>
              </div>
            )}
            {product.specs.storage && (
              <div className="flex items-center gap-1">
                <span className="font-medium">Storage:</span>
                <span>{product.specs.storage}</span>
              </div>
            )}
          </div>
        )}

        {/* Prix */}
        <div className="mt-auto">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-lg md:text-xl font-bold text-blue-600">
              {product.price.toLocaleString()} FCFA
            </span>
          </div>
          
          {product.comparePrice && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400 line-through">
                {product.comparePrice.toLocaleString()} FCFA
              </span>
              <span className="text-xs text-red-500 font-semibold">
                Économisez {(product.comparePrice - product.price).toLocaleString()} FCFA
              </span>
            </div>
          )}
        </div>

        {/* Bouton d'action mobile */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 md:hidden"
        >
          <FaShoppingCart />
          {product.stock === 0 ? "Rupture" : "Ajouter"}
        </button>
      </div>
    </Link>
  );
};

export default CartItem;