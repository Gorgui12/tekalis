import { useParams, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { fetchProducts } from "../../../../packages/shared/redux/slices/productSlice";
import { addToCart } from "../../../../packages/shared/redux/slices/cartSlice";
import ProductCard from "../../src/components/product/ProductCard";
import { FaStar, FaStarHalfAlt, FaRegStar, FaShieldAlt, FaTruck, FaCheckCircle } from "react-icons/fa";
import api from "../../../../packages/shared/api/api";
import { useToast } from '../../../../packages/shared/context/ToastContext';


const ProductDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { items, isLoading } = useSelector((state) => state.products);
  const { user } = useSelector((state) => state.auth);
  const toast = useToast();
  
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState("description");
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, title: "", comment: "" });
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    if (items.length === 0) {
      dispatch(fetchProducts());
    }
  }, [dispatch, items.length]);

  useEffect(() => {
    // Charger les avis
    const fetchReviews = async () => {
      try {
        const { data } = await api.get(`/reviews/${id}`);
        setReviews(data.reviews || []);
      } catch (error) {
        console.error("Erreur chargement avis:", error);
      }
    };
    fetchReviews();
  }, [id]);

  const product = items.find((item) => item._id === id);

  if (isLoading || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du produit...</p>
        </div>
      </div>
    );
  }

  // Images du produit (simulé pour compatibilité avec votre modèle actuel)
  const productImages = product.images 
    ? (Array.isArray(product.images) ? product.images : [{ url: product.image }])
    : [{ url: product.image }];

  // Calcul de la note moyenne
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  // Composant étoiles
  const StarRating = ({ rating, size = 20 }) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<FaStar key={i} color="#FFA41C" size={size} />);
      } else if (i - rating < 1) {
        stars.push(<FaStarHalfAlt key={i} color="#FFA41C" size={size} />);
      } else {
        stars.push(<FaRegStar key={i} color="#FFA41C" size={size} />);
      }
    }
    return <div className="flex">{stars}</div>;
  };

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      dispatch(addToCart(product));
    }
    toast.success(`${quantity} × ${product.name} ajouté au panier !`);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Connectez-vous pour laisser un avis");
      return;
    }

    try {
      const { data } = await api.post("/reviews", {
        productId: id,
        ...newReview
      });
      setReviews([data.review, ...reviews]);
      setNewReview({ rating: 5, title: "", comment: "" });
      setShowReviewForm(false);
      toast.success("Avis ajouté avec succès !");
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de l'ajout de l'avis");
    }
  };

  const similarProducts = items.filter(
    (item) => {
      const itemCategories = Array.isArray(item.category) ? item.category : [item.category];
      const productCategories = Array.isArray(product.category) ? product.category : [product.category];
      return itemCategories.some(cat => productCategories.includes(cat)) && item._id !== product._id;
    }
  ).slice(0, 4);

  return (
    <div className="container mx-auto px-4 py-8 mt-32">
      {/* Fil d'Ariane */}
      <div className="text-sm text-gray-600 mb-6">
        <Link to="/" className="hover:text-blue-600">Accueil</Link>
        <span className="mx-2">/</span>
        <Link to="/products" className="hover:text-blue-600">Produits</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{product.name}</span>
      </div>

      {/* Section Principale */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Galerie d'images */}
        <div>
          <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
            <img
              src={productImages[selectedImage]?.url || product.image}
              alt={product.name}
              className="w-full h-96 object-contain"
            />
          </div>
          
          {/* Miniatures */}
          {productImages.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {productImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`border-2 rounded p-2 hover:border-blue-600 transition ${
                    selectedImage === idx ? "border-blue-600" : "border-gray-200"
                  }`}
                >
                  <img src={img.url || img} alt={`Vue ${idx + 1}`} className="w-full h-20 object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Informations produit */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
          
          {/* Avis et étoiles */}
          <div className="flex items-center gap-4 mb-6">
            <StarRating rating={avgRating} />
            <span className="text-gray-600">
              {avgRating.toFixed(1)} ({reviews.length} avis)
            </span>
          </div>

          {/* Prix */}
          <div className="mb-6">
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-blue-600">{product.price.toLocaleString()} FCFA</span>
              {product.comparePrice && (
                <span className="text-xl text-gray-400 line-through">{product.comparePrice.toLocaleString()} FCFA</span>
              )}
            </div>
          </div>

          {/* Badges */}
          <div className="flex gap-3 mb-6">
            <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-2 rounded">
              <FaCheckCircle />
              <span className="text-sm font-medium">En stock ({product.stock} unités)</span>
            </div>
            <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded">
              <FaShieldAlt />
              <span className="text-sm font-medium">Garantie 12 mois</span>
            </div>
          </div>

          {/* Description courte */}
          <p className="text-gray-700 mb-6 leading-relaxed">{product.description}</p>

          {/* Quantité */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Quantité :</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 border rounded hover:bg-gray-100 font-bold"
              >
                -
              </button>
              <input
                type="number"
                min={1}
                max={product.stock}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, Number(e.target.value))))}
                className="w-20 h-10 text-center border rounded"
              />
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="w-10 h-10 border rounded hover:bg-gray-100 font-bold"
              >
                +
              </button>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition"
            >
              🛒 Ajouter au panier
            </button>
            <button
              className="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition"
              title="Ajouter aux favoris"
            >
              ❤️
            </button>
          </div>

          {/* Livraison */}
          <div className="border-t pt-6">
            <div className="flex items-start gap-3 text-sm text-gray-700">
              <FaTruck className="text-blue-600 text-xl mt-1" />
              <div>
                <p className="font-semibold">Livraison gratuite à Dakar</p>
                <p className="text-gray-500">Livraison estimée : 2-3 jours ouvrés</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Onglets (Description / Specs / Avis) */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-12">
        <div className="border-b mb-6">
          <div className="flex gap-6">
            {["description", "specs", "reviews"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 px-2 font-semibold transition ${
                  activeTab === tab
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                {tab === "description" && "📝 Description"}
                {tab === "specs" && "🔧 Caractéristiques"}
                {tab === "reviews" && `⭐ Avis (${reviews.length})`}
              </button>
            ))}
          </div>
        </div>

        {/* Contenu des onglets */}
        {activeTab === "description" && (
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed">{product.description}</p>
          </div>
        )}

        {activeTab === "specs" && (
          <div className="grid md:grid-cols-2 gap-4">
            {product.specs ? (
              Object.entries(product.specs).map(([key, value]) => (
                <div key={key} className="flex justify-between py-2 border-b">
                  <span className="font-medium text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                  <span className="text-gray-900">{value || "N/A"}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 col-span-2">Aucune spécification disponible</p>
            )}
          </div>
        )}

        {activeTab === "reviews" && (
          <div>
            {/* Bouton ajouter un avis */}
            {user && !showReviewForm && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="mb-6 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                ✍️ Laisser un avis
              </button>
            )}

            {/* Formulaire d'avis */}
            {showReviewForm && (
              <form onSubmit={handleSubmitReview} className="mb-8 bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Votre avis</h3>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Note</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReview({ ...newReview, rating: star })}
                      >
                        <FaStar
                          size={24}
                          color={star <= newReview.rating ? "#FFA41C" : "#D1D5DB"}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Titre</label>
                  <input
                    type="text"
                    value={newReview.title}
                    onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Résumez votre avis..."
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Commentaire</label>
                  <textarea
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    rows={4}
                    placeholder="Partagez votre expérience..."
                    required
                  ></textarea>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                  >
                    Publier
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="bg-gray-300 px-6 py-2 rounded hover:bg-gray-400"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            )}

            {/* Liste des avis */}
            <div className="space-y-6">
              {reviews.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Aucun avis pour le moment. Soyez le premier à donner votre avis !</p>
              ) : (
                reviews.map((review) => (
                  <div key={review._id} className="border-b pb-6">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-semibold">{review.user?.name || "Anonyme"}</span>
                          {review.isVerified && (
                            <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
                              ✓ Achat vérifié
                            </span>
                          )}
                        </div>
                        <StarRating rating={review.rating} size={16} />
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {review.title && <h4 className="font-semibold mb-2">{review.title}</h4>}
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Produits similaires */}
      {similarProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Produits similaires</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {similarProducts.map((item) => (
              <ProductCard key={item._id} product={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;