import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { 
  FaHeart, 
  FaShoppingCart, 
  FaTrash,
  FaShare
} from "react-icons/fa";
import { addToCart } from "../../redux/slices/cartSlice";
import api from "../../api/api";

const Wishlist = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    fetchWishlist();
  }, [user, navigate]);

  const fetchWishlist = async () => {
    try {
      const { data } = await api.get("/wishlist");
      setWishlist(data.items || []);
    } catch (error) {
      console.error("Erreur chargement wishlist:", error);
    } finally {
      setLoading(false);
    }
  };

  // Retirer un produit de la wishlist
  const removeFromWishlist = async (productId) => {
    try {
      await api.delete(`/wishlist/${productId}`);
      setWishlist(wishlist.filter(item => item.product._id !== productId));
    } catch (error) {
      alert("Erreur lors de la suppression");
    }
  };

  // Ajouter au panier
  const handleAddToCart = (product) => {
    dispatch(addToCart(product));
    alert(`${product.name} ajouté au panier !`);
  };

  // Ajouter tous au panier
  const addAllToCart = () => {
    wishlist.forEach(item => {
      if (item.product.stock > 0) {
        dispatch(addToCart(item.product));
      }
    });
    alert(`${wishlist.filter(i => i.product.stock > 0).length} produits ajoutés au panier !`);
  };

  // Partager la wishlist
  const shareWishlist = () => {
    const url = `${window.location.origin}/wishlist/shared/${user._id}`;
    navigator.clipboard.writeText(url);
    alert("Lien copié ! Vous pouvez le partager avec vos proches.");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center mt-20">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 mt-20">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* En-tête */}
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="text-blue-600 hover:text-blue-700 font-semibold mb-4 inline-block"
          >
            ← Retour au dashboard
          </Link>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <FaHeart className="text-red-500" />
                Ma Wishlist
              </h1>
              <p className="text-gray-600">
                {wishlist.length} produit{wishlist.length > 1 ? "s" : ""} dans vos favoris
              </p>
            </div>
            
            {wishlist.length > 0 && (
              <div className="flex gap-3">
                <button
                  onClick={addAllToCart}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition"
                >
                  <FaShoppingCart />
                  Tout ajouter au panier
                </button>
                <button
                  onClick={shareWishlist}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg font-semibold flex items-center gap-2 transition"
                >
                  <FaShare />
                  Partager
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Liste vide */}
        {wishlist.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FaHeart className="text-6xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Votre wishlist est vide
            </h3>
            <p className="text-gray-600 mb-6">
              Ajoutez des produits à vos favoris pour les retrouver facilement !
            </p>
            <Link
              to="/products"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Découvrir nos produits
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((item) => {
              const product = item.product;
              const discount = product.comparePrice
                ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
                : 0;

              return (
                <div
                  key={product._id}
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition group relative overflow-hidden"
                >
                  {/* Badge réduction */}
                  {discount > 0 && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold z-10">
                      -{discount}%
                    </div>
                  )}

                  {/* Bouton supprimer */}
                  <button
                    onClick={() => removeFromWishlist(product._id)}
                    className="absolute top-2 right-2 bg-white hover:bg-red-500 text-red-500 hover:text-white w-8 h-8 rounded-full flex items-center justify-center transition z-10 shadow-md"
                    title="Retirer de la wishlist"
                  >
                    <FaTrash size={14} />
                  </button>

                  {/* Image */}
                  <Link to={`/product/${product._id}`} className="block">
                    <div className="relative bg-gray-50 aspect-square p-4">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                      />
                      
                      {/* Badge stock */}
                      {product.stock === 0 && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold">
                            Rupture de stock
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Infos */}
                  <div className="p-4">
                    {product.brand && (
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                        {product.brand}
                      </p>
                    )}

                    <Link
                      to={`/product/${product._id}`}
                      className="font-semibold text-gray-900 hover:text-blue-600 line-clamp-2 mb-2 block"
                    >
                      {product.name}
                    </Link>

                    {/* Prix */}
                    <div className="mb-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-blue-600">
                          {product.price.toLocaleString()} FCFA
                        </span>
                      </div>
                      {product.comparePrice && (
                        <p className="text-sm text-gray-400 line-through">
                          {product.comparePrice.toLocaleString()} FCFA
                        </p>
                      )}
                    </div>

                    {/* Stock */}
                    <div className="mb-3">
                      {product.stock > 0 ? (
                        <p className="text-xs text-green-600 font-semibold">
                          ✓ En stock ({product.stock} unités)
                        </p>
                      ) : (
                        <p className="text-xs text-red-600 font-semibold">
                          ✗ Rupture de stock
                        </p>
                      )}
                    </div>

                    {/* Bouton ajouter au panier */}
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                    >
                      <FaShoppingCart />
                      {product.stock > 0 ? "Ajouter au panier" : "Indisponible"}
                    </button>
                  </div>

                  {/* Date d'ajout */}
                  <div className="px-4 pb-3 text-xs text-gray-500">
                    Ajouté le {new Date(item.addedAt).toLocaleDateString("fr-FR")}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Info wishlist */}
        {wishlist.length > 0 && (
          <div className="mt-8 bg-gradient-to-br from-pink-600 to-red-600 rounded-lg shadow-lg p-6 text-white">
            <h3 className="text-xl font-bold mb-4">
              💡 Le saviez-vous ?
            </h3>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold mb-2">Alertes de prix</p>
                <p className="text-pink-100">
                  Recevez une notification lorsqu'un produit de votre wishlist est en promotion !
                </p>
              </div>
              <div>
                <p className="font-semibold mb-2">Partage facile</p>
                <p className="text-pink-100">
                  Partagez votre wishlist avec vos proches pour vos idées cadeaux.
                </p>
              </div>
              <div>
                <p className="font-semibold mb-2">Disponibilité</p>
                <p className="text-pink-100">
                  Soyez notifié quand un produit en rupture redevient disponible.
                </p>
              </div>
              <div>
                <p className="font-semibold mb-2">Recommandations</p>
                <p className="text-pink-100">
                  Découvrez des produits similaires basés sur vos favoris.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;