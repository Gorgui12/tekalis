import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  FaStar, 
  FaCheck, 
  FaTimes, 
  FaSearch,
  FaFilter,
  FaEye,
  FaTrash
} from "react-icons/fa";
import api from "../../api/api";

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRating, setFilterRating] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const { data } = await api.get("/admin/reviews");
      setReviews(data.reviews || getDemoReviews());
    } catch (error) {
      console.error("Erreur chargement avis:", error);
      setReviews(getDemoReviews());
    } finally {
      setLoading(false);
    }
  };

  const getDemoReviews = () => [
    {
      _id: "REV001",
      user: { name: "Mamadou Diop", email: "mamadou@email.com" },
      product: { _id: "PROD1", name: "HP Pavilion Gaming 15" },
      rating: 5,
      title: "Excellent produit !",
      comment: "Très satisfait de mon achat. Le PC est rapide et le rapport qualité-prix est imbattable. Je recommande vivement !",
      isVerified: true,
      status: "pending",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      _id: "REV002",
      user: { name: "Fatou Sall", email: "fatou@email.com" },
      product: { _id: "PROD2", name: "Dell XPS 13" },
      rating: 4,
      title: "Très bon ultrabook",
      comment: "Design magnifique et performances au rendez-vous. Juste un peu cher mais ça vaut le coup.",
      isVerified: true,
      status: "approved",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    },
    {
      _id: "REV003",
      user: { name: "Ousmane Dia", email: "ousmane@email.com" },
      product: { _id: "PROD3", name: "MacBook Air M2" },
      rating: 3,
      title: "Correct mais pas exceptionnel",
      comment: "Le produit est bien mais j'attendais mieux pour le prix. La batterie tient moins longtemps que prévu.",
      isVerified: false,
      status: "approved",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    },
    {
      _id: "REV004",
      user: { name: "Cheikh Fall", email: "cheikh@email.com" },
      product: { _id: "PROD1", name: "HP Pavilion Gaming 15" },
      rating: 2,
      title: "Déçu de la qualité",
      comment: "Le produit ne correspond pas à la description. Problème de chauffe et bruit excessif des ventilateurs.",
      isVerified: true,
      status: "pending",
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000)
    }
  ];

  // Filtrer les avis
  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRating = filterRating === "all" || review.rating === parseInt(filterRating);
    const matchesStatus = filterStatus === "all" || review.status === filterStatus;
    
    return matchesSearch && matchesRating && matchesStatus;
  });

  // Stats
  const stats = {
    total: reviews.length,
    pending: reviews.filter(r => r.status === "pending").length,
    approved: reviews.filter(r => r.status === "approved").length,
    rejected: reviews.filter(r => r.status === "rejected").length,
    avgRating: (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length || 0).toFixed(1)
  };

  // Modérer un avis
  const moderateReview = async (reviewId, action) => {
    try {
      await api.put(`/admin/reviews/${reviewId}/${action}`);
      fetchReviews();
      alert(`Avis ${action === "approve" ? "approuvé" : "rejeté"} avec succès`);
    } catch (error) {
      alert("Erreur lors de la modération");
    }
  };

  // Supprimer un avis
  const deleteReview = async (reviewId) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cet avis ?")) return;
    
    try {
      await api.delete(`/admin/reviews/${reviewId}`);
      fetchReviews();
      alert("Avis supprimé avec succès");
    } catch (error) {
      alert("Erreur lors de la suppression");
    }
  };

  // Afficher les étoiles
  const StarDisplay = ({ rating }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <FaStar
          key={star}
          className={star <= rating ? "text-yellow-400" : "text-gray-300"}
          size={16}
        />
      ))}
    </div>
  );

  // Badge de statut
  const StatusBadge = ({ status }) => {
    const configs = {
      pending: { bg: "bg-yellow-100", text: "text-yellow-700", label: "En attente" },
      approved: { bg: "bg-green-100", text: "text-green-700", label: "Approuvé" },
      rejected: { bg: "bg-red-100", text: "text-red-700", label: "Rejeté" }
    };
    const config = configs[status] || configs.pending;

    return (
      <span className={`${config.bg} ${config.text} px-3 py-1 rounded-full text-xs font-semibold`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/admin"
            className="text-blue-600 hover:text-blue-700 font-semibold mb-4 inline-block"
          >
            ← Retour au dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ⭐ Modération des avis
          </h1>
          <p className="text-gray-600">
            {filteredReviews.length} avis trouvé(s)
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-600">Total</p>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
            <p className="text-xs text-gray-600">En attente</p>
          </div>
          <div className="bg-green-50 rounded-lg shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-green-700">{stats.approved}</p>
            <p className="text-xs text-gray-600">Approuvés</p>
          </div>
          <div className="bg-red-50 rounded-lg shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-red-700">{stats.rejected}</p>
            <p className="text-xs text-gray-600">Rejetés</p>
          </div>
          <div className="bg-blue-50 rounded-lg shadow-md p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <FaStar className="text-yellow-400" />
              <p className="text-2xl font-bold text-blue-700">{stats.avgRating}</p>
            </div>
            <p className="text-xs text-gray-600">Note moyenne</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par produit, utilisateur, titre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FaTimes />
                </button>
              )}
            </div>

            {/* Rating Filter */}
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Toutes les notes</option>
              <option value="5">★★★★★ 5 étoiles</option>
              <option value="4">★★★★ 4 étoiles</option>
              <option value="3">★★★ 3 étoiles</option>
              <option value="2">★★ 2 étoiles</option>
              <option value="1">★ 1 étoile</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="approved">Approuvés</option>
              <option value="rejected">Rejetés</option>
            </select>
          </div>
        </div>

        {/* Reviews List */}
        {filteredReviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg">Aucun avis trouvé</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <div
                key={review._id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Left: User & Product Info */}
                  <div className="md:w-1/4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900">
                          {review.user?.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {review.user?.email}
                        </p>
                      </div>
                    </div>

                    <Link
                      to={`/product/${review.product?._id}`}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium block mb-2"
                    >
                      {review.product?.name}
                    </Link>

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      {review.isVerified && (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                          ✓ Achat vérifié
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(review.createdAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>

                  {/* Center: Review Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <StarDisplay rating={review.rating} />
                      <StatusBadge status={review.status} />
                    </div>

                    <h3 className="font-bold text-lg text-gray-900 mb-2">
                      {review.title}
                    </h3>

                    <p className="text-gray-700 leading-relaxed">
                      {review.comment}
                    </p>
                  </div>

                  {/* Right: Actions */}
                  <div className="md:w-32 flex md:flex-col gap-2">
                    {review.status === "pending" && (
                      <>
                        <button
                          onClick={() => moderateReview(review._id, "approve")}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
                          title="Approuver"
                        >
                          <FaCheck />
                          <span className="hidden md:inline">Approuver</span>
                        </button>
                        <button
                          onClick={() => moderateReview(review._id, "reject")}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
                          title="Rejeter"
                        >
                          <FaTimes />
                          <span className="hidden md:inline">Rejeter</span>
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => deleteReview(review._id)}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
                      title="Supprimer"
                    >
                      <FaTrash />
                      <span className="hidden md:inline">Supprimer</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReviews;