import { useState } from "react";
import { FaStar, FaRegStar } from "react-icons/fa";

/**
 * StarRating — Composant d'étoiles interactif ou en lecture seule
 * Props:
 *   value: number (0-5)
 *   onChange: (value: number) => void  — si fourni, mode interactif
 *   max: number (défaut 5)
 *   size: "sm" | "md" | "lg"
 *   showLabel: boolean
 *   readOnly: boolean
 */

const LABELS = ["Très mauvais", "Mauvais", "Moyen", "Bien", "Excellent"];

const StarRating = ({
  value = 0,
  onChange,
  max = 5,
  size = "md",
  showLabel = false,
  readOnly = false,
  className = ""
}) => {
  const [hovered, setHovered] = useState(0);
  const isInteractive = !!onChange && !readOnly;

  const sizeClasses = {
    sm: "text-base",
    md: "text-2xl",
    lg: "text-3xl"
  };

  const displayValue = isInteractive ? (hovered || value) : value;

  return (
    <div className={`flex flex-col items-start gap-1 ${className}`}>
      <div
        className="flex items-center gap-1"
        role={isInteractive ? "radiogroup" : undefined}
        aria-label={isInteractive ? "Choisir une note" : `Note : ${value} sur ${max}`}
      >
        {[...Array(max)].map((_, i) => {
          const starValue = i + 1;
          const isFilled = starValue <= displayValue;

          return (
            <button
              key={i}
              type="button"
              disabled={!isInteractive}
              onClick={() => isInteractive && onChange(starValue)}
              onMouseEnter={() => isInteractive && setHovered(starValue)}
              onMouseLeave={() => isInteractive && setHovered(0)}
              className={`transition-all ${sizeClasses[size]} ${
                isInteractive
                  ? "cursor-pointer hover:scale-110 focus:outline-none focus:scale-110"
                  : "cursor-default"
              }`}
              aria-label={`${starValue} étoile${starValue > 1 ? "s" : ""}`}
            >
              {isFilled ? (
                <FaStar
                  className={
                    isInteractive && hovered > 0
                      ? hovered >= starValue ? "text-yellow-400" : "text-gray-300"
                      : "text-yellow-400"
                  }
                />
              ) : (
                <FaRegStar className="text-gray-300 dark:text-gray-600" />
              )}
            </button>
          );
        })}
      </div>

      {/* Label */}
      {showLabel && isInteractive && (hovered || value) > 0 && (
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {LABELS[(hovered || value) - 1]}
        </span>
      )}
    </div>
  );
};

/**
 * StarRatingDisplay — Version affichage seule avec moyenne et compteur
 * Props:
 *   average: number
 *   count: number
 *   size: "sm" | "md" | "lg"
 */
export const StarRatingDisplay = ({ average = 0, count = 0, size = "sm" }) => {
  const sizeClasses = { sm: "text-sm", md: "text-base", lg: "text-xl" };

  return (
    <div className="flex items-center gap-2">
      <div className={`flex items-center ${sizeClasses[size]}`}>
        {[...Array(5)].map((_, i) => (
          <span key={i}>
            {i < Math.floor(average) ? (
              <FaStar className="text-yellow-400" />
            ) : i < average ? (
              // Demi-étoile simulée avec clip
              <span className="relative">
                <FaRegStar className="text-gray-300 dark:text-gray-600" />
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${(average % 1) * 100}%` }}
                >
                  <FaStar className="text-yellow-400" />
                </span>
              </span>
            ) : (
              <FaRegStar className="text-gray-300 dark:text-gray-600" />
            )}
          </span>
        ))}
      </div>

      {count > 0 && (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          <span className="font-semibold text-gray-700 dark:text-gray-300">
            {average.toFixed(1)}
          </span>
          {" "}({count} avis)
        </span>
      )}
    </div>
  );
};

export default StarRating;