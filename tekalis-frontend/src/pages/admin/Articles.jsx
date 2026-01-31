import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye,
  FaSearch,
  FaTimes,
  FaNewspaper,
  FaClock
} from "react-icons/fa";
import api from "../../api/api";

const AdminArticles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchArticles();
  }, [categoryFilter, statusFilter]);

  const fetchArticles = async () => {
    try {
      let params = [];
      if (categoryFilter !== "all") params.push(`category=${categoryFilter}`);
      if (statusFilter !== "all") params.push(`status=${statusFilter}`);
      const queryString = params.length > 0 ? `?${params.join("&")}` : "";
      
      const { data } = await api.get(`/articles${queryString}`);
      setArticles(data.articles || getDemoArticles());
    } catch (error) {
      console.error("Erreur chargement articles:", error);
      setArticles(getDemoArticles());
    } finally {
      setLoading(false);
    }
  };

  const getDemoArticles = () => [
    {
      _id: "1",
      title: "Test complet du HP Pavilion Gaming 15",
      slug: "test-hp-pavilion-gaming-15",
      excerpt: "Un laptop gaming abordable avec de belles performances",
      category: "test",
      author: { name: "Jean Dupont" },
      status: "published",
      views: 1245,
      featured: true,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      _id: "2",
      title: "Comment choisir son PC portable en 2025",
      slug: "guide-choisir-pc-portable-2025",
      excerpt: "Guide complet pour faire le bon choix selon vos besoins",
      category: "guide",
      author: { name: "Marie Martin" },
      status: "published",
      views: 2567,
      featured: false,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    },
    {
      _id: "3",
      title: "Les nouveautés gaming 2025",
      slug: "nouveautes-gaming-2025",
      excerpt: "Découvrez les dernières sorties dans le monde du gaming",
      category: "news",
      author: { name: "Jean Dupont" },
      status: "draft",
      views: 0,
      featured: false,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    }
  ];

  // Filtrer les articles
  const filteredArticles = articles.filter(article => {
    const matchesSearch = 
      article.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.author?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Stats
  const stats = {
    total: articles.length,
    published: articles.filter(a => a.status === "published").length,
    draft: articles.filter(a => a.status === "draft").length,
    featured: articles.filter(a => a.featured).length
  };

  // Supprimer un article
  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) return;
    
    try {
      await api.delete(`/admin/articles/${id}`);
      alert("Article supprimé");
      fetchArticles();
    } catch (error) {
      alert("Erreur lors de la suppression");
    }
  };

  // Badge de catégorie
  const CategoryBadge = ({ category }) => {
    const categories = {
      test: { label: "Test", color: "blue" },
      guide: { label: "Guide", color: "green" },
      tutorial: { label: "Tutoriel", color: "purple" },
      news: { label: "Actualités", color: "red" },
      comparison: { label: "Comparatif", color: "orange" }
    };
    const config = categories[category] || categories.news;

    return (
      <span className={`bg-${config.color}-100 text-${config.color}-700 px-3 py-1 rounded-full text-xs font-semibold`}>
        {config.label}
      </span>
    );
  };

  // Badge de statut
  const StatusBadge = ({ status }) => {
    const configs = {
      published: { bg: "bg-green-100", text: "text-green-700", label: "Publié" },
      draft: { bg: "bg-gray-100", text: "text-gray-700", label: "Brouillon" },
      scheduled: { bg: "bg-blue-100", text: "text-blue-700", label: "Programmé" }
    };
    const config = configs[status] || configs.draft;

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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                📰 Gestion des articles
              </h1>
              <p className="text-gray-600">
                {filteredArticles.length} article(s) • {stats.published} publié(s)
              </p>
            </div>

            <Link
              to="/admin/articles/add"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 shadow-md"
            >
              <FaPlus /> Nouvel article
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-600">Total</p>
          </div>
          <div className="bg-green-50 rounded-lg shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-green-700">{stats.published}</p>
            <p className="text-xs text-gray-600">Publiés</p>
          </div>
          <div className="bg-gray-50 rounded-lg shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-gray-700">{stats.draft}</p>
            <p className="text-xs text-gray-600">Brouillons</p>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-yellow-700">{stats.featured}</p>
            <p className="text-xs text-gray-600">En vedette</p>
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
                placeholder="Rechercher un article..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Toutes les catégories</option>
              <option value="test">Tests</option>
              <option value="guide">Guides</option>
              <option value="tutorial">Tutoriels</option>
              <option value="news">Actualités</option>
              <option value="comparison">Comparatifs</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="published">Publiés</option>
              <option value="draft">Brouillons</option>
              <option value="scheduled">Programmés</option>
            </select>
          </div>
        </div>

        {/* Articles Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Article</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Catégorie</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Auteur</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Statut</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Vues</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredArticles.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12">
                      <FaNewspaper className="text-6xl text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 mb-4">Aucun article trouvé</p>
                      <Link
                        to="/admin/articles/add"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold inline-block"
                      >
                        Créer le premier article
                      </Link>
                    </td>
                  </tr>
                ) : (
                  filteredArticles.map((article) => (
                    <tr key={article._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                              {article.title}
                              {article.featured && (
                                <span className="text-yellow-500" title="En vedette">⭐</span>
                              )}
                            </h3>
                            <p className="text-xs text-gray-600 line-clamp-1">
                              {article.excerpt}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <CategoryBadge category={article.category} />
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-gray-700">
                          {article.author?.name}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={article.status} />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-sm text-gray-700">
                          <FaEye className="text-gray-400" />
                          <span>{article.views?.toLocaleString() || 0}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-gray-600">
                          {new Date(article.createdAt).toLocaleDateString("fr-FR")}
                        </p>
                        {article.publishedAt && (
                          <p className="text-xs text-gray-500">
                            Publié le {new Date(article.publishedAt).toLocaleDateString("fr-FR")}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            to={`/blog/${article.slug}`}
                            target="_blank"
                            className="text-gray-600 hover:text-gray-800 p-2"
                            title="Voir"
                          >
                            <FaEye />
                          </Link>
                          <Link
                            to={`/admin/articles/edit/${article._id}`}
                            className="text-blue-600 hover:text-blue-700 p-2"
                            title="Modifier"
                          >
                            <FaEdit />
                          </Link>
                          <button
                            onClick={() => handleDelete(article._id)}
                            className="text-red-600 hover:text-red-700 p-2"
                            title="Supprimer"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminArticles;