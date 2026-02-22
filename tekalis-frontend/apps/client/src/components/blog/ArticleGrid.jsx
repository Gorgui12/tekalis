import ArticleCard from "./ArticleCard";

const ArticleGrid = ({ 
  articles, 
  layout = "grid", 
  columns = 3, 
  showFeatured = true,
  emptyMessage = "Aucun article trouvé"
}) => {
  if (!articles || articles.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {emptyMessage}
        </h3>
        <p className="text-gray-600">
          Revenez plus tard pour découvrir nos nouveaux articles
        </p>
      </div>
    );
  }

  // Article en vedette (si activé)
  const featuredArticle = showFeatured 
    ? articles.find(a => a.featured) || articles[0]
    : null;

  const regularArticles = featuredArticle
    ? articles.filter(a => a._id !== featuredArticle._id)
    : articles;

  // Layout: list (horizontal cards)
  if (layout === "list") {
    return (
      <div className="space-y-6">
        {articles.map(article => (
          <ArticleCard 
            key={article._id} 
            article={article} 
            variant="horizontal"
          />
        ))}
      </div>
    );
  }

  // Layout: compact (small cards in list)
  if (layout === "compact") {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 space-y-2">
        {articles.map(article => (
          <ArticleCard 
            key={article._id} 
            article={article} 
            variant="compact"
          />
        ))}
      </div>
    );
  }

  // Layout: masonry (avec featured en grand)
  if (layout === "masonry" && showFeatured && featuredArticle) {
    return (
      <div>
        {/* Featured Article (full width) */}
        <div className="mb-6">
          <ArticleCard 
            article={featuredArticle} 
            featured={true}
          />
        </div>

        {/* Regular Articles Grid */}
        {regularArticles.length > 0 && (
          <div className={`grid md:grid-cols-2 lg:grid-cols-${Math.min(columns, 3)} gap-6`}>
            {regularArticles.map(article => (
              <ArticleCard 
                key={article._id} 
                article={article}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Layout: grid (default)
  const getGridCols = () => {
    if (columns === 2) return "md:grid-cols-2";
    if (columns === 3) return "md:grid-cols-2 lg:grid-cols-3";
    if (columns === 4) return "md:grid-cols-2 lg:grid-cols-4";
    return "md:grid-cols-2 lg:grid-cols-3";
  };

  return (
    <div className={`grid grid-cols-1 ${getGridCols()} gap-6`}>
      {articles.map(article => (
        <ArticleCard 
          key={article._id} 
          article={article}
          featured={showFeatured && article.featured}
        />
      ))}
    </div>
  );
};

export default ArticleGrid;