import { Link } from "react-router-dom";
import { FaShoppingCart, FaEye, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";

const RecommendationCard = ({ 
  product, 
  rank = 1, 
  onAddToCart,
  showScore = true,
  variant = "default" // default, compact
}) => {
  const isTopChoice = rank === 1;

  // Variant compact (liste horizontale)
  if (variant === "compact") {
    return (
      <div className={`flex gap-4 bg-white border-2 rounded-lg p-4 ${
        isTopChoice ? "border-yellow-400 bg-yellow-50" : "border-gray-200"
      }`}>
        {/* Rank Badge */}
        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0 ${
          isTopChoice ? "bg-yellow-400 text-gray-900" : "bg-gray-200 text-gray-700"
        }`}>
          {rank}
        </div>

        {/* Image */}
        <div className="w-24 h-24 bg-gray-200 rounded flex-shrink-0"></div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg text-gray-900 mb-1 truncate">
            {product.name}
          </h3>
          <p className="text-2xl font-bold text-blue-600 mb-2">
            {product.price.toLocaleString()} FCFA
          </p>
          {showScore && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">Compatibilité:</span>
              <span className="font-bold text-blue-600">{product.score}/100</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => onAddToCart && onAddToCart(product)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2"
          >
            <FaShoppingCart />
          </button>
          <Link
            to={`/product/${product.id}`}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2"
          >
            <FaEye />
          </Link>
        </div>
      </div>
    );
  }

  // Default variant (carte complète)
  return (
    <div className={`border-2 rounded-lg p-6 transition hover:shadow-lg ${
      isTopChoice ? "border-yellow-400 bg-yellow-50" : "border-gray-200 bg-white"
    }`}>
      {/* Top Choice Badge */}
      {isTopChoice && (
        <div className="flex items-center gap-2 text-yellow-600 font-bold mb-4">
          <span className="text-2xl">🏆</span>
          <span>Meilleur choix pour vous</span>
        </div>
      )}

      {/* Rank Badge (for non-top choices) */}
      {!isTopChoice && (
        <div className="inline-flex items-center justify-center w-10 h-10 bg-gray-200 text-gray-700 rounded-full font-bold mb-4">
          #{rank}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        {/* Image & Score */}
        <div className="md:w-1/3">
          <div className="aspect-video bg-gray-200 rounded-lg mb-4">
            {/* Product image placeholder */}
          </div>
          
          {/* Score */}
          {showScore && (
            <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Score de compatibilité</span>
                <span className="text-3xl font-bold text-blue-600">{product.score}/100</span>
              </div>
              
              {/* Score Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${product.score}%` }}
                ></div>
              </div>
              
              <p className="text-xs text-gray-500 mt-2">
                {product.score >= 80 ? "Excellent choix" :
                 product.score >= 60 ? "Bon choix" :
                 "Acceptable"}
              </p>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="md:w-2/3">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {product.name}
          </h3>
          
          <p className="text-3xl font-bold text-blue-600 mb-4">
            {product.price.toLocaleString()} FCFA
          </p>

          {/* Specs Grid */}
          {product.specs && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              {Object.entries(product.specs).map(([key, value]) => (
                <div key={key} className="bg-gray-50 rounded p-3">
                  <p className="text-xs text-gray-600 capitalize mb-1">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                  <p className="font-semibold text-sm text-gray-900">{value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Pros & Cons */}
          {(product.pros || product.cons) && (
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              {/* Pros */}
              {product.pros && product.pros.length > 0 && (
                <div>
                  <p className="flex items-center gap-2 font-semibold text-sm text-green-700 mb-2">
                    <FaCheckCircle />
                    Points forts
                  </p>
                  <ul className="text-sm space-y-1">
                    {product.pros.map((pro, idx) => (
                      <li key={idx} className="text-gray-700 flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">•</span>
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Cons */}
              {product.cons && product.cons.length > 0 && (
                <div>
                  <p className="flex items-center gap-2 font-semibold text-sm text-orange-700 mb-2">
                    <FaExclamationTriangle />
                    Points faibles
                  </p>
                  <ul className="text-sm space-y-1">
                    {product.cons.map((con, idx) => (
                      <li key={idx} className="text-gray-700 flex items-start gap-2">
                        <span className="text-orange-500 mt-0.5">•</span>
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onAddToCart && onAddToCart(product)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              <FaShoppingCart />
              Ajouter au panier
            </button>
            
            <Link
              to={`/product/${product.id}`}
              className="flex-1 sm:flex-none bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
            >
              <FaEye />
              Voir détails
            </Link>
          </div>

          {/* Additional Info */}
          {product.stock !== undefined && (
            <div className="mt-4 pt-4 border-t">
              <p className={`text-sm font-semibold ${
                product.stock > 5 ? "text-green-600" :
                product.stock > 0 ? "text-orange-600" :
                "text-red-600"
              }`}>
                {product.stock > 5 ? `✓ En stock (${product.stock} unités disponibles)` :
                 product.stock > 0 ? `⚠ Stock limité (${product.stock} restant)` :
                 "✗ Rupture de stock"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecommendationCard;