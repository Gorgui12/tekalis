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
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../../../../packages/shared/redux/slices/productSlice";
import ProductCard from "../components/product/ProductCard";
import { Breadcrumb } from "../components/seo/Breadcrumb";
import { SEOHead } from "../hooks/useSEO";
import { FaFilter, FaThLarge, FaList, FaTruck, FaShieldAlt } from "react-icons/fa";

// ── Metadata SEO par catégorie ────────────────────────────────────────────────
const CATEGORY_SEO = {
  smartphones: {
    title: "Smartphones & Téléphones à Dakar — Livraison Rapide au Sénégal",
    h1: "Smartphones & Téléphones",
    description: "Achetez votre smartphone en ligne à Dakar avec livraison rapide partout au Sénégal. iPhone, Samsung, Xiaomi, Tecno — garantie constructeur incluse. Paiement Wave, Orange Money ou à la livraison.",
    descriptionLong: "Découvrez notre large sélection de smartphones neufs disponibles à Dakar avec livraison express. Que vous cherchiez un iPhone dernière génération, un Samsung Galaxy, un Xiaomi milieu de gamme ou un Tecno abordable, Tekalis vous propose les meilleurs prix avec une garantie constructeur. Commandez maintenant et recevez votre téléphone sous 24 à 48h à Dakar.",
    keywords: ["smartphone Dakar", "acheter iPhone Dakar", "Samsung Galaxy Sénégal", "téléphone Dakar livraison", "tekalis smartphones"],
    faqs: [
      { q: "Quelle est la garantie sur les smartphones ?", a: "Tous nos smartphones sont garantis 12 mois minimum par le constructeur." },
      { q: "Puis-je payer à la livraison ?", a: "Oui, nous acceptons le paiement à la livraison, Wave, Orange Money et Free Money." },
      { q: "Livrez-vous en dehors de Dakar ?", a: "Oui, nous livrons partout au Sénégal. Délai de 3-5 jours ouvrés pour les régions." },
    ],
  },
  laptops: {
    title: "Laptops & Ordinateurs Portables à Dakar — Tekalis Sénégal",
    h1: "Laptops & Ordinateurs Portables",
    description: "Ordinateurs portables HP, Dell, Lenovo, Asus à prix compétitifs à Dakar. Livraison rapide au Sénégal. Laptops gaming, bureautique, ultrabooks — garantie 12 mois.",
    descriptionLong: "Trouvez le laptop idéal parmi notre sélection de PC portables neufs disponibles au Sénégal. HP, Dell, Lenovo, Asus, MSI — nous proposons des ordinateurs pour tous les usages : études, bureautique, gaming et création graphique. Chaque laptop est vendu avec facture officielle et garantie constructeur. Livraison à domicile à Dakar en 24h.",
    keywords: ["laptop Dakar", "ordinateur portable Sénégal", "PC gaming Dakar", "laptop pas cher Dakar", "Dell HP Lenovo Sénégal"],
    faqs: [
      { q: "Les laptops sont-ils neufs ou reconditionnés ?", a: "Tous nos laptops sont neufs, sous emballage d'origine avec facture officielle." },
      { q: "Proposez-vous des PC gaming ?", a: "Oui, nous avons une large sélection de laptops gaming MSI, Asus ROG, Lenovo Legion." },
    ],
  },
  gaming: {
    title: "Gaming — Consoles, PC Gaming & Accessoires à Dakar",
    h1: "Gaming & Jeux Vidéo",
    description: "PlayStation 5, Xbox, PC gaming, manettes et accessoires gaming disponibles à Dakar. Livraison rapide au Sénégal. Meilleurs prix garantis sur tout le matériel gaming.",
    descriptionLong: "L'univers gaming complet à Dakar — consoles PlayStation 5, Xbox Series, PC gaming haute performance, casques, claviers mécaniques et moniteurs gaming. Tekalis est votre référence pour tout l'équipement gaming au Sénégal, avec livraison rapide et garantie incluse sur tous les produits.",
    keywords: ["gaming Dakar", "PlayStation 5 prix Dakar", "PC gaming Sénégal", "console jeux Dakar", "gaming Sénégal"],
    faqs: [
      { q: "La PS5 est-elle disponible en stock ?", a: "Consultez notre stock en temps réel. Nous réapprovisionnons régulièrement." },
    ],
  },
  tv: {
    title: "TV & Téléviseurs à Dakar — Samsung, LG, Sony | Tekalis",
    h1: "Téléviseurs & TV",
    description: "Achetez votre TV 4K, OLED ou QLED à Dakar avec livraison rapide. Samsung, LG, Sony, Hisense — garantie constructeur. TV 32 à 85 pouces disponibles au Sénégal.",
    descriptionLong: "Renouvelez votre télévision avec les meilleures marques disponibles à Dakar. TV 4K Ultra HD, OLED, QLED, Smart TV — toutes les technologies modernes sont disponibles chez Tekalis. Du 32 pouces pour une chambre aux 85 pouces pour un home cinéma, nous vous livrons rapidement à domicile à Dakar et dans tout le Sénégal.",
    keywords: ["TV Dakar", "téléviseur 4K Sénégal", "Samsung TV Dakar", "acheter TV Dakar livraison", "smart TV Sénégal"],
    faqs: [
      { q: "Livrez-vous les grandes TV ?", a: "Oui, nous livrons tous les formats. Des équipes spécialisées s'occupent des très grandes dalles." },
    ],
  },
  electromenager: {
    title: "Électroménager à Dakar — Livraison Rapide au Sénégal | Tekalis",
    h1: "Électroménager",
    description: "Réfrigérateurs, machines à laver, fours et petit électroménager à prix compétitifs à Dakar. Livraison et installation disponibles au Sénégal. Garantie constructeur 12 mois.",
    descriptionLong: "Équipez votre maison avec les meilleures marques d'électroménager disponibles au Sénégal. Samsung, LG, Hisense — nous proposons des réfrigérateurs, machines à laver, fours, climatiseurs et tout le petit électroménager avec livraison rapide à Dakar. Service d'installation disponible sur demande.",
    keywords: ["électroménager Dakar", "réfrigérateur Sénégal", "machine à laver Dakar livraison", "electromenager pas cher Dakar"],
    faqs: [],
  },
  climatiseurs: {
    title: "Climatiseurs & Climatisation à Dakar — Inverter | Tekalis",
    h1: "Climatiseurs & Climatisation",
    description: "Climatiseurs split inverter, gainables et cassettes à Dakar. Installation professionnelle disponible. LG, Samsung, Midea — économie d'énergie garantie. Livraison rapide au Sénégal.",
    descriptionLong: "Face à la chaleur dakaroise, Tekalis vous propose les meilleurs climatiseurs du marché. Climatiseurs split inverter pour une économie d'énergie maximale, gainables pour les grandes surfaces, unités de fenêtre pour les petits espaces. Nous proposons également un service d'installation professionnelle à Dakar.",
    keywords: ["climatiseur Dakar", "climatisation Sénégal", "inverter Dakar prix", "installation climatiseur Dakar"],
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
    title: "Accessoires Tech à Dakar — Câbles, Chargeurs, Coques | Tekalis",
    h1: "Accessoires & Périphériques",
    description: "Accessoires tech de qualité à Dakar : câbles USB-C, chargeurs rapides, coques téléphone, claviers, souris. Livraison rapide au Sénégal. Marques originales garanties.",
    descriptionLong: "Complétez votre équipement tech avec les meilleurs accessoires disponibles au Sénégal. Câbles de charge originaux, protections d'écran en verre trempé, coques de protection, chargeurs rapides, clés USB, disques durs externes — tout l'accessoire tech de qualité livré rapidement à Dakar.",
    keywords: ["accessoires téléphone Dakar", "câble USB-C Sénégal", "chargeur rapide Dakar", "accessoires tech Sénégal"],
    faqs: [],
  },
  audio: {
    title: "Casques & Enceintes Audio à Dakar — JBL, Sony | Tekalis",
    h1: "Audio — Casques & Enceintes",
    description: "Casques Bluetooth, enceintes portables et barres de son disponibles à Dakar. JBL, Sony, Samsung, Xiaomi — livraison rapide au Sénégal. Garantie constructeur incluse.",
    descriptionLong: "Vivez une expérience sonore incomparable avec notre sélection d'équipements audio à Dakar. Casques gaming, casques Hi-Fi, écouteurs true wireless, enceintes portables waterproof, barres de son pour home cinéma — toutes les grandes marques sont disponibles chez Tekalis avec livraison express.",
    keywords: ["casque Bluetooth Dakar", "enceinte JBL Sénégal", "audio Dakar", "casque gaming Sénégal prix"],
    faqs: [],
  },
};

