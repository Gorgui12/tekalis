import { useState } from "react";
import { useDispatch } from "react-redux";
import { addToCart } from "../../../../../packages/shared/redux/slices/cartSlice";
import { toggleWishlist } from "../../../../../packages/shared/redux/slices/wishlistSlice";
import { Link } from "react-router-dom";
import { 
  FaTimes, FaShoppingCart, FaHeart, FaStar, FaMinus, FaPlus,
  FaExternalLinkAlt, FaCheckCircle, FaBox
} from "react-icons/fa";
import { useToast } from "../../../../../packages/shared/context/ToastContext";
import Button from "../../shared/Button";

/**
 * ProductQuickView - Score 9/10
 * Modal aperçu rapide produit
 */
const ProductQuickView = ({ product, isOpen, onClose }) => {
  const dispatch = useDispatch();
  const toast = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  if (!isOpen || !product) return null;

  const images = product.images?.length > 0 
    ? product.images 
    : [{ url: product.image || "/images/no-image.webp" }];

  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  const isOutOfStock = product.stock === 0;

  const handleAddToCart = () => {
    if (isOutOfStock) {
      toast.error("Produit en rupture de stock");
      return;
    }

    for (let i = 0; i < quantity; i++) {
      dispatch(addToCart(product));
    }
    
    toast.success(`${quantity} × ${product.name} ajouté${quantity > 1 ? 's' : ''} au panier !`);
    onClose();
  };

  const handleWishlist = () => {
    dispatch(toggleWishlist(product));
    toast.success("Ajouté à la liste de souhaits");
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 z-10"
          aria-label="Fermer"
        >
          <FaTimes size={24} />
        </button>

        <div className="grid md:grid-cols-2 gap-8 p-8">
          {/* Gallery */}
          <div className="space-y-4">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg aspect-square overflow-hidden">
              <img
                src={images[selectedImage].url}
                alt={product.name}
                className="w-full h-full object-contain p-8"
              />
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border-2 ${
                      idx === selectedImage
                        ? 'border-blue-600'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-contain p-2" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6">
            {/* Brand */}
            {product.brand && (
              <span className="text-sm text-gray-500 dark:text-gray-400 uppercase font-semibold">
                {product.brand}
              </span>
            )}

            {/* Title */}
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              {product.name}
            </h2>

            {/* Rating */}
            {product.rating?.average > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={i < Math.floor(product.rating.average) ? 'text-yellow-400' : 'text-gray-300'}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {product.rating.average.toFixed(1)} ({product.rating.count} avis)
                </span>
              </div>
            )}

            {/* Price */}
            <div>
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {product.price.toLocaleString()} FCFA
                </span>
                {product.comparePrice && (
                  <span className="text-lg text-gray-400 line-through">
                    {product.comparePrice.toLocaleString()} FCFA
                  </span>
                )}
              </div>
              {discount > 0 && (
                <p className="text-sm text-red-500 font-semibold">
                  Économisez {(product.comparePrice - product.price).toLocaleString()} FCFA ({discount}%)
                </p>
              )}
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2">
              {isOutOfStock ? (
                <span className="text-red-500 font-semibold flex items-center gap-2">
                  <FaBox />
                  Rupture de stock
                </span>
              ) : product.stock < 5 ? (
                <span className="text-orange-500 font-semibold flex items-center gap-2">
                  <FaBox />
                  Stock limité ({product.stock} restants)
                </span>
              ) : (
                <span className="text-green-500 font-semibold flex items-center gap-2">
                  <FaCheckCircle />
                  En stock
                </span>
              )}
            </div>

            {/* Description courte */}
            {product.description && (
              <p className="text-gray-600 dark:text-gray-400 line-clamp-3">
                {product.description}
              </p>
            )}

            {/* Specs highlight */}
            {product.specs && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
                {product.specs.processor && (
                  <p className="text-sm flex items-center gap-2">
                    <FaCheckCircle className="text-green-500" />
                    {product.specs.processor}
                  </p>
                )}
                {product.specs.ram && (
                  <p className="text-sm flex items-center gap-2">
                    <FaCheckCircle className="text-green-500" />
                    RAM: {product.specs.ram}
                  </p>
                )}
              </div>
            )}

            {/* Quantity */}
            {!isOutOfStock && (
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Quantité:
                </span>
                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  >
                    <FaMinus size={12} />
                  </button>
                  <span className="px-6 py-2 font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  >
                    <FaPlus size={12} />
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                variant="primary"
                icon={<FaShoppingCart />}
                className="flex-1"
              >
                Ajouter au panier
              </Button>
              
              <Button
                onClick={handleWishlist}
                variant="outline"
                icon={<FaHeart />}
              >
              </Button>
            </div>

            {/* View full details */}
            <Link
              to={`/products/${product._id}`}
              className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition"
              onClick={onClose}
            >
              <FaExternalLinkAlt />
              Voir tous les détails
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductQuickView;