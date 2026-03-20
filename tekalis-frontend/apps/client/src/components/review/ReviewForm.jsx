import { useState } from "react";
import { useSelector } from "react-redux";
import { FaPaperPlane, FaExclamationCircle } from "react-icons/fa";
import StarRating from "./StarRating";
import Button from "../shared/Button";
import api from "../../../../../packages/shared/api/client";
import { useToast } from "../../../../../packages/shared/context/ToastContext";

/**
 * ReviewForm — Formulaire d'ajout d'un avis produit
 * Props:
 *   productId: string
 *   onSuccess: (review) => void
 */
const ReviewForm = ({ productId, onSuccess }) => {
  const toast = useToast();
  const { user, token } = useSelector(state => state.auth);

  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!user) {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 text-center">
        <p className="text-blue-800 dark:text-blue-300 font-semibold mb-1">
          Connectez-vous pour laisser un avis
        </p>
        <p className="text-sm text-blue-600 dark:text-blue-400">
          Seuls les clients ayant acheté ce produit peuvent le noter.
        </p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 text-center">
        <p className="text-2xl mb-2">🎉</p>
        <p className="font-bold text-green-800 dark:text-green-300 mb-1">
          Merci pour votre avis !
        </p>
        <p className="text-sm text-green-700 dark:text-green-400">
          Votre avis sera publié après validation par notre équipe.
        </p>
      </div>
    );
  }

  const validate = () => {
    const errs = {};
    if (rating === 0) errs.rating = "Veuillez choisir une note";
    if (!title.trim()) errs.title = "Un titre est requis";
    if (comment.trim().length < 20) errs.comment = "Le commentaire doit faire au moins 20 caractères";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post(
        `/products/${productId}/reviews`,
        { rating, title: title.trim(), comment: comment.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubmitted(true);
      onSuccess?.(data.review);
    } catch (err) {
      const msg = err.response?.data?.message || "Erreur lors de l'envoi. Réessayez.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = (field) =>
    `w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 transition text-gray-900 dark:text-white dark:bg-gray-800 ${
      errors[field]
        ? "border-red-400 focus:ring-red-400 bg-red-50 dark:bg-red-900/20"
        : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 bg-white dark:bg-gray-800"
    }`;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
        Donnez votre avis
      </h3>

      {/* Note */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Note <span className="text-red-500">*</span>
        </label>
        <StarRating
          value={rating}
          onChange={(val) => {
            setRating(val);
            if (errors.rating) setErrors(p => ({ ...p, rating: undefined }));
          }}
          size="lg"
          showLabel
        />
        {errors.rating && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <FaExclamationCircle size={12} /> {errors.rating}
          </p>
        )}
      </div>

      {/* Titre */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-1.5">
          Titre de l'avis <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={e => { setTitle(e.target.value); setErrors(p => ({ ...p, title: undefined })); }}
          placeholder="Ex : Excellent produit, livraison rapide !"
          maxLength={100}
          className={inputClasses("title")}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <FaExclamationCircle size={12} /> {errors.title}
          </p>
        )}
      </div>

      {/* Commentaire */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-1.5">
          Commentaire <span className="text-red-500">*</span>
        </label>
        <textarea
          value={comment}
          onChange={e => { setComment(e.target.value); setErrors(p => ({ ...p, comment: undefined })); }}
          placeholder="Décrivez votre expérience avec ce produit..."
          rows={4}
          maxLength={1000}
          className={inputClasses("comment")}
        />
        <div className="flex items-center justify-between mt-1">
          {errors.comment ? (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <FaExclamationCircle size={12} /> {errors.comment}
            </p>
          ) : <span />}
          <span className={`text-xs ${comment.length < 20 ? "text-gray-400" : "text-green-600"}`}>
            {comment.length} / 1000
          </span>
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        isLoading={loading}
        icon={<FaPaperPlane />}
      >
        Publier l'avis
      </Button>

      <p className="text-xs text-gray-500 dark:text-gray-400">
        Votre avis sera publié sous le nom <strong>{user.name}</strong> après validation.
      </p>
    </form>
  );
};

export default ReviewForm;