// Fallback pour catégories non listées
const DEFAULT_SEO = (slug) => ({
  title: `${slug.replace(/-/g, ' ')} à Dakar | Tekalis Sénégal`,
  h1: slug.replace(/-/g, ' '),
  description: `Achetez ${slug.replace(/-/g, ' ')} en ligne à Dakar avec livraison rapide au Sénégal. Garantie constructeur incluse. Tekalis — votre boutique tech de confiance.`,
  descriptionLong: `Découvrez notre sélection de ${slug.replace(/-/g, ' ')} disponibles à Dakar avec livraison rapide partout au Sénégal. Tekalis vous garantit des produits authentiques avec garantie constructeur et service après-vente disponible.`,
  keywords: [`${slug} Dakar`, `${slug} Sénégal`, `acheter ${slug} Dakar`],
  faqs: [],
});

// ── Helper normalisation catégorie ────────────────────────────────────────────
const getCatName = (cat) => {
  if (!cat) return null;
  if (typeof cat === "string") return cat;
  if (typeof cat === "object") return cat.name || cat._id?.toString() || null;
  return String(cat);
};

// ── Composant principal ───────────────────────────────────────────────────────
const CategoryPage = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const { items, isLoading } = useSelector((state) => state.products);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    brands: [],
    sort: "newest",
  });

  const seo = CATEGORY_SEO[slug] || DEFAULT_SEO(slug);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // Filtrage des produits
  const filteredProducts = useMemo(() => {
    let result = [...items];

    if (slug) {
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
      default: return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  }, [items, slug, filters]);

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

  // Schema.org pour la catégorie
  const categorySchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: seo.h1,
    description: seo.description,
    url: `https://tekalis.com/category/${slug}`,
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://tekalis.com' },
        { '@type': 'ListItem', position: 2, name: 'Produits', item: 'https://tekalis.com/products' },
        { '@type': 'ListItem', position: 3, name: seo.h1, item: `https://tekalis.com/category/${slug}` },
      ],
    },
  };

  // Schema FAQ si disponible
  const faqSchema = seo.faqs && seo.faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: seo.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  } : null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center mt-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement des produits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 mt-20">

      {/* ── SEO HEAD ──────────────────────────────────────────────────────── */}
      <SEOHead
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
        canonical={`https://tekalis.com/category/${slug}`}
        schema={categorySchema}
      />
      {faqSchema && (
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      )}

      <div className="container mx-auto px-4">

        {/* ── BREADCRUMB ────────────────────────────────────────────────── */}
        <Breadcrumb
          items={[
            { name: 'Produits', path: '/products' },
            { name: seo.h1, path: `/category/${slug}` },
          ]}
        />

        {/* ── HERO SEO (visible + indexable) ───────────────────────────── */}
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 mb-8 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              {/* H1 avec mots-clés — CRITIQUE pour le SEO */}
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {seo.h1}
                <span className="text-blue-600"> à Dakar</span>
              </h1>
              <p className="text-gray-600 text-sm md:text-base leading-relaxed max-w-2xl">
                {seo.description}
              </p>
            </div>
            <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg shrink-0">
              <span className="text-2xl font-bold text-blue-600">{filteredProducts.length}</span>
              <span className="text-gray-600 text-sm">produit{filteredProducts.length > 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* Badges de confiance — reinforcement du différenciateur */}
          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-1.5 rounded-full">
              <FaTruck size={12} />
              <span>Livraison rapide Dakar</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full">
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
            <div className="bg-white rounded-xl shadow-sm p-5 sticky top-24 border border-gray-100">
              <h2 className="text-base font-bold text-gray-900 mb-4">Filtres</h2>

              {/* Prix */}
              <div className="mb-5">
                <p className="text-sm font-semibold text-gray-700 mb-2">Prix (FCFA)</p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => setFilters((p) => ({ ...p, minPrice: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters((p) => ({ ...p, maxPrice: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Marques */}
              {availableBrands.length > 0 && (
                <div className="mb-5">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Marque</p>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {availableBrands.map((brand) => (
                      <label key={brand} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 hover:text-blue-600">
                        <input
                          type="checkbox"
                          checked={filters.brands.includes(brand)}
                          onChange={() => toggleBrand(brand)}
                          className="rounded text-blue-600"
                        />
                        {brand}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Tri */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Trier par</p>
                <select
                  value={filters.sort}
                  onChange={(e) => setFilters((p) => ({ ...p, sort: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex items-center justify-between border border-gray-100">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2"
              >
                <FaFilter size={12} />
                Filtres
              </button>
              <p className="text-sm text-gray-600 hidden lg:block">
                <span className="font-semibold text-gray-900">{filteredProducts.length}</span> produit{filteredProducts.length > 1 ? "s" : ""}
              </p>
              <div className="flex gap-2">
                <button onClick={() => setViewMode("grid")} className={`p-2 rounded ${viewMode === "grid" ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-100"}`}>
                  <FaThLarge size={14} />
                </button>
                <button onClick={() => setViewMode("list")} className={`p-2 rounded ${viewMode === "list" ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-100"}`}>
                  <FaList size={14} />
                </button>
              </div>
            </div>

            {/* Produits */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Aucun produit trouvé</h3>
                <p className="text-gray-600 mb-6">Essayez de modifier vos filtres ou <Link to="/products" className="text-blue-600 hover:underline">voir tous les produits</Link></p>
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
              <div className="mt-8 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-3">
                  {seo.h1} au Sénégal — Pourquoi choisir Tekalis ?
                </h2>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {seo.descriptionLong}
                </p>
              </div>
            )}

            {/* ── FAQ SEO ───────────────────────────────────────────────── */}
            {seo.faqs && seo.faqs.length > 0 && (
              <div className="mt-6 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Questions fréquentes</h2>
                <div className="space-y-4">
                  {seo.faqs.map((faq, index) => (
                    <div key={index} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">{faq.q}</h3>
                      <p className="text-sm text-gray-600">{faq.a}</p>
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
