import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  FaClock, 
  FaEye, 
  FaShare, 
  FaFacebook, 
  FaTwitter, 
  FaLinkedin,
  FaWhatsapp,
  FaArrowLeft,
  FaTag
} from "react-icons/fa";
import api from "../../../../packages/shared/api/api";

const ArticleDetails = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    fetchArticle();
    window.scrollTo(0, 0);
  }, [slug]);

  const fetchArticle = async () => {
    try {
      const { data } = await api.get(`/articles/${slug}`);
      setArticle(data.article);
      setRelatedArticles(data.relatedArticles || []);
      setRelatedProducts(data.relatedProducts || []);
    } catch (error) {
      console.error("Erreur chargement article:", error);
      // Article de démo
      setArticle(getDemoArticle());
      setRelatedArticles(getDemoRelatedArticles());
    } finally {
      setLoading(false);
    }
  };

  const getDemoArticle = () => ({
    _id: "1",
    title: "Test exclusif - Le PC portable gaming ultime de 2025",
    slug: "test-pc-gaming-ultime-2025",
    excerpt: "Nous avons testé pendant 2 semaines le dernier né des PC gaming avec RTX 5090.",
    content: `
      <h2>Introduction</h2>
      <p>Dans un marché ultra-compétitif, les constructeurs rivalisent d'ingéniosité pour proposer THE machine ultime. Aujourd'hui, nous testons un monstre de puissance qui promet de révolutionner le gaming portable.</p>
      
      <h2>Design et construction</h2>
      <p>Premier contact avec la machine : l'emballage premium annonce la couleur. Le châssis en aluminium brossé respire la qualité, avec un poids de 2.3kg qui reste raisonnable pour un 15 pouces gaming.</p>
      
      <p>Les finitions sont impeccables, sans aucun jeu dans l'assemblage. Le clavier RGB personnalisable offre une frappe agréable avec 1.8mm de course. Le trackpad, large et précis, supporte tous les gestes multitouch.</p>
      
      <h2>Performances</h2>
      <p>C'est là que les choses deviennent intéressantes. Le processeur Intel Core i9 14900K couplé à la RTX 5090 Mobile pulvérise tous les benchmarks que nous lui avons soumis :</p>
      
      <ul>
        <li><strong>Cyberpunk 2077 (Ultra, Ray Tracing):</strong> 110 FPS moyens en 1440p</li>
        <li><strong>Baldur's Gate 3:</strong> 165 FPS constants en ultra</li>
        <li><strong>Red Dead Redemption 2:</strong> 98 FPS en paramètres maximums</li>
      </ul>
      
      <p>En production vidéo (Premiere Pro, DaVinci Resolve), le rendu 4K est fluide et les exports sont jusqu'à 40% plus rapides qu'avec la génération précédente.</p>
      
      <h2>Écran</h2>
      <p>L'écran IPS 15.6" en QHD (2560x1440) avec 240Hz est une pure merveille. La colorimétrie est excellente (100% sRGB, 95% DCI-P3) et la luminosité de 500 nits permet de jouer même en extérieur.</p>
      
      <h2>Autonomie</h2>
      <p>Le talon d'Achille des PC gaming ? Pas vraiment ici. La batterie 99Wh tient 6h en usage bureautique et 2h30 en gaming intense. Le mode "silence" permet de gagner encore 30% d'autonomie.</p>
      
      <h2>Système de refroidissement</h2>
      <p>Le système "Vapor Chamber" à 5 caloducs et double ventilateur maintient les températures sous contrôle. En charge maximale, le CPU reste à 78°C et le GPU à 82°C, des valeurs excellentes.</p>
      
      <h2>Verdict</h2>
      <p>Avec un tarif de 2 499 000 FCFA, ce PC gaming n'est pas donné. Mais pour ce prix, vous obtenez LA machine ultime capable de tout faire : gaming 1440p ultra fluide, montage vidéo 4K, développement... Un investissement durable pour 4-5 ans minimum.</p>
      
      <h3>Points forts</h3>
      <ul>
        <li>Performances exceptionnelles</li>
        <li>Écran 240Hz sublime</li>
        <li>Refroidissement efficace</li>
        <li>Qualité de construction</li>
        <li>Autonomie correcte pour un gaming laptop</li>
      </ul>
      
      <h3>Points faibles</h3>
      <ul>
        <li>Prix élevé</li>
        <li>Poids conséquent (2.3kg)</li>
        <li>Chauffe en charge (normale pour la puissance)</li>
        <li>Webcam 720p (aurait pu être 1080p)</li>
      </ul>
      
      <div class="rating-box">
        <h3>Note finale: 9/10</h3>
        <p>Un PC gaming d'exception qui justifie pleinement son prix premium. Recommandé sans hésitation pour les gamers exigeants et créateurs de contenu.</p>
      </div>
    `,
    category: "test",
    author: { 
      name: "Mamadou Diop", 
      avatar: "/avatar1.jpg",
      bio: "Expert hardware et passionné de gaming depuis 15 ans"
    },
    image: "/blog/gaming-pc.jpg",
    readTime: 8,
    views: 1542,
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    tags: ["Gaming", "PC", "Hardware", "Test"],
    relatedProductIds: ["prod1", "prod2", "prod3"]
  });

  const getDemoRelatedArticles = () => [
    {
      _id: "2",
      title: "Guide : Choisir sa carte graphique en 2025",
      slug: "guide-carte-graphique-2025",
      image: "/blog/gpu-guide.jpg",
      category: "guide",
      readTime: 10
    },
    {
      _id: "3",
      title: "Les meilleurs PC gaming à moins de 1 million FCFA",
      slug: "meilleurs-pc-gaming-budget",
      image: "/blog/budget-gaming.jpg",
      category: "guide",
      readTime: 7
    },
    {
      _id: "4",
      title: "RTX 5090 vs RTX 4090 : faut-il upgrader ?",
      slug: "rtx-5090-vs-4090",
      image: "/blog/gpu-comparison.jpg",
      category: "comparison",
      readTime: 6
    }
  ];

  // Partage social
  const shareArticle = (platform) => {
    const url = window.location.href;
    const text = article.title;

    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      whatsapp: `https://wa.me/?text=${text} ${url}`
    };

    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
  };

  // Badge de catégorie
  const categories = {
    test: { label: "Test", icon: "🧪", color: "bg-green-100 text-green-700" },
    guide: { label: "Guide", icon: "📖", color: "bg-purple-100 text-purple-700" },
    tutorial: { label: "Tutoriel", icon: "🎓", color: "bg-orange-100 text-orange-700" },
    news: { label: "Actualité", icon: "📰", color: "bg-red-100 text-red-700" },
    comparison: { label: "Comparatif", icon: "⚖️", color: "bg-indigo-100 text-indigo-700" }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center mt-20">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center mt-20">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Article introuvable</p>
          <Link to="/blog" className="text-blue-600 hover:text-blue-700 font-semibold">
            ← Retour au blog
          </Link>
        </div>
      </div>
    );
  }

  const cat = categories[article.category] || categories.test;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Image */}
      <div className="relative h-96 bg-gray-900 mt-20">
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="container mx-auto">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition"
            >
              <FaArrowLeft />
              Retour au blog
            </Link>
            <span className={`${cat.color} px-3 py-1 rounded-full text-xs font-bold uppercase inline-flex items-center gap-1`}>
              <span>{cat.icon}</span>
              {cat.label}
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-32 relative z-10 pb-12">
        <div className="max-w-4xl mx-auto">
          {/* Article Card */}
          <article className="bg-white rounded-lg shadow-xl overflow-hidden mb-8">
            {/* Header */}
            <div className="p-8 md:p-12">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                {article.title}
              </h1>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 mb-6 pb-6 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                  <div>
                    <p className="font-semibold text-gray-900">{article.author.name}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(article.publishedAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600 ml-auto">
                  <span className="flex items-center gap-1">
                    <FaClock />
                    {article.readTime} min
                  </span>
                  <span className="flex items-center gap-1">
                    <FaEye />
                    {article.views} vues
                  </span>
                </div>
              </div>

              {/* Share */}
              <div className="flex items-center gap-3 mb-8">
                <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <FaShare />
                  Partager :
                </span>
                <button
                  onClick={() => shareArticle('facebook')}
                  className="w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition"
                >
                  <FaFacebook />
                </button>
                <button
                  onClick={() => shareArticle('twitter')}
                  className="w-10 h-10 bg-sky-500 hover:bg-sky-600 text-white rounded-full flex items-center justify-center transition"
                >
                  <FaTwitter />
                </button>
                <button
                  onClick={() => shareArticle('linkedin')}
                  className="w-10 h-10 bg-blue-700 hover:bg-blue-800 text-white rounded-full flex items-center justify-center transition"
                >
                  <FaLinkedin />
                </button>
                <button
                  onClick={() => shareArticle('whatsapp')}
                  className="w-10 h-10 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition"
                >
                  <FaWhatsapp />
                </button>
              </div>

              {/* Content */}
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="mt-8 pt-8 border-t">
                  <div className="flex items-center gap-2 flex-wrap">
                    <FaTag className="text-gray-500" />
                    {article.tags.map((tag, index) => (
                      <Link
                        key={index}
                        to={`/blog?tag=${tag}`}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-medium transition"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Author Bio */}
              <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                <div className="flex gap-4">
                  <div className="w-16 h-16 bg-gray-300 rounded-full flex-shrink-0"></div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">À propos de {article.author.name}</h3>
                    <p className="text-sm text-gray-600">{article.author.bio}</p>
                  </div>
                </div>
              </div>
            </div>
          </article>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                🛒 Produits mentionnés
              </h2>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {/* Placeholder pour produits reliés */}
                <div className="text-center text-gray-500 col-span-full">
                  Les produits mentionnés dans l'article apparaîtront ici
                </div>
              </div>
            </div>
          )}

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                📚 Articles similaires
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedArticles.map(related => (
                  <Link
                    key={related._id}
                    to={`/blog/${related.slug}`}
                    className="group"
                  >
                    <div className="aspect-video bg-gray-200 rounded-lg mb-3"></div>
                    <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition line-clamp-2 mb-2">
                      {related.title}
                    </h3>
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <FaClock size={12} />
                      {related.readTime} min de lecture
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom styles pour le contenu de l'article */}
      <style>{`
        .prose h2 {
          font-size: 1.875rem;
          font-weight: bold;
          margin-top: 2rem;
          margin-bottom: 1rem;
          color: #1f2937;
        }
        .prose h3 {
          font-size: 1.5rem;
          font-weight: bold;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          color: #374151;
        }
        .prose p {
          margin-bottom: 1rem;
          line-height: 1.75;
          color: #4b5563;
        }
        .prose ul {
          list-style: disc;
          margin-left: 1.5rem;
          margin-bottom: 1rem;
        }
        .prose li {
          margin-bottom: 0.5rem;
          color: #4b5563;
        }
        .prose strong {
          font-weight: 600;
          color: #1f2937;
        }
        .prose .rating-box {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 2rem;
          border-radius: 0.5rem;
          margin-top: 2rem;
        }
        .prose .rating-box h3 {
          color: white;
          margin: 0 0 0.5rem 0;
        }
        .prose .rating-box p {
          color: rgba(255, 255, 255, 0.9);
          margin: 0;
        }
      `}</style>
    </div>
  );
};

export default ArticleDetails;