"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  FaTv,
  FaBlender,
  FaKeyboard
} from "react-icons/fa";
import api from "@/lib/api";
import ProductCard from "@/components/product/ProductCard";
import { SOCIAL_LINKS } from "@/lib/utils/constants";

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
    SOCIAL_LINKS.facebook,
    SOCIAL_LINKS.instagram,
    SOCIAL_LINKS.twitter,
    SOCIAL_LINKS.linkedin,
  ],
};

const Home = ({
  initialProducts = [],
  initialNew = [],
  initialBest = [],
  initialPromo = [],
  initialArticles = [],
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [promoProducts, setPromoProducts] = useState([]);
  const [articles, setArticles] = useState(initialArticles);
  const [loading, setLoading] = useState(false);
   
  useEffect(() => {
    const fetchArticles = async () => {
      if (initialArticles.length > 0) return;
      
      try {
        const { data } = await api.get("/articles");
        setArticles(data.articles || []);
      } catch (error) {
        console.error("Erreur chargement articles :", error);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [initialArticles]);

  // ── Sections accueil ────────────────────────────────────────────────────────
  // Les produits "choisis en admin" (champ homepageSection) sont récupérés via
  // des requêtes DÉDIÉES (limit=8) et non plus filtrés dans un lot de 20
  // produits. Une section non renseignée en admin retombe sur un repli calculé
  // depuis le pool complet : vedettes → plus récents / ventes+note / prix barré.
  const extractProducts = (d) =>
    Array.isArray(d) ? d
    : Array.isArray(d?.data) ? d.data
    : Array.isArray(d?.products) ? d.products
    : [];

  const resolveSections = (pool, sections) => {
    const { newItems = [], best = [], promos = [] } = sections || {};
    const poolList = Array.isArray(pool) ? pool : [];

    let newRes = newItems.length ? newItems : poolList.filter(p => p.isFeatured);
    if (newRes.length === 0) {
      newRes = [...poolList].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    }
    setFeaturedProducts(newRes.slice(0, 8));

    let bestRes = best.length ? best : [...poolList].sort((a, b) =>
      (b.salesCount || 0) - (a.salesCount || 0) ||
      (b.rating?.average || 0) - (a.rating?.average || 0)
    );
    setBestSellers(bestRes.slice(0, 8));

    let promoRes = promos.length ? promos : poolList.filter(p => p.comparePrice && p.comparePrice > p.price);
    setPromoProducts(promoRes.slice(0, 8));
  };

  useEffect(() => {
    // 1) Rendu immédiat avec les données SSR…
    resolveSections(initialProducts, {
      newItems: initialNew,
      best: initialBest,
      promos: initialPromo,
    });

    // 2) …puis rafraîchissement côté client (requêtes dédiées, limit=8).
    let cancelled = false;
    (async () => {
      try {
        const [newRes, bestRes, promoRes, poolRes] = await Promise.all([
          api.get('/products?homepageSection=new&limit=8'),
          api.get('/products?homepageSection=bestseller&limit=8'),
          api.get('/products?homepageSection=promo&limit=8'),
          api.get('/products?limit=200'),
        ]);
        if (cancelled) return;
        resolveSections(extractProducts(poolRes.data), {
          newItems: extractProducts(newRes.data),
          best: extractProducts(bestRes.data),
          promos: extractProducts(promoRes.data),
        });
      } catch {
        // API injoignable → on conserve les données SSR déjà rendues.
      }
    })();

    return () => { cancelled = true; };
  }, [initialProducts, initialNew, initialBest, initialPromo]);


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
    }
  ];

  const categories = [
    { name: "Smartphones", icon: <FaMobileAlt />, slug: "smartphones", color: "from-blue-500 to-cyan-500", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop" },
    { name: "Ordinateurs", icon: <FaLaptop />, slug: "ordinateurs", color: "from-indigo-500 to-purple-500", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop" },
    { name: "Gaming", icon: <FaGamepad />, slug: "gaming", color: "from-purple-500 to-pink-500", image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=400&fit=crop" },
    { name: "Téléviseurs", icon: <FaTv />, slug: "tv", color: "from-red-500 to-orange-500", image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop" },
    { name: "Électroménager", icon: <FaBlender />, slug: "electromenager", color: "from-emerald-500 to-teal-500", image: "https://images.unsplash.com/photo-1590513522611-a8c3a2c3c9b0?w=400&h=400&fit=crop" },
    { name: "Accessoires", icon: <FaKeyboard />, slug: "accessoires", color: "from-yellow-500 to-orange-500", image: "https://images.unsplash.com/photo-1587829741301-dc798b91add1?w=400&h=400&fit=crop" }
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">

      {/* Hero Section - Carousel */}
      {/* isHomePage=false : le H1 home est rendu serveur (app/page.jsx), le hero est en H2. */}
      <DynamicHero isHomePage={false} />

      {/* Quick Actions */}
      <section className="container mx-auto px-4 -mt-16 relative z-10 mb-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/products" className="bg-white dark:bg-surface-800 rounded-2xl shadow-card hover:shadow-card-hover p-6 transition group border border-surface-100 dark:border-surface-700">
            <div className="flex items-center gap-4">
              <div className="bg-brand-100 dark:bg-brand-900/30 rounded-2xl p-4 group-hover:bg-brand-200 dark:group-hover:bg-brand-900/50 transition">
                <FaLaptop className="text-brand-600 dark:text-brand-400 text-2xl" />
              </div>
              <div>
                <h2 className="font-bold font-display text-surface-900 dark:text-white text-lg">Tous les produits</h2>
                <p className="text-sm text-surface-500">Explorez notre catalogue</p>
              </div>
            </div>
          </Link>

          <Link href="/blog" className="bg-white dark:bg-surface-800 rounded-2xl shadow-card hover:shadow-card-hover p-6 transition group border border-surface-100 dark:border-surface-700">
            <div className="flex items-center gap-4">
              <div className="bg-amber-100 dark:bg-amber-900/30 rounded-2xl p-4 group-hover:bg-amber-200 dark:group-hover:bg-amber-900/50 transition">
                <FaStar className="text-amber-600 dark:text-amber-400 text-2xl" />
              </div>
              <div>
                <h2 className="font-bold font-display text-surface-900 dark:text-white text-lg">Labo Tech</h2>
                <p className="text-sm text-surface-500">Tests & guides d'achat</p>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Catégories */}
      <section className="container mx-auto px-4 mb-16">
        <h2 className="text-3xl font-bold font-display text-surface-900 dark:text-white mb-8 text-center">
          Parcourir par catégorie
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
          {categories.map((category) => (
            <Link key={category.slug} href={`/category/${category.slug}`} className="group">
              <div className="relative bg-white dark:bg-surface-800 rounded-2xl shadow-card hover:shadow-card-hover transition-all overflow-hidden border border-surface-100 dark:border-surface-700 aspect-square sm:aspect-auto sm:h-48">
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
                  <h3 className="font-bold font-display text-sm sm:text-base text-center">{category.name}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Nouveautés */}
      <section className="container mx-auto px-4 mb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold font-display text-surface-900 dark:text-white">Nouveautés</h2>
          <Link href="/products?sort=newest" className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-semibold flex items-center gap-2 transition">
            Voir tout <FaArrowRight />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* Best-sellers */}
      <section className="bg-gradient-to-br from-brand-50 to-amber-50 dark:from-surface-900 dark:to-surface-950 py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold font-display text-surface-900 dark:text-white">Meilleures ventes</h2>
            <Link href="/products?sort=popular" className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-semibold flex items-center gap-2 transition">
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

      {/* Promotions */}
      {promoProducts.length > 0 && (
        <section className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold font-display text-surface-900 dark:text-white">Promotions</h2>
            <Link href="/products?sort=discount" className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-semibold flex items-center gap-2 transition">
              Voir tout <FaArrowRight />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {promoProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center group">
            <div className="bg-brand-100 dark:bg-brand-900/30 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <FaTruck className="text-brand-600 dark:text-brand-400 text-3xl" />
            </div>
            <h3 className="font-bold font-display text-surface-900 dark:text-white mb-2">Livraison rapide</h3>
            <p className="text-sm text-surface-500">Livraison à Dakar en 24-48h, offerte dès 50 000 FCFA d&apos;achat</p>
          </div>
          <div className="text-center group">
            <div className="bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <FaShieldAlt className="text-emerald-600 dark:text-emerald-400 text-3xl" />
            </div>
            <h3 className="font-bold font-display text-surface-900 dark:text-white mb-2">Garantie incluse</h3>
            <p className="text-sm text-surface-500">Garantie constructeur selon produit et SAV réactif depuis votre espace client</p>
          </div>
          <div className="text-center group">
            <div className="bg-amber-100 dark:bg-amber-900/30 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <FaHeadset className="text-amber-600 dark:text-amber-400 text-3xl" />
            </div>
            <h3 className="font-bold font-display text-surface-900 dark:text-white mb-2">Support client</h3>
            <p className="text-sm text-surface-500">Notre équipe vous répond du lundi au samedi, par téléphone ou WhatsApp</p>
          </div>
          <div className="text-center group">
            <div className="bg-orange-100 dark:bg-orange-900/30 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <FaCreditCard className="text-orange-600 dark:text-orange-400 text-3xl" />
            </div>
            <h3 className="font-bold font-display text-surface-900 dark:text-white mb-2">Paiement sécurisé</h3>
            <p className="text-sm text-surface-500">Wave, OM, Free Money ou paiement à la livraison</p>
          </div>
        </div>
      </section>

      {/* Blog Preview */}
      <section className="bg-surface-950 dark:bg-black text-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold font-display mb-2">Le Labo Tech</h2>
              <p className="text-surface-500">Tests, guides d'achat et actualités tech</p>
            </div>
            <Link href="/blog" className="bg-brand-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-brand-600 transition flex items-center gap-2 shadow-sm">
              Voir le blog <FaArrowRight />
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12 text-surface-500">Chargement des articles...</div>
          ) : articles.length === 0 ? (
            <div className="text-center py-12 text-surface-500">
              Aucun article publié pour le moment. Revenez bientôt pour découvrir nos tests et guides d&apos;achat.
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {articles.slice(0, 3).map(article => (
                <Link key={article._id} href={`/blog/${article.slug}`} className="bg-surface-900 dark:bg-surface-900 rounded-2xl overflow-hidden hover:bg-surface-800 transition group border border-surface-800">
                  <div className="bg-surface-800 aspect-video"></div>
                  <div className="p-6">
                    <span className="text-xs text-brand-400 font-semibold uppercase tracking-wide">{article.category}</span>
                    <h3 className="font-bold font-display text-lg mt-2 mb-2 group-hover:text-brand-400 transition">{article.title}</h3>
                    <p className="text-sm text-surface-500 mb-3 line-clamp-2">{article.excerpt}</p>
                    <p className="text-xs text-surface-600">
                      {new Date(article.publishedAt || 0).toLocaleDateString("fr-FR")} • {article.readTime} min de lecture
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
        <div className="bg-gradient-to-r from-brand-500 via-amber-500 to-brand-600 rounded-3xl shadow-glow p-12 text-center text-white">
          <h2 className="text-4xl font-bold font-display mb-4">Besoin d'aide pour choisir ?</h2>
          <p className="text-xl mb-8 text-white/90">Notre équipe d'experts est là pour vous conseiller</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/221786346946"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition shadow-lg hover:scale-105"
            >
              Contacter sur WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;


