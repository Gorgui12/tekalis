"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaSearch, FaFilter, FaClock, FaEye, FaTimes } from "react-icons/fa";
import api from "@/lib/api";

const Blog = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Catégories
  const categories = [
    { id: "all", label: "Tous", icon: "📚", color: "blue" },
    { id: "test", label: "Tests", icon: "🧪", color: "green" },
    { id: "guide", label: "Guides", icon: "📖", color: "purple" },
    { id: "tutorial", label: "Tutoriels", icon: "🎓", color: "orange" },
    { id: "news", label: "Actualités", icon: "📰", color: "red" },
    { id: "comparison", label: "Comparatifs", icon: "⚖️", color: "indigo" }
  ];

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const { data } = await api.get("/articles");
      setArticles(data.articles || []);
    } catch (error) {
      console.error("Erreur chargement articles:", error);
      // Données de démo si l'API n'est pas prête
      setArticles(getDemoArticles());
    } finally {
      setLoading(false);
    }
  };

  // Articles de démo
  const getDemoArticles = () => [
    {
      _id: "1",
      title: "Test exclusif - Le PC portable gaming ultime de 2025",
      slug: "test-pc-gaming-ultime-2025",
      excerpt: "Nous avons testé pendant 2 semaines le dernier né des PC gaming avec RTX 5090 et processeur Intel Core i9 14900K. Découvrez notre verdict complet.",
      category: "test",
      author: { name: "Mamadou Diop", avatar: "/avatar1.jpg" },
      image: "/blog/gaming-pc.jpg",
      readTime: 8,
      views: 1542,
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      featured: true,
      tags: ["Gaming", "PC", "Hardware"]
    },
    {
      _id: "2",
      title: "Guide complet : Choisir son ordinateur portable en 2025",
      slug: "guide-choisir-ordinateur-portable-2025",
      excerpt: "Entre ultrabook, PC gaming et workstation, comment faire le bon choix ? Notre guide vous aide à y voir clair selon vos besoins et votre budget.",
      category: "guide",
      author: { name: "Fatou Sall", avatar: "/avatar2.jpg" },
      image: "/blog/laptop-guide.jpg",
      readTime: 12,
      views: 3241,
      publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      featured: false,
      tags: ["Laptop", "Guide d'achat"]
    },
    {
      _id: "3",
      title: "Les tendances tech à suivre cette année au Sénégal",
      slug: "tendances-tech-2025-senegal",
      excerpt: "Intelligence artificielle, 5G, gaming mobile... Découvrez les technologies qui vont transformer le paysage tech sénégalais en 2025.",
      category: "news",
      author: { name: "Ousmane Dia", avatar: "/avatar3.jpg" },
      image: "/blog/tech-trends.jpg",
      readTime: 6,
      views: 892,
      publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      featured: false,
      tags: ["Tendances", "Tech", "Sénégal"]
    },
    {
      _id: "4",
      title: "Comparatif : iPhone 15 Pro vs Samsung Galaxy S24 Ultra",
      slug: "comparatif-iphone-15-samsung-s24",
      excerpt: "Quel flagship choisir en 2025 ? Nous comparons les deux géants du marché sur tous les critères : photo, performance, autonomie...",
      category: "comparison",
      author: { name: "Aissatou Ndiaye", avatar: "/avatar4.jpg" },
      image: "/blog/phone-comparison.jpg",
      readTime: 10,
      views: 2156,
      publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      featured: true,
      tags: ["Smartphones", "Comparatif"]
    },
    {
      _id: "5",
      title: "Tutoriel : Assembler son PC gaming pour la première fois",
      slug: "tutoriel-assembler-pc-gaming",
      excerpt: "Pas à pas, découvrez comment monter votre propre PC gaming. De la préparation des composants à l'installation de Windows, on vous guide !",
      category: "tutorial",
      author: { name: "Cheikh Fall", avatar: "/avatar5.jpg" },
      image: "/blog/build-pc.jpg",
      readTime: 15,
      views: 1876,
      publishedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      featured: false,
      tags: ["PC", "DIY", "Tutoriel"]
    },
    {
      _id: "6",
      title: "Test : Les meilleurs casques gaming sans fil de 2025",
      slug: "test-casques-gaming-2025",
      excerpt: "7.1 surround, batterie longue durée, confort optimal... Nous avons testé 10 casques gaming pour vous aider à choisir.",
      category: "test",
      author: { name: "Mamadou Diop", avatar: "/avatar1.jpg" },
      image: "/blog/gaming-headset.jpg",
      readTime: 9,
      views: 1234,
      publishedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      featured: false,
      tags: ["Gaming", "Audio", "Test"]
    }
  ];

  // Filtrer les articles
  const filteredArticles = articles.filter(article => {
    const matchesSearch = 
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || article.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Article en vedette (premier featured ou premier article)
  const featuredArticle = filteredArticles.find(a => a.featured) || filteredArticles[0];
  const otherArticles = filteredArticles.filter(a => a._id !== featuredArticle?._id);

  // Badge de catégorie
  const CategoryBadge = ({ category }) => {
    const cat = categories.find(c => c.id === category) || categories[0];
    const colors = {
      blue: "bg-blue-100 text-blue-700",
      green: "bg-green-100 text-green-700",
      purple: "bg-purple-100 text-purple-700",
      orange: "bg-orange-100 text-orange-700",
      red: "bg-red-100 text-red-700",
      indigo: "bg-indigo-100 text-indigo-700"
    };

    return (
      <span className={`${colors[cat.color]} px-3 py-1 rounded-full text-xs font-bold uppercase inline-flex items-center gap-1`}>
        <span>{cat.icon}</span>
        {cat.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center mt-20">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-16 mt-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">
            📝 Le Labo Tech
          </h1>
          <p className="text-xl text-gray-300 text-center max-w-2xl mx-auto">
            Tests, guides d'achat, tutoriels et actualités tech pour vous aider à faire les bons choix
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Barre de recherche et filtres */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Recherche */}
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un article..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

            {/* Bouton filtres mobile */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
            >
              <FaFilter />
              Catégories
            </button>
          </div>

          {/* Catégories - Desktop */}
          <div className="hidden md:flex flex-wrap gap-2 mt-4">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
                  selectedCategory === cat.id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>

          {/* Catégories - Mobile */}
          {showFilters && (
            <div className="md:hidden flex flex-wrap gap-2 mt-4">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setShowFilters(false);
                  }}
                  className={`px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
                    selectedCategory === cat.id
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  <span>{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Article en vedette */}
        {featuredArticle && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">📌 Article mis en avant</h2>
            <Link href={`/blog/${featuredArticle.slug}`}
              className="block bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition group"
            >
              <div className="md:flex">
                <div className="md:w-1/2 relative">
                  <div className="aspect-video md:aspect-auto md:h-full bg-gray-200">
                    {/* Image placeholder */}
                  </div>
                  <div className="absolute top-4 left-4">
                    <CategoryBadge category={featuredArticle.category} />
                  </div>
                </div>
                <div className="md:w-1/2 p-6 md:p-8">
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition">
                    {featuredArticle.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {featuredArticle.excerpt}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <FaClock />
                      {featuredArticle.readTime} min
                    </span>
                    <span className="flex items-center gap-1">
                      <FaEye />
                      {featuredArticle.views} vues
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                    <div>
                      <p className="font-semibold text-gray-900">{featuredArticle.author.name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(featuredArticle.publishedAt || 0).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Liste des articles */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {selectedCategory === "all" ? "Tous les articles" : categories.find(c => c.id === selectedCategory)?.label}
          </h2>

          {otherArticles.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Aucun article trouvé
              </h3>
              <p className="text-gray-600 mb-6">
                Essayez de modifier vos filtres ou votre recherche
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
              >
                Réinitialiser
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherArticles.map(article => (
                <Link
                  key={article._id}
                  href={`/blog/${article.slug}`}
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden group"
                >
                  <div className="relative">
                    <div className="aspect-video bg-gray-200"></div>
                    <div className="absolute top-3 left-3">
                      <CategoryBadge category={article.category} />
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition">
                      {article.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {article.excerpt}
                    </p>

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

                    <div className="flex items-center gap-2 pt-3 border-t">
                      <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-900">{article.author.name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(article.publishedAt || 0).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Newsletter CTA */}
        <div className="mt-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            📧 Restez informé !
          </h2>
          <p className="text-xl mb-6 text-purple-100">
            Recevez nos derniers articles et guides directement dans votre boîte mail
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Votre email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="bg-white text-purple-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition">
              S'abonner
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;

