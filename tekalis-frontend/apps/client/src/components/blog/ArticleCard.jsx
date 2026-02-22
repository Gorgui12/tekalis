import { Link } from "react-router-dom";
import { FaClock, FaEye, FaUser } from "react-icons/fa";

const ArticleCard = ({ article, variant = "default", featured = false }) => {
  // Catégories avec couleurs
  const categories = {
    test: { label: "Test", icon: "🧪", color: "bg-green-100 text-green-700" },
    guide: { label: "Guide", icon: "📖", color: "bg-purple-100 text-purple-700" },
    tutorial: { label: "Tutoriel", icon: "🎓", color: "bg-orange-100 text-orange-700" },
    news: { label: "Actualité", icon: "📰", color: "bg-red-100 text-red-700" },
    comparison: { label: "Comparatif", icon: "⚖️", color: "bg-indigo-100 text-indigo-700" }
  };

  const cat = categories[article.category] || categories.test;

  // Variant: "default", "compact", "horizontal"
  if (variant === "compact") {
    return (
      <Link
        to={`/blog/${article.slug}`}
        className="flex gap-3 p-3 hover:bg-gray-50 rounded-lg transition group"
      >
        <div className="w-20 h-20 bg-gray-200 rounded flex-shrink-0"></div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 group-hover:text-blue-600 transition mb-1">
            {article.title}
          </h3>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <FaClock size={10} />
            <span>{article.readTime} min</span>
            <span>•</span>
            <span>{new Date(article.publishedAt).toLocaleDateString("fr-FR")}</span>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "horizontal") {
    return (
      <Link
        to={`/blog/${article.slug}`}
        className="flex flex-col md:flex-row gap-4 bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden group"
      >
        <div className="md:w-1/3 relative">
          <div className="aspect-video md:aspect-auto md:h-full bg-gray-200"></div>
          <div className="absolute top-3 left-3">
            <span className={`${cat.color} px-2 py-1 rounded-full text-xs font-bold uppercase inline-flex items-center gap-1`}>
              <span>{cat.icon}</span>
              {cat.label}
            </span>
          </div>
        </div>
        <div className="md:w-2/3 p-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition">
            {article.title}
          </h3>
          <p className="text-gray-600 mb-3 line-clamp-2">
            {article.excerpt}
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <FaClock />
              {article.readTime} min
            </span>
            <span className="flex items-center gap-1">
              <FaEye />
              {article.views}
            </span>
            <span className="flex items-center gap-1">
              <FaUser />
              {article.author?.name}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  // Default variant (card)
  return (
    <Link
      to={`/blog/${article.slug}`}
      className={`block bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden group ${
        featured ? "md:col-span-2 md:row-span-2" : ""
      }`}
    >
      <div className="relative">
        <div className={`${featured ? "aspect-video md:aspect-[21/9]" : "aspect-video"} bg-gray-200`}>
          {/* Image placeholder */}
        </div>
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className={`${cat.color} px-3 py-1 rounded-full text-xs font-bold uppercase inline-flex items-center gap-1 backdrop-blur-sm`}>
            <span>{cat.icon}</span>
            {cat.label}
          </span>
        </div>

        {/* Featured Badge */}
        {featured && (
          <div className="absolute top-3 right-3 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
            ⭐ En vedette
          </div>
        )}

        {/* Gradient Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </div>

      <div className={`p-5 ${featured ? "md:p-6" : ""}`}>
        <h3 className={`${
          featured ? "text-xl md:text-2xl" : "text-lg"
        } font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition`}>
          {article.title}
        </h3>

        <p className={`text-sm text-gray-600 mb-3 ${
          featured ? "line-clamp-3" : "line-clamp-2"
        }`}>
          {article.excerpt}
        </p>

        {/* Tags (only for featured) */}
        {featured && article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {article.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Meta Info */}
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            <FaClock />
            {article.readTime} min
          </span>
          <span className="flex items-center gap-1">
            <FaEye />
            {article.views}
          </span>
        </div>

        {/* Author */}
        <div className="flex items-center gap-2 pt-3 border-t">
          <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-gray-900">
              {article.author?.name || "Auteur"}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(article.publishedAt).toLocaleDateString("fr-FR")}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ArticleCard;