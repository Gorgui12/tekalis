"use client";

/**
 * tekalis-seo/pages/CategoryPage.optimized.jsx
 * 
 * Remplace COMPLÈTEMENT :
 * tekalis-frontend/apps/client/src/pages/CategoryPage.jsx
 * 
 * Améliorations SEO :
 * - SEOHead dynamique par catégorie
 * - H1 visible avec mots-clés
 * - Description textuelle indexable par Google
 * - Breadcrumb Schema.org
 * - Données structurées par catégorie
 */

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "@/store/slices/productSlice";
import ProductCard from "@/components/product/ProductCard";
import { Breadcrumb } from "@/components/seo/Breadcrumb";
import { FaFilter, FaThLarge, FaList, FaTruck, FaShieldAlt } from "react-icons/fa";

// ── Metadata SEO par catégorie ────────────────────────────────────────────────
const CATEGORY_SEO = {
  smartphones: {
    title: "Acheter un Smartphone Pas Cher à Dakar | Livraison Sénégal",
    h1: "Smartphones & Téléphones",
    description: "Achetez votre smartphone en ligne à Dakar, livré au Sénégal. Téléphones Android neufs sous garantie pour trouver le meilleur smartphone 2026 au bon prix.",
    descriptionLong: "Des téléphones Android aux modèles les plus récents, notre catalogue couvre tous les budgets avec des appareils neufs et garantis. Commandez en ligne, payez à la livraison ou via Wave, et recevez votre smartphone sous 24 à 48h à Dakar.",
    keywords: ["smartphone Dakar", "acheter smartphone en ligne Sénégal", "téléphone pas cher Dakar", "smartphone pas cher Sénégal", "téléphone Android Dakar", "meilleur smartphone 2026 Sénégal"],
    faqs: [
      { q: "Quelle est la garantie sur les smartphones ?", a: "Tous nos smartphones sont garantis 12 mois minimum par le constructeur." },
      { q: "Puis-je payer à la livraison ?", a: "Oui, nous acceptons le paiement à la livraison, Wave, Orange Money et Free Money." },
      { q: "Livrez-vous en dehors de Dakar ?", a: "Oui, nous livrons partout au Sénégal. Délai de 3-5 jours ouvrés pour les régions." },
    ],
  },
  ordinateurs: {
    title: "Ordinateurs Portables Dakar — PC Portable Pas Cher | Sénégal",
    h1: "Laptops & Ordinateurs Portables",
    description: "Achetez un ordinateur portable au meilleur prix à Dakar, en ligne avec livraison au Sénégal. PC gamer, bureautique ou ultrabook au bon prix.",
    descriptionLong: "Du PC portable pas cher pour les études aux laptops plus puissants pour le travail, nous avons un ordinateur pour chaque usage et chaque budget. Chaque machine est neuve, sous garantie, avec facture officielle et livraison rapide à Dakar.",
    keywords: ["ordinateur portable Dakar", "PC portable pas cher Sénégal", "ordinateur portable prix Sénégal", "PC gamer Dakar", "ordinateur bureautique Sénégal", "acheter ordinateur en ligne Dakar"],
    faqs: [
      { q: "Les laptops sont-ils neufs ou reconditionnés ?", a: "Tous nos laptops sont neufs, sous emballage d'origine avec facture officielle." },
      { q: "Proposez-vous des PC gaming ?", a: "Oui, nous avons une large sélection de laptops gaming MSI, Asus ROG, Lenovo Legion." },
    ],
  },
  gaming: {
    title: "Gaming à Dakar — PC, Manettes & Accessoires | Tekalis",
    h1: "Gaming & Jeux Vidéo",
    description: "PC gaming, manettes de jeux vidéo et accessoires gaming à Dakar : consoles et setup complet pour gamers, livrés rapidement au Sénégal.",
    descriptionLong: "Le setup de vos rêves démarre ici : PC gaming performant, manettes pour tous les styles de jeu et accessoires gaming de qualité. Nos conseillers vous aident à composer votre configuration, avec livraison rapide dans toute la région de Dakar.",
    keywords: ["PC gaming Dakar", "manette jeux vidéo Dakar", "accessoires gaming Dakar"],
    faqs: [
      { q: "La PS5 est-elle disponible en stock ?", a: "Consultez notre stock en temps réel. Nous réapprovisionnons régulièrement." },
    ],
  },
  tv: {
    title: "Smart TV Dakar — Téléviseurs 4K Pas Chers | Sénégal",
    h1: "Téléviseurs & TV",
    description: "Télévisions pas chères et Smart TV 4K à Dakar, avec livraison rapide et installation au Sénégal. Le home cinéma maison devient simple.",
    descriptionLong: "De la petite Smart TV de chambre au grand écran du salon, chaque téléviseur est neuf, vérifié et livré avec soin à Dakar. Un large choix de tailles, du 32 au 85 pouces, au prix le plus juste du marché sénégalais.",
    keywords: ["Smart TV Dakar", "TV 4K prix Sénégal", "télévision pas cher Dakar", "home cinéma Dakar"],
    faqs: [
      { q: "Livrez-vous les grandes TV ?", a: "Oui, nous livrons tous les formats. Des équipes spécialisées s'occupent des très grandes dalles." },
    ],
  },
  electromenager: {
    title: "Électroménager Dakar — Réfrigérateurs & Machines à Laver",
    h1: "Électroménager",
    description: "Réfrigérateurs pas chers, machines à laver et électroménager de cuisine à Dakar. Gros et petit électroménager livrés et installés au Sénégal.",
    descriptionLong: "Équipez toute la maison sans vous déplacer : réfrigérateurs, machines à laver, fours et petit électroménager au meilleur prix à Dakar. Nous livrons et installons vos appareils dans toute la région, garantie incluse.",
    keywords: ["électroménager Dakar", "réfrigérateur pas cher Dakar", "machine à laver Dakar"],
    faqs: [],
  },
  climatiseurs: {
    title: "Climatiseur Dakar — Inverter au Meilleur Prix | Sénégal",
    h1: "Climatiseurs & Climatisation",
    description: "Climatiseur split ou inverter au bon prix à Dakar, livré et installé par nos techniciens au Sénégal. Rafraîchissez votre maison avec un climatiseur adapté.",
    descriptionLong: "Le climatiseur idéal existe pour chaque pièce : split inverter économe pour la chambre, gainable pour le salon. Nous livrons, installons et entretenons votre climatisation à Dakar, avec un prix transparent et une garantie de 12 mois.",
    keywords: ["climatiseur Dakar", "climatiseur prix Sénégal"],
    faqs: [
      { q: "Proposez-vous l'installation ?", a: "Oui, nous avons des techniciens certifiés pour l'installation à Dakar et banlieue." },
    ],
  },
  'energie-solaire': {
    title: "Énergie Solaire & Panneaux Solaires à Dakar | Tekalis Sénégal",
    h1: "Énergie Solaire",
    description: "Kits solaires, panneaux photovoltaïques et batteries pour maison au Sénégal. Solutions d'autonomie énergétique à Dakar. Installation professionnelle disponible. Prix compétitifs.",
    descriptionLong: "Avec le fort ensoleillement du Sénégal, l'énergie solaire est la solution idéale pour réduire vos factures d'électricité. Tekalis propose des kits solaires complets pour particuliers et entreprises à Dakar : panneaux monocristallins haute performance, batteries lithium, onduleurs hybrides. Installation professionnelle et garantie 5 ans sur les panneaux.",
    keywords: ["panneau solaire Dakar", "kit solaire Sénégal", "énergie solaire maison Dakar", "prix panneau solaire Sénégal"],
    faqs: [
      { q: "Quelle capacité solaire pour une maison moyenne ?", a: "Un kit 3KW suffit pour une maison de 3-4 pièces avec climatiseur. Contactez-nous pour un devis personnalisé." },
    ],
  },
  accessoires: {
    title: "Accessoires Téléphone Dakar — Chargeurs, Power Banks",
    h1: "Accessoires & Périphériques",
    description: "Coques, chargeurs rapides, power banks et montres connectées pour votre téléphone à Dakar. Tous les accessoires tech, livrés rapidement au Sénégal.",
    descriptionLong: "De la power bank de secours au chargeur rapide pour recharger en plein trajet, en passant par la montre connectée et les coques de protection, tout est disponible dans notre boutique en ligne. Livraison sous 24-48h à Dakar et paiement à la livraison.",
    keywords: ["accessoires téléphone Dakar", "chargeur rapide Dakar", "power bank Dakar", "montre connectée Dakar"],
    faqs: [],
  },
  audio: {
    title: "Casques & Écouteurs Audio Dakar — Bluetooth | Tekalis",
    h1: "Audio — Casques & Enceintes",
    description: "Écouteurs sans fil, casques Bluetooth et enceintes Bluetooth à Dakar pour un son de qualité au meilleur prix. Essai avant achat, garantie incluse.",
    descriptionLong: "Des écouteurs sans fil discrets aux casques confortables, en passant par les enceintes portables, nous avons le son qu'il vous faut. Équipements neufs, garantis et livrés rapidement à Dakar.",
    keywords: ["écouteurs sans fil Dakar", "casque Bluetooth Dakar", "enceinte Bluetooth Dakar"],
    faqs: [],
  },
};

