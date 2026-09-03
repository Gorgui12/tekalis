"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
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
import api from "@/lib/api";
import PageMeta from "@/components/seo/PageMeta";
import { sanitizeArticleHtml } from "@/lib/sanitizeHtml";

const ArticleDetails = ({ article: initialArticle, related: initialRelated }) => {
  const { slug } = useParams();

  // Priorité absolue aux données SSR : l'article complet (HTML inclus)
  // est déjà fourni par la page serveur. On ne refetche côté client que
  // s'il n'y a aucune donnée SSR (nav. directe sans rendu serveur).
  const hasInitialData = !!(initialArticle && initialArticle.title);

  const [article, setArticle] = useState(
    hasInitialData ? initialArticle : null
  );
  const [relatedArticles, setRelatedArticles] = useState(
    hasInitialData && Array.isArray(initialRelated) ? initialRelated : []
  );
  const [loading, setLoading] = useState(!hasInitialData);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    if (hasInitialData) {
      window.scrollTo(0, 0);
      return;
    }
    fetchArticle();
    window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const fetchArticle = async () => {
    try {
      const { data } = await api.get(`/articles/${slug}`);
      setArticle(data.article);
      setRelatedArticles(data.relatedArticles || []);
      setRelatedProducts(data.relatedProducts || []);
    } catch (error) {
      console.error("Erreur chargement article:", error);
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
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-brand-500"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center mt-20">
        <div className="text-center">
          <p className="text-xl text-surface-700 dark:text-surface-300 mb-4">Article introuvable</p>
          <Link href="/blog" className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-500 font-semibold">
            ← Retour au blog
          </Link>
        </div>
      </div>
    );
  }

  const cat = categories[article.category] || categories.test;
  const authorName = article.author?.name || "Équipe Tekalis";
  const authorBio = article.author?.bio || "";
  const authorAvatar = article.author?.avatar;

  return (
    <div className="min-h-screen bg-surface-50">
      <PageMeta
        title={`${article.title} | Blog Tekalis`}
        description={article.excerpt || article.title}
        image={article.image ? `https://tekalis.com${article.image}` : undefined}
        keywords={[
          ...(article.tags || []),
          'blog tech Sénégal',
          'guide achat Dakar',
          'tekalis blog',
        ]}
        type="article"
        canonical={`https://tekalis.com/blog/${article.slug}`}
        breadcrumbs={[
          { name: 'Blog', url: '/blog' },
          { name: article.title, url: `/blog/${article.slug}` },
        ]}
        articleData={{
          publishedAt: article.publishedAt,
          modifiedAt: article.updatedAt,
          author: authorName,
        }}
      />

      {/* Hero Image */}
      <div className="relative h-[32rem] bg-surface-900 mt-20">
        {article.image && (
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover opacity-80"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-900 via-surface-900/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
          <div className="container mx-auto max-w-4xl">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-6 transition text-sm font-medium"
            >
              <FaArrowLeft size={14} />
              Retour au blog
            </Link>
            <span className={`${cat.color} px-3 py-1 rounded-full text-xs font-bold uppercase inline-flex items-center gap-1 mb-4`}>
              <span>{cat.icon}</span>
              {cat.label}
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mt-4 leading-tight max-w-3xl font-display">
              {article.title}
            </h1>
            {article.excerpt && (
              <p className="text-lg text-white/70 mt-4 max-w-2xl leading-relaxed">
                {article.excerpt}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 -mt-16 relative z-10 pb-16">
        <div className="max-w-3xl mx-auto">
          <article className="bg-white dark:bg-surface-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-8 md:p-12">
              {/* Meta bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-surface-100">
                <div className="flex items-center gap-3">
                  {authorAvatar ? (
                    <img src={authorAvatar} alt={authorName} className="w-11 h-11 rounded-full object-cover ring-2 ring-white shadow" />
                  ) : (
                    <div className="w-11 h-11 bg-gradient-to-br from-brand-500 to-orange-700 rounded-full flex items-center justify-center text-white font-bold text-sm shadow">
                      {authorName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-surface-900 dark:text-white text-sm">{authorName}</p>
                    <p className="text-xs text-surface-500 dark:text-surface-400">
                      {new Date(article.publishedAt || 0).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-surface-500 dark:text-surface-400">
                  <span className="flex items-center gap-1.5">
                    <FaClock size={13} />
                    {article.readTime} min
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FaEye size={13} />
                    {article.views?.toLocaleString() ?? 0} vues
                  </span>
                </div>
              </div>

              {/* Prose content */}
              <div
                className="prose max-w-none
                  prose-headings:font-bold prose-headings:text-surface-900 dark:prose-headings:text-white
                  prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:border-b prose-h2:border-surface-100 prose-h2:pb-3
                  prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                  prose-p:text-surface-700 dark:prose-p:text-surface-300 prose-p:leading-relaxed prose-p:text-base
                  prose-ul:my-5 prose-li:text-surface-700 dark:prose-li:text-surface-300 prose-li:leading-relaxed
                  prose-strong:text-surface-900 dark:prose-strong:text-white prose-strong:font-semibold
                  prose-a:text-brand-600 dark:prose-a:text-brand-400 prose-a:no-underline hover:prose-a:underline"
                dangerouslySetInnerHTML={{ __html: sanitizeArticleHtml(article.content) }}
              />

              {/* Tags */}
              {article.tags?.length > 0 && (
                <div className="mt-10 pt-6 border-t border-surface-100">
                  <div className="flex items-center gap-2 flex-wrap">
                    <FaTag className="text-surface-400 dark:text-surface-500" size={13} />
                    {article.tags.map((tag, index) => (
                      <Link
                        key={index}
                        href={`/blog?tag=${tag}`}
                        className="bg-surface-100 hover:bg-brand-50 hover:text-brand-600 text-surface-700 dark:text-surface-300 px-3 py-1 rounded-full text-xs font-medium transition"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Share */}
              <div className="mt-8 pt-6 border-t border-surface-100">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-surface-500 dark:text-surface-400 flex items-center gap-2">
                    <FaShare size={13} />
                    Partager
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => shareArticle('facebook')} className="w-9 h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition text-sm">
                      <FaFacebook size={14} />
                    </button>
                    <button onClick={() => shareArticle('twitter')} className="w-9 h-9 bg-sky-500 hover:bg-sky-600 text-white rounded-full flex items-center justify-center transition text-sm">
                      <FaTwitter size={14} />
                    </button>
                    <button onClick={() => shareArticle('linkedin')} className="w-9 h-9 bg-blue-700 hover:bg-blue-800 text-white rounded-full flex items-center justify-center transition text-sm">
                      <FaLinkedin size={14} />
                    </button>
                    <button onClick={() => shareArticle('whatsapp')} className="w-9 h-9 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition text-sm">
                      <FaWhatsapp size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Author Bio */}
              <div className="mt-8 p-5 bg-surface-50 dark:bg-surface-700/50 rounded-xl">
                <div className="flex gap-4">
                  {authorAvatar ? (
                    <img src={authorAvatar} alt={authorName} className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-14 h-14 bg-gradient-to-br from-brand-500 to-orange-700 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {authorName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-surface-900 dark:text-white text-sm mb-1">À propos de {authorName}</h3>
                    <p className="text-sm text-surface-500 dark:text-surface-400 leading-relaxed">{authorBio}</p>
                  </div>
                </div>
              </div>
            </div>
          </article>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-lg p-6 md:p-8 mt-8">
              <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-6">Produits mentionnés</h2>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center text-surface-400 dark:text-surface-500 col-span-full text-sm py-6">
                  Les produits mentionnés dans l&apos;article apparaîtront ici
                </div>
              </div>
            </div>
          )}

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-lg p-6 md:p-8 mt-8">
              <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-6">Articles similaires</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedArticles.map(related => (
                  <Link key={related._id} href={`/blog/${related.slug}`} className="group">
                    <div className="aspect-video bg-surface-200 rounded-xl mb-3 overflow-hidden">
                      {related.image && (
                        <img src={related.image} alt={related.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                      )}
                    </div>
                    <h3 className="font-bold text-surface-900 dark:text-white group-hover:text-brand-600 transition line-clamp-2 mb-2 text-sm">
                      {related.title}
                    </h3>
                    <p className="text-xs text-surface-500 dark:text-surface-400 flex items-center gap-1.5">
                      <FaClock size={11} />
                      {related.readTime} min de lecture
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .prose .rating-box {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 1.5rem 2rem;
          border-radius: 0.75rem;
          margin-top: 2rem;
        }
        .prose .rating-box h3 { color: white; margin: 0 0 0.5rem 0; font-size: 1.25rem; }
        .prose .rating-box p { color: rgba(255,255,255,0.9); margin: 0; }
      `}</style>
    </div>
  );
};

export default ArticleDetails;
