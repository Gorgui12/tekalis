import { useState, useEffect } from "react";
import { FaFilter, FaSortAmountDown } from "react-icons/fa";
import ReviewCard from "./ReviewCard";
import ReviewForm from "./ReviewForm";
import { StarRatingDisplay } from "./StarRating";
import LoadingSpinner from "../shared/LoadingSpinner";
import EmptyState from "../shared/EmptyState";
import Pagination from "../shared/Pagination";
import api from "../../../../../packages/shared/api/client";

/**
 * ReviewList — Liste des avis avec moyenne, tri et pagination
 * Props:
 *   productId: string
 *   rating: { average: number, count: number }
 *   showForm: boolean
 */
const ReviewList = ({ productId, rating = {}, showForm = true }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("recent");
  const [filterRating, setFilterRating] = useState(0);

  const SORT_OPTIONS = [
    { value: "recent",  label: "Plus récents" },
    { value: "helpful", label: "Plus utiles" },
    { value: "highest", label: "Meilleures notes" },
    { value: "lowest",  label: "Notes les plus basses" }
  ];

  // ─── Chargement des avis ──────────────────────────────────────────────────
  const fetchReviews = async () => {
    if (!productId) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        sort: sortBy,
        ...(filterRating > 0 && { rating: filterRating })
      });

      const { data } = await api.get(`/products/${productId}/reviews?${params}`);
      setReviews(data.reviews || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error("Erreur chargement avis", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId, currentPage, sortBy, filterRating]);

  // ─── Vote utile ───────────────────────────────────────────────────────────
  const handleHelpful = async (reviewId, helpful) => {
    try {
      await api.post(`/reviews/${reviewId}/helpful`, { helpful });
    } catch (err) {
      console.error(err);
    }
  };

  // ─── Nouveau avis ─────────────────────────────────────────────────────────
  const handleNewReview = (review) => {
    setReviews(prev => [review, ...prev]);
  };

  // ─── Distribution des notes ───────────────────────────────────────────────
  const ratingDistribution = rating.distribution || {};
  const maxCount = Math.max(...Object.values(ratingDistribution), 1);

  return (
    <div className="space-y-8">

      {/* ─── Résumé des notes ────────────────────────────────────────────── */}
      {rating.count > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="grid sm:grid-cols-2 gap-6 items-center">
            {/* Moyenne */}
            <div className="text-center">
              <div className="text-6xl font-bold text-gray-900 dark:text-white mb-2">
                {(rating.average || 0).toFixed(1)}
              </div>
              <StarRatingDisplay
                average={rating.average || 0}
                count={rating.count || 0}
                size="md"
              />
            </div>

            {/* Barres de distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map(star => {
                const count = ratingDistribution[star] || 0;
                const percent = maxCount > 0 ? Math.round((count / maxCount) * 100) : 0;
                return (
                  <button
                    key={star}
                    onClick={() => setFilterRating(filterRating === star ? 0 : star)}
                    className={`w-full flex items-center gap-2 text-sm group ${
                      filterRating === star ? "opacity-100" : "opacity-80 hover:opacity-100"
                    }`}
                  >
                    <span className={`w-6 text-right font-semibold flex-shrink-0 ${
                      filterRating === star ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"
                    }`}>{star}★</span>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          filterRating === star ? "bg-blue-500" : "bg-yellow-400"
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="w-6 text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                      {count}
                    </span>
                  </button>
                );
              })}
              {filterRating > 0 && (
                <button
                  onClick={() => setFilterRating(0)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1"
                >
                  Afficher tous les avis
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Formulaire d'avis ───────────────────────────────────────────── */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <ReviewForm productId={productId} onSuccess={handleNewReview} />
        </div>
      )}

      {/* ─── Tri ─────────────────────────────────────────────────────────── */}
      {reviews.length > 0 || !loading ? (
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FaFilter className="text-blue-600" size={14} />
            {rating.count || 0} avis
            {filterRating > 0 && <span className="text-sm text-blue-600 dark:text-blue-400">({filterRating} étoiles)</span>}
          </h3>

          <div className="flex items-center gap-2">
            <FaSortAmountDown className="text-gray-400" size={14} />
            <select
              value={sortBy}
              onChange={e => { setSortBy(e.target.value); setCurrentPage(1); }}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      ) : null}

      {/* ─── Liste des avis ──────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner text="Chargement des avis..." />
        </div>
      ) : reviews.length === 0 ? (
        <EmptyState
          icon="💬"
          title="Aucun avis pour le moment"
          description={
            filterRating > 0
              ? `Aucun avis avec ${filterRating} étoile${filterRating > 1 ? "s" : ""}`
              : "Soyez le premier à donner votre avis sur ce produit !"
          }
        />
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <ReviewCard
              key={review._id}
              review={review}
              onHelpful={handleHelpful}
            />
          ))}
        </div>
      )}

      {/* ─── Pagination ──────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default ReviewList;