import { FaThumbsUp, FaThumbsDown, FaCheckCircle } from "react-icons/fa";
import { useState } from "react";
import StarRating from "./StarRating";

/**
 * ReviewCard — Affiche un avis utilisateur
 * Props:
 *   review: Object
 *   onHelpful: (reviewId, helpful: boolean) => void
 */
const ReviewCard = ({ review, onHelpful }) => {
  const [helpfulVoted, setHelpfulVoted] = useState(null); // null | "up" | "down"

  if (!review) return null;

  const handleVote = (type) => {
    if (helpfulVoted) return; // déjà voté
    setHelpfulVoted(type);
    onHelpful?.(review._id, type === "up");
  };

  const initials = review.user?.name
    ? review.user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-3">
      {/* Header : avatar + nom + date + vérifié */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {review.user?.avatar ? (
              <img
                src={review.user.avatar}
                alt={review.user.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : initials}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-gray-900 dark:text-white text-sm">
                {review.user?.name || "Utilisateur"}
              </p>
              {review.verifiedPurchase && (
                <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
                  <FaCheckCircle size={11} />
                  Achat vérifié
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {review.createdAt
                ? new Date(review.createdAt).toLocaleDateString("fr-FR", {
                    day: "2-digit", month: "long", year: "numeric"
                  })
                : "—"}
            </p>
          </div>
        </div>

        {/* Note */}
        <StarRating value={review.rating} readOnly size="sm" />
      </div>

      {/* Titre */}
      {review.title && (
        <p className="font-bold text-gray-900 dark:text-white text-sm">
          {review.title}
        </p>
      )}

      {/* Commentaire */}
      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
        {review.comment}
      </p>

      {/* Utilité */}
      <div className="flex items-center gap-4 pt-2 border-t border-gray-100 dark:border-gray-700">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Cet avis vous a été utile ?
        </span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleVote("up")}
            disabled={!!helpfulVoted}
            className={`flex items-center gap-1.5 text-xs font-semibold transition ${
              helpfulVoted === "up"
                ? "text-green-600 dark:text-green-400"
                : "text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400"
            } disabled:cursor-not-allowed`}
          >
            <FaThumbsUp size={13} />
            <span>Oui ({(review.helpful || 0) + (helpfulVoted === "up" ? 1 : 0)})</span>
          </button>
          <button
            onClick={() => handleVote("down")}
            disabled={!!helpfulVoted}
            className={`flex items-center gap-1.5 text-xs font-semibold transition ${
              helpfulVoted === "down"
                ? "text-red-500 dark:text-red-400"
                : "text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
            } disabled:cursor-not-allowed`}
          >
            <FaThumbsDown size={13} />
            <span>Non</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;