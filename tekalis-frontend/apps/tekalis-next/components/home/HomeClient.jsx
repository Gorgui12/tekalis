"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "@/store/slices/productSlice";
import PageMeta from "@/components/seo/PageMeta";
import DynamicHero from "@/components/home/DynamicHero";
import { 
  FaChevronLeft, 
  FaChevronRight, 
  FaTruck, 
  FaShieldAlt, 
  FaHeadset,
  FaCreditCard,
  FaStar,
  FaArrowRight,
  FaLaptop,
  FaMobileAlt,
  FaGamepad,
  FaCamera,
  FaDesktop,
  FaKeyboard
} from "react-icons/fa";
import api from "@/lib/api";
import ProductCard from "@/components/product/ProductCard";

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

const Home = () => {
  const dispatch = useDispatch();
  const { allProducts: products, loading: isLoading } = useSelector((state) => state.products);
  
  const [currentSlide, setCurrentSlide] = useState(0);
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
        // Handle 429 rate limiting and other errors gracefully
        if (error.response?.status === 429) {
          console.warn("Articles API rate limited, using fallback articles");
        } else {
          console.error("Erreur chargement articles :", error);
        }
        // Use fallback articles on any error
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
    if (products && products.length > 0) {
      const featured = products.filter(p => p.isFeatured).slice(0, 8);
      setFeaturedProducts(featured.length > 0 ? featured : products.slice(0, 8));

      const sorted = [...products].sort((a, b) =>
        (b.salesCount || 0) - (a.salesCount || 0) ||
        (b.rating?.average || 0) - (a.rating?.average || 0)
      );
      setBestSellers(sorted.slice(0, 8));
    }
  }, [products]);

  const slides = [
    {
      id: 1,
      title: "EXCLUSIVITÉS & NOUVEAUTÉS",
      subtitle: "Découvrez nos derniers PC Gaming haute performance",
      image: "/banner-gaming.jpg",
      badge: "NOUVEAU",
      cta: "Découvrir",
      link: "/products?category=gaming",
      bg: "from-purple-600 to-pink-600"
    },
    {
      id: 2,
      title: "FLASH SALES - 30% DE RÉDUCTION",
      subtitle: "Profitez de nos offres limitées sur une sélection de produits",
      image: "/banner-deals.jpg",
      badge: "PROMO",
      cta: "Voir les offres",
      link: "/products?sort=discount",
      bg: "from-red-600 to-orange-600"
    },
    {
      id: 3,
      title: "CONFIGURATEUR PC SUR MESURE",
      subtitle: "Créez le PC de vos rêves en 3 étapes simples",
      image: "/banner-config.jpg",
      badge: "OUTIL",
      cta: "Configurer",
      link: "/configurator",
      bg: "from-blue-600 to-indigo-600"
    }
  ];

  const categories = [
    { name: "Smartphones", icon: <FaMobileAlt />, slug: "smartphones", color: "from-blue-500 to-cyan-500", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop" },
    { name: "Gaming", icon: <FaGamepad />, slug: "gaming", color: "from-purple-500 to-pink-500", image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=400&fit=crop" },
    { name: "Home Cinema", icon: <FaDesktop />, slug: "home-cinema", color: "from-red-500 to-orange-500", image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop" },
    { name: "Caméras", icon: <FaCamera />, slug: "cameras", color: "from-green-500 to-teal-500", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=400&fit=crop" },
    { name: "Laptops", icon: <FaLaptop />, slug: "laptops", color: "from-indigo-500 to-purple-500", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop" },
    { name: "Accessoires", icon: <FaKeyboard />, slug: "accessories", color: "from-yellow-500 to-orange-500", image: "https://images.unsplash.com/photo-1587829741301-dc798b91add1?w=400&h=400&fit=crop" }
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, []);

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
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/products" className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition group">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 rounded-full p-4 group-hover:bg-blue-200 transition">
                <FaLaptop className="text-blue-600 text-2xl" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Tous les produits</h3>
                <p className="text-sm text-gray-600">Explorez notre catalogue</p>
              </div>
            </div>
          </Link>

          <Link href="/configurator" className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg shadow-lg p-6 hover:shadow-xl transition text-white group">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 rounded-full p-4 group-hover:bg-white/30 transition">
                <FaDesktop className="text-white text-2xl" />
              </div>
              <div>
                <h3 className="font-bold text-lg">PC Configurator</h3>
                <p className="text-sm text-white/90">Créez votre PC sur mesure</p>
              </div>
            </div>
          </Link>

          <Link href="/blog" className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition group">
            <div className="flex items-center gap-4">
              <div className="bg-orange-100 rounded-full p-4 group-hover:bg-orange-200 transition">
                <FaStar className="text-orange-600 text-2xl" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Labo Tech</h3>
                <p className="text-sm text-gray-600">Tests & guides d'achat</p>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Catégories */}
      <section className="container mx-auto px-4 mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Parcourir par catégorie
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
          {categories.map((category) => (
            <Link key={category.slug} href={`/category/${category.slug}`} className="group">
              <div className="relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden aspect-square sm:aspect-auto sm:h-48">
                <img
                  src={category.image}
                  alt={category.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${category.color} opacity-80 group-hover:opacity-90 transition-opacity`}></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-3 sm:p-4">
                  <div className="text-3xl sm:text-4xl mb-2 group-hover:scale-110 transition-transform">
                    {category.icon}
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-center">{category.name}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Nouveautés */}
      <section className="container mx-auto px-4 mb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">⚡ Nouveautés</h2>
          <Link href="/products?sort=newest" className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2">
            Voir tout <FaArrowRight />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                <div className="bg-gray-200 aspect-square rounded mb-4"></div>
                <div className="bg-gray-200 h-4 rounded mb-2"></div>
                <div className="bg-gray-200 h-4 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Best-sellers */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">🔥 Meilleures ventes</h2>
            <Link href="/products?sort=popular" className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2">
              Voir tout <FaArrowRight />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {bestSellers.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <FaTruck className="text-blue-600 text-3xl" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Livraison rapide</h3>
            <p className="text-sm text-gray-600">Livraison gratuite à Dakar sous 2-3 jours</p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <FaShieldAlt className="text-green-600 text-3xl" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Garantie constructeur</h3>
            <p className="text-sm text-gray-600">Tous nos produits sont garantis 12 mois minimum</p>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <FaHeadset className="text-purple-600 text-3xl" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Support 24/7</h3>
            <p className="text-sm text-gray-600">Notre équipe est disponible pour vous aider</p>
          </div>
          <div className="text-center">
            <div className="bg-orange-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <FaCreditCard className="text-orange-600 text-3xl" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Paiement sécurisé</h3>
            <p className="text-sm text-gray-600">Wave, OM, Free Money ou paiement à la livraison</p>
          </div>
        </div>
      </section>

      {/* Blog Preview */}
      <section className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">📝 Le Labo Tech</h2>
              <p className="text-gray-400">Tests, guides d'achat et actualités tech</p>
            </div>
            <Link href="/blog" className="bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition flex items-center gap-2">
              Voir le blog <FaArrowRight />
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-400">Chargement des articles...</div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {articles.slice(0, 3).map(article => (
                <Link key={article._id} href={`/blog/${article.slug}`} className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition group">
                  <div className="bg-gray-700 aspect-video"></div>
                  <div className="p-6">
                    <span className="text-xs text-blue-400 font-semibold uppercase">{article.category}</span>
                    <h3 className="font-bold text-lg mt-2 mb-2 group-hover:text-blue-400 transition">{article.title}</h3>
                    <p className="text-sm text-gray-400 mb-3">{article.excerpt}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(article.publishedAt).toLocaleDateString("fr-FR")} • {article.readTime} min de lecture
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Final */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-2xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Besoin d'aide pour choisir ?</h2>
          <p className="text-xl mb-8 text-blue-100">Notre équipe d'experts est là pour vous conseiller</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/configurator" className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition">
              Configurer mon PC
            </Link>
            <a
              href="https://wa.me/221786346946"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-lg font-bold text-lg transition"
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


