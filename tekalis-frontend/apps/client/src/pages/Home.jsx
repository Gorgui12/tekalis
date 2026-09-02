import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../../../../packages/shared/redux/slices/productSlice";
import PageMeta from '../components/seo/PageMeta';
import DynamicHero from '../components/DynamicHero';
import { 
  FaTruck, 
  FaShieldAlt, 
  FaHeadset,
  FaCreditCard,
  FaStar,
  FaArrowRight,
  FaTag,
  FaBolt,
  FaLaptop,
  FaMobileAlt,
  FaGamepad,
  FaCamera,
  FaDesktop,
  FaKeyboard
} from "react-icons/fa";
import api from "../../../../packages/shared/api/api";
import ProductCard from "../../src/components/product/ProductCard";

// ── Schema.org défini EN DEHORS du composant (évite recréation à chaque render) ──
const HOME_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Store',
  name: 'Tekalis',
  description: 'Boutique électronique en ligne au Sénégal — Livraison rapide à Dakar',
  url: 'https://tekalis.com',
  logo: 'https://tekalis.com/logo.png',
  image: 'https://tekalis.com/og-image.png',
  telephone: '+221786346946',
  email: 'contact@tekalis.com',
  priceRange: '$$',
  currenciesAccepted: 'XOF',
  paymentAccepted: 'Cash, Mobile Money, Wave, Orange Money',
  openingHours: 'Mo-Fr 08:00-19:00 Sa 09:00-17:00',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Dakar',
    addressRegion: 'Dakar',
    addressCountry: 'SN',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: '14.6928',
    longitude: '-17.4467',
  },
  areaServed: {
    '@type': 'Country',
    name: 'Sénégal',
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Produits Électroniques',
    itemListElement: [
      { '@type': 'OfferCatalog', name: 'Smartphones' },
      { '@type': 'OfferCatalog', name: 'Laptops & PC' },
      { '@type': 'OfferCatalog', name: 'TV & Home Cinéma' },
      { '@type': 'OfferCatalog', name: 'Électroménager' },
      { '@type': 'OfferCatalog', name: 'Gaming' },
      { '@type': 'OfferCatalog', name: 'Climatisation & Énergie Solaire' },
    ],
  },
  sameAs: [
    'https://www.facebook.com/share/14MikMhjFhA/',
    'https://www.instagram.com/_tekalis_',
    'https://twitter.com/tekalis',
  ],
};