// Fallback pour catégories non listées
const DEFAULT_SEO = (slug) => {
  const label = slug ? slug.replace(/-/g, ' ') : 'Produits';
  return {
  title: `${label} à Dakar | Tekalis Sénégal`,
  h1: label,
  description: `Achetez ${label} en ligne à Dakar avec livraison rapide au Sénégal. Garantie constructeur incluse. Tekalis — votre boutique tech de confiance.`,
  descriptionLong: `Découvrez notre sélection de ${label} disponibles à Dakar avec livraison rapide partout au Sénégal. Tekalis vous garantit des produits authentiques avec garantie constructeur et service après-vente disponible.`,
  keywords: [`${label} Dakar`, `${label} Sénégal`, `acheter ${label} Dakar`],
  faqs: [],
  };
};

// ── Helper normalisation catégorie ────────────────────────────────────────────
const getCatName = (cat) => {
  if (!cat) return null;
  if (typeof cat === "string") return cat;
  if (typeof cat === "object") return cat.name || cat._id?.toString() || null;
  return String(cat);
};

// ── Composant principal ───────────────────────────────────────────────────────
const CategoryPage = ({ products: initialProducts = [], seo: initialSeo, slug: initialSlug }) => {
  // Compatibilité : le param peut s'appeler slug, category, categorySlug, etc.
  const params = useParams();
  const slug = initialSlug ?? params.slug ?? params.categoryName ?? params.category ?? params.categorySlug ?? params.id ?? null;
  const dispatch = useDispatch();
  const { allProducts: reduxItems, isLoading } = useSelector((state) => state.products);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    brands: [],
    sort: "newest",
  });

  const seo = initialSeo ?? CATEGORY_SEO[slug] ?? DEFAULT_SEO(slug);
  
  // Utiliser les produits SSR initiaux (déjà filtrés par le backend),
  // puis Redux si aucune donnée SSR n'est disponible.
  const usingServerData = initialProducts.length > 0;
  const items = usingServerData ? initialProducts : reduxItems;

  useEffect(() => {
    // Charger les produits via Redux pour les interactions client
    dispatch(fetchProducts());
  }, [dispatch]);

  // Filtrage des produits
  const filteredProducts = useMemo(() => {
    if (!items || !Array.isArray(items)) return [];
    let result = [...items];

    // Le filtre par slug n'est appliqué QUE si les produits viennent de
    // Redux (liste complète non filtrée). Les produits SSR sont déjà
    // filtrés côté serveur via GET /products?category=<id> : réappliquer
    // un filtre textuel (name.includes(slug)) casserait les catégories
    // dont le nom accentué ne contient pas le slug normalisé
    // (ex: "Électroménager" ne contient pas "electromenager").
    if (slug && !usingServerData) {
      result = result.filter((p) => {
        const categories = Array.isArray(p.category) ? p.category : p.category ? [p.category] : [];
        return categories.some((cat) => {
          const name = getCatName(cat);
          return name?.toLowerCase().includes(slug.toLowerCase());
        });
      });
    }

    if (filters.minPrice) result = result.filter((p) => p.price >= Number(filters.minPrice));
    if (filters.maxPrice) result = result.filter((p) => p.price <= Number(filters.maxPrice));
    if (filters.brands.length > 0) result = result.filter((p) => filters.brands.includes(p.brand));

    const sorted = [...result];
    switch (filters.sort) {
      case "price-asc": return sorted.sort((a, b) => a.price - b.price);
      case "price-desc": return sorted.sort((a, b) => b.price - a.price);
      case "rating": return sorted.sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0));
      default: return sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }
  }, [items, slug, filters, usingServerData]);

  // Marques disponibles
  const availableBrands = useMemo(() => {
    return [...new Set(filteredProducts.map((p) => p.brand).filter(Boolean))];
  }, [filteredProducts]);

  const toggleBrand = (brand) => {
    setFilters((prev) => ({
      ...prev,
      brands: prev.brands.includes(brand)
        ? prev.brands.filter((b) => b !== brand)
        : [...prev.brands, brand],
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center mt-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-brand-500 mx-auto mb-4" />
          <p className="text-surface-600">Chargement des produits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 py-8 mt-20">

      <div className="container mx-auto px-4">

        {/* ── BREADCRUMB ────────────────────────────────────────────────── */}
        <Breadcrumb
          items={[
            { name: 'Produits', path: '/products' },
            { name: seo.h1, path: `/category/${slug}` },
          ]}
        />

        {/* ── HERO SEO (visible + indexable) ───────────────────────────── */}
        <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-card p-6 md:p-8 mb-8 border border-surface-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              {/* H1 avec mots-clés — CRITIQUE pour le SEO */}
              <h1 className="text-2xl md:text-3xl font-bold text-surface-900 dark:text-white mb-2 font-display">
                {seo.h1}
                <span className="text-brand-600"> à Dakar</span>
              </h1>
              <p className="text-surface-600 text-sm md:text-base leading-relaxed max-w-2xl">
                {seo.description}
              </p>
            </div>
            <div className="flex items-center gap-2 bg-brand-50 px-4 py-2 rounded-xl shrink-0">
              <span className="text-2xl font-bold text-brand-600">{filteredProducts.length}</span>
              <span className="text-surface-600 text-sm">produit{filteredProducts.length > 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* Badges de confiance — reinforcement du différenciateur */}
          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-surface-100">
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-1.5 rounded-full">
              <FaTruck size={12} />
              <span>Livraison rapide Dakar</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-brand-700 bg-brand-50 px-3 py-1.5 rounded-full">
              <FaShieldAlt size={12} />
              <span>Garantie constructeur</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-purple-700 bg-purple-50 px-3 py-1.5 rounded-full">
              <span>💳</span>
              <span>Wave · Orange Money · Livraison</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── FILTRES SIDEBAR ───────────────────────────────────────── */}
          <aside className={`lg:w-60 flex-shrink-0 ${showFilters ? "block" : "hidden lg:block"}`}>
            <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-card p-5 sticky top-24 border border-surface-100">
              <h2 className="text-base font-bold text-surface-900 dark:text-white mb-4">Filtres</h2>

              {/* Prix */}
              <div className="mb-5">
                <p className="text-sm font-semibold text-surface-700 mb-2">Prix (FCFA)</p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => setFilters((p) => ({ ...p, minPrice: e.target.value }))}
                    className="w-full border border-surface-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters((p) => ({ ...p, maxPrice: e.target.value }))}
                    className="w-full border border-surface-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              {/* Marques */}
              {availableBrands.length > 0 && (
                <div className="mb-5">
                  <p className="text-sm font-semibold text-surface-700 mb-2">Marque</p>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {availableBrands.map((brand) => (
                      <label key={brand} className="flex items-center gap-2 cursor-pointer text-sm text-surface-700 hover:text-brand-600">
                        <input
                          type="checkbox"
                          checked={filters.brands.includes(brand)}
                          onChange={() => toggleBrand(brand)}
                          className="rounded text-brand-500"
                        />
                        {brand}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Tri */}
              <div>
                <p className="text-sm font-semibold text-surface-700 mb-2">Trier par</p>
                <select
                  value={filters.sort}
                  onChange={(e) => setFilters((p) => ({ ...p, sort: e.target.value }))}
                  className="w-full border border-surface-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="newest">Plus récents</option>
                  <option value="price-asc">Prix croissant</option>
                  <option value="price-desc">Prix décroissant</option>
                  <option value="rating">Mieux notés</option>
                </select>
              </div>

              {/* Reset */}
              {(filters.minPrice || filters.maxPrice || filters.brands.length > 0) && (
                <button
                  onClick={() => setFilters({ minPrice: "", maxPrice: "", brands: [], sort: "newest" })}
                  className="mt-4 w-full text-sm text-red-600 hover:text-red-700 font-semibold"
                >
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          </aside>

          {/* ── GRILLE PRODUITS ───────────────────────────────────────── */}
          <main className="flex-1">

            {/* Barre d'outils */}
            <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-card p-4 mb-4 flex items-center justify-between border border-surface-100">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden bg-brand-500 text-white px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2"
              >
                <FaFilter size={12} />
                Filtres
              </button>
              <p className="text-sm text-surface-600 hidden lg:block">
                <span className="font-semibold text-surface-900 dark:text-white">{filteredProducts.length}</span> produit{filteredProducts.length > 1 ? "s" : ""}
              </p>
              <div className="flex gap-2">
                <button onClick={() => setViewMode("grid")} className={`p-2 rounded ${viewMode === "grid" ? "bg-brand-500 text-white" : "text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800"}`}>
                  <FaThLarge size={14} />
                </button>
                <button onClick={() => setViewMode("list")} className={`p-2 rounded ${viewMode === "list" ? "bg-brand-500 text-white" : "text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800"}`}>
                  <FaList size={14} />
                </button>
              </div>
            </div>

            {/* Produits */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-card p-12 text-center border border-surface-100">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-2">Aucun produit trouvé</h3>
                <p className="text-surface-600 mb-6">Essayez de modifier vos filtres ou <Link href="/products" className="text-brand-600 hover:underline">voir tous les produits</Link></p>
              </div>
            ) : (
              <div className={viewMode === "grid"
                ? "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4"
                : "space-y-4"
              }>
                {filteredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}

            {/* ── CONTENU TEXTUEL SEO (bas de page, indexable) ─────────── */}
            {seo.descriptionLong && (
              <div className="mt-8 bg-white dark:bg-surface-800 rounded-2xl shadow-card p-6 border border-surface-100">
                <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-3">
                  {seo.h1} au Sénégal — Pourquoi choisir Tekalis ?
                </h2>
                <p className="text-surface-600 text-sm leading-relaxed">
                  {seo.descriptionLong}
                </p>
              </div>
            )}

            {/* ── FAQ SEO ───────────────────────────────────────────────── */}
            {seo.faqs && seo.faqs.length > 0 && (
              <div className="mt-6 bg-white dark:bg-surface-800 rounded-2xl shadow-card p-6 border border-surface-100">
                <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-4">Questions fréquentes</h2>
                <div className="space-y-4">
                  {seo.faqs.map((faq, index) => (
                    <div key={index} className="border-b border-surface-100 pb-4 last:border-0 last:pb-0">
                      <h3 className="text-sm font-semibold text-surface-900 dark:text-white mb-1">{faq.q}</h3>
                      <p className="text-sm text-surface-600">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