/* Rail de produits — défilement horizontal fluide (mobile + desktop) */
const ProductRail = ({ products }) => {
  if (!products?.length) return null;
  return (
    <div className="flex gap-3 sm:gap-4 md:gap-5 overflow-x-auto px-4 sm:px-6 lg:px-0 pb-4 scrollbar-hide snap-x snap-mandatory touch-pan-x -mx-4 sm:-mx-6 lg:mx-0">
      {products.map((product) => (
        <div
          key={product._id}
          className="shrink-0 w-[150px] sm:w-[190px] md:w-[220px] snap-start"
        >
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
};

const Home = () => {
  const dispatch = useDispatch();
  const { items: products, isLoading } = useSelector((state) => state.products);

  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
   
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const { data } = await api.get("/articles");
        setArticles(data.articles || []);
      } catch (error) {
        console.error("Erreur chargement articles :", error);
        setArticles([
          {
            _id: "1",
            title: "Test exclusif - Le PC portable gaming ultime de 2025",
            slug: "test-pc-gaming-ultime-2025",
            excerpt: "Nous avons testé pendant 2 semaines le dernier né des PC gaming...",
            category: "test",
            publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            readTime: 5
          },
          {
            _id: "2",
            title: "Guide complet : Choisir son ordinateur portable en 2025",
            slug: "guide-choisir-ordinateur-portable-2025",
            excerpt: "Entre ultrabook, PC gaming et workstation, comment faire le bon choix...",
            category: "guide",
            publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            readTime: 8
          },
          {
            _id: "3",
            title: "Les tendances tech à suivre cette année",
            slug: "tendances-tech-2025",
            excerpt: "IA, gaming, télétravail : découvrez les technologies qui vont marquer 2025...",
            category: "news",
            publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            readTime: 6
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  useEffect(() => {
    if (products.length > 0) {
      const featured = products.filter(p => p.isFeatured).slice(0, 8);
      setFeaturedProducts(featured.length > 0 ? featured : products.slice(0, 8));
      
      const sorted = [...products].sort((a, b) => 
        (b.salesCount || 0) - (a.salesCount || 0) || 
        (b.rating?.average || 0) - (a.rating?.average || 0)
      );
      setBestSellers(sorted.slice(0, 8));
    }
  }, [products]);

  const categories = [
    { name: "Smartphones", icon: <FaMobileAlt />, slug: "smartphones", color: "from-blue-500 to-cyan-500" },
    { name: "Gaming", icon: <FaGamepad />, slug: "gaming", color: "from-purple-500 to-pink-500" },
    { name: "Home Cinema", icon: <FaDesktop />, slug: "home-cinema", color: "from-red-500 to-orange-500" },
    { name: "Caméras", icon: <FaCamera />, slug: "cameras", color: "from-green-500 to-teal-500" },
    { name: "Laptops", icon: <FaLaptop />, slug: "ordinateurs", color: "from-indigo-500 to-purple-500" },
    { name: "Accessoires", icon: <FaKeyboard />, slug: "accessoires", color: "from-yellow-500 to-orange-500" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── SEO HEAD ────────────────────────────────────────────────────────── */}
      <PageMeta
        title="Tekalis — Boutique Électronique Dakar | Livraison Rapide Sénégal"
        description="Achetez smartphones, laptops, TV et électroménager en ligne au Sénégal. Livraison rapide à Dakar. Garantie constructeur. Paiement Wave, Orange Money."
        keywords={['boutique électronique Dakar', 'livraison rapide Sénégal', 'smartphone Dakar', 'laptop Sénégal', 'tekalis']}
        canonical="https://tekalis.com/"
        schema={HOME_SCHEMA}
      />

      {/* Hero Section - Carousel */}

      <DynamicHero isHomePage={true} />

      {/* Quick Actions */}
      <section className="container mx-auto px-4 -mt-16 relative z-10 mb-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <Link to="/products" className="bg-white rounded-xl shadow-card p-5 sm:p-6 hover:shadow-lift hover:-translate-y-0.5 transition group">
            <div className="flex items-center gap-4">
              <div className="bg-brand-50 rounded-2xl p-3.5 group-hover:bg-brand-100 transition">
                <FaLaptop className="text-brand-600 text-2xl" />
              </div>
              <div>
                <h3 className="font-display font-bold text-gray-900 text-base sm:text-lg">Tous les produits</h3>
                <p className="text-sm text-gray-600">Explorez notre catalogue</p>
              </div>
            </div>
          </Link>

          <Link to="/blog" className="bg-white rounded-xl shadow-card p-5 sm:p-6 hover:shadow-lift hover:-translate-y-0.5 transition group">
            <div className="flex items-center gap-4">
              <div className="bg-accent-50 rounded-2xl p-3.5 group-hover:bg-accent-100 transition">
                <FaStar className="text-accent-600 text-2xl" />
              </div>
              <div>
                <h3 className="font-display font-bold text-gray-900 text-base sm:text-lg">Labo Tech</h3>
                <p className="text-sm text-gray-600">Tests & guides d'achat</p>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Catégories */}
      <section className="container mx-auto px-4 mb-16">
        <div className="text-center mb-8">
          <span className="section-eyebrow justify-center"><FaTag size={11} /> Nos univers</span>
          <h2 className="section-title mt-2">Parcourir par catégorie</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((category) => (
            <Link key={category.slug} to={`/category/${category.slug}`} className="group">
              <div className={`bg-gradient-to-br ${category.color} rounded-xl shadow-md hover:shadow-lift transition-all duration-300 p-6 sm:p-8 text-center text-white aspect-square flex flex-col items-center justify-center group-hover:scale-[1.03]`}>
                <div className="text-4xl sm:text-5xl mb-3 group-hover:scale-110 transition-transform">
                  {category.icon}
                </div>
                <h3 className="font-bold text-sm sm:text-lg">{category.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Nouveautés — rail défilant sur mobile, grille sur desktop */}
      <section className="container mx-auto mb-16">
        <div className="container-tk flex items-end justify-between mb-6">
          <div>
            <span className="section-eyebrow"><FaBolt size={11} /> Fraîchement arrivé</span>
            <h2 className="section-title mt-1.5">Nouveautés</h2>
          </div>
          <Link to="/products?sort=newest" className="hidden sm:inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 font-semibold text-sm">
            Voir tout <FaArrowRight />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide snap-x snap-mandatory">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="shrink-0 w-[46%] sm:w-[30%] lg:w-[20%] bg-white rounded-2xl border border-gray-100 p-4 animate-pulse snap-start">
                <div className="bg-gray-200 aspect-square rounded-xl mb-4"></div>
                <div className="bg-gray-200 h-3.5 rounded mb-2"></div>
                <div className="bg-gray-200 h-3.5 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <ProductRail products={featuredProducts} />
        )}
      </section>

      {/* Best-sellers */}
      <section className="bg-gradient-to-br from-brand-50 to-accent-50 dark:from-gray-800 dark:to-gray-900 py-14 sm:py-16">
        <div className="container-tk">
          <div className="flex items-end justify-between mb-6">
            <div>
              <span className="section-eyebrow">⚡ Populaires</span>
              <h2 className="section-title mt-1.5">Meilleures ventes</h2>
            </div>
            <Link to="/products?sort=popular" className="hidden sm:inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 font-semibold text-sm">
              Voir tout <FaArrowRight />
            </Link>
          </div>
          <ProductRail products={bestSellers} />
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-14 sm:py-16">
        <div className="text-center mb-10">
          <span className="section-eyebrow justify-center"><FaShieldAlt size={11} /> Pourquoi nous choisir</span>
          <h2 className="section-title mt-2">Une expérience d'achat sereine</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <div className="text-center">
            <div className="bg-brand-50 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4">
              <FaTruck className="text-brand-600 text-2xl sm:text-3xl" />
            </div>
            <h3 className="font-display font-bold text-gray-900 mb-1.5">Livraison rapide</h3>
            <p className="text-xs sm:text-sm text-gray-600">Livraison gratuite à Dakar sous 2-3 jours</p>
          </div>
          <div className="text-center">
            <div className="bg-green-50 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4">
              <FaShieldAlt className="text-green-600 text-2xl sm:text-3xl" />
            </div>
            <h3 className="font-display font-bold text-gray-900 mb-1.5">Garantie constructeur</h3>
            <p className="text-xs sm:text-sm text-gray-600">Tous nos produits sont garantis 12 mois minimum</p>
          </div>
          <div className="text-center">
            <div className="bg-accent-50 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4">
              <FaHeadset className="text-accent-600 text-2xl sm:text-3xl" />
            </div>
            <h3 className="font-display font-bold text-gray-900 mb-1.5">Support 24/7</h3>
            <p className="text-xs sm:text-sm text-gray-600">Notre équipe est disponible pour vous aider</p>
          </div>
          <div className="text-center">
            <div className="bg-orange-50 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4">
              <FaCreditCard className="text-orange-600 text-2xl sm:text-3xl" />
            </div>
            <h3 className="font-display font-bold text-gray-900 mb-1.5">Paiement sécurisé</h3>
            <p className="text-xs sm:text-sm text-gray-600">Wave, OM, Free Money ou paiement à la livraison</p>
          </div>
        </div>
      </section>

      {/* Blog Preview */}
      <section className="bg-gray-900 dark:bg-gray-950 text-white py-14 sm:py-16">
        <div className="container-tk">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold mb-2">Le Labo Tech</h2>
              <p className="text-gray-400">Tests, guides d'achat et actualités tech</p>
            </div>
            <Link to="/blog" className="hidden sm:inline-flex items-center gap-2 text-white px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 font-semibold text-sm transition">
              Voir le blog <FaArrowRight />
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-400">Chargement des articles...</div>
          ) : (
            <div className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 sm:gap-6">
              {articles.slice(0, 3).map(article => (
                <Link key={article._id} to={`/blog/${article.slug}`} className="shrink-0 w-[80%] sm:w-auto snap-start bg-gray-800 dark:bg-gray-900 rounded-2xl overflow-hidden hover:bg-gray-700/70 transition group">
                  <div className="bg-gradient-to-br from-gray-700 to-gray-800 aspect-video"></div>
                  <div className="p-5 sm:p-6">
                    <span className="text-xs text-brand-400 font-semibold uppercase tracking-wide">{article.category}</span>
                    <h3 className="font-display font-bold text-base sm:text-lg mt-2 mb-2 group-hover:text-brand-300 transition line-clamp-2">{article.title}</h3>
                    <p className="text-sm text-gray-400 mb-3 line-clamp-2">{article.excerpt}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(article.publishedAt).toLocaleDateString("fr-FR")} • {article.readTime} min de lecture
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* CTA mobile uniquement */}
          <div className="sm:hidden mt-6 text-center">
            <Link to="/blog" className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 font-semibold text-sm transition">
              Voir le blog <FaArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="container mx-auto px-4 py-12 sm:py-16">
        <div className="bg-gradient-to-r from-brand-600 to-accent-600 rounded-2xl sm:rounded-4xl shadow-lift p-7 sm:p-12 text-center text-white overflow-hidden">
          <h2 className="text-2xl sm:text-4xl font-display font-extrabold mb-3 text-balance">Besoin d'aide pour choisir ?</h2>
          <p className="text-base sm:text-xl mb-8 text-white/90">Notre équipe d'experts est là pour vous conseiller</p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <a
              href="https://wa.me/221786346946"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 hover:bg-green-600 text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-bold text-base sm:text-lg active:scale-95 transition"
            >
              💬 Contacter sur WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;