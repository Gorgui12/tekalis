"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { addToCart } from "@/store/slices/cartSlice";
import {
  FaCheckCircle,
  FaArrowRight,
  FaArrowLeft,
  FaGamepad,
  FaBriefcase,
  FaPaintBrush,
  FaGraduationCap,
  FaDesktop,
  FaInfoCircle,
  FaShoppingCart,
  FaSpinner,
  FaLaptop,
} from "react-icons/fa";
import { useToast } from "@/components/shared/ToastProvider";
import api from "@/lib/api";

/* ── Helpers ──────────────────────────────────────────────────────────── */

const formatPrice = (price) =>
  `${new Intl.NumberFormat("fr-FR").format(price || 0)} FCFA`;

const getImageUrl = (product) =>
  product.images?.[0]?.url ||
  product.image ||
  "/placeholder.jpg";

const PC_CATEGORY_SLUGS = ["laptops", "ordinateurs", "pc", "informatique"];

const usageOptions = [
  {
    id: "gaming",
    label: "Gaming",
    icon: <FaGamepad />,
    description: "Jeux vidéo haute performance, streaming",
    keywords: ["gaming", "gamer", "rtx", "gtx", "legion", "rog", "predator", "katana"],
  },
  {
    id: "work",
    label: "Travail / Bureau",
    icon: <FaBriefcase />,
    description: "Bureautique, multitâche, visioconférences",
    keywords: ["business", "pro", "thinkpad", "latitude", "elitebook", "vostro", "expertbook"],
  },
  {
    id: "creation",
    label: "Création de contenu",
    icon: <FaPaintBrush />,
    description: "Montage vidéo, design graphique, 3D",
    keywords: ["creator", "studio", "precision", "zbook", "workstation", "quadro"],
  },
  {
    id: "student",
    label: "Étudiant",
    icon: <FaGraduationCap />,
    description: "Prise de notes, recherches, léger multimédia",
    keywords: ["vivobook", "ideapad", "inspiron", "aspire", "chromebook", "15s", "250 g"],
  },
  {
    id: "multimedia",
    label: "Multimédia",
    icon: <FaDesktop />,
    description: "Streaming, navigation web, réseaux sociaux",
    keywords: ["pavilion", "essential", "everyday", "home"],
  },
];

const budgetRanges = [
  { min: 0, max: 500000, label: "Moins de 500 000 FCFA" },
  { min: 500000, max: 800000, label: "500 000 - 800 000 FCFA" },
  { min: 800000, max: 1200000, label: "800 000 - 1 200 000 FCFA" },
  { min: 1200000, max: 2000000, label: "1 200 000 - 2 000 000 FCFA" },
  { min: 2000000, max: Infinity, label: "Plus de 2 000 000 FCFA" },
];

const steps = [
  { number: 1, label: "Usage" },
  { number: 2, label: "Budget" },
  { number: 3, label: "Marque" },
  { number: 4, label: "Résultats" },
];

const emptyConfig = {
  usage: "",
  budget: null,
  brand: "any",
};

/* ── Scoring ──────────────────────────────────────────────────────────── */

function buildSearchText(product) {
  const specsText = product.specs ? Object.values(product.specs).filter(Boolean).join(" ") : "";
  return [product.name, product.brand, product.description, specsText]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function scoreProduct(product, config) {
  let score = 0;
  const price = product.price || 0;

  // Budget (30 pts)
  if (config.budget) {
    if (price >= config.budget.min && price <= config.budget.max) score += 30;
    else if (price <= config.budget.max * 1.1) score += 20;
    else if (price < config.budget.min) score += 10;
  }

  // Usage (40 pts)
  const usage = usageOptions.find((u) => u.id === config.usage);
  if (usage) {
    const text = buildSearchText(product);
    const matches = usage.keywords.filter((k) => text.includes(k)).length;
    score += Math.min(matches / Math.max(usage.keywords.length / 3, 1), 1) * 40;
  }

  // Marque (15 pts)
  if (config.brand && config.brand !== "any") {
    if ((product.brand || "").toLowerCase().includes(config.brand.toLowerCase())) score += 15;
  } else {
    score += 8;
  }

  // Disponibilité (15 pts)
  if ((product.stock || 0) > 0) score += 15;

  return Math.min(Math.round(score), 100);
}

function getMatchReasons(product, config) {
  const reasons = [];
  const price = product.price || 0;

  if (config.budget && price >= config.budget.min && price <= config.budget.max) {
    reasons.push("Dans votre budget");
  }

  const usage = usageOptions.find((u) => u.id === config.usage);
  if (usage) {
    const name = (product.name || "").toLowerCase();
    if (usage.keywords.some((k) => name.includes(k))) {
      reasons.push(`Adapté ${usage.id === "gaming" ? "au gaming" : `à un usage ${usage.label.toLowerCase()}`}`);
    }
  }

  if ((product.stock || 0) > 0) reasons.push("En stock");

  return reasons.slice(0, 3);
}

/* ── Composant ────────────────────────────────────────────────────────── */

const Configurator = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const toast = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [config, setConfig] = useState(emptyConfig);
  const [allProducts, setAllProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoadingProducts(true);

        // Cibler la catégorie PC/laptops si elle existe
        let categoryId;
        try {
          const { data: catData } = await api.get("/categories");
          const flat = [
            ...(catData.categories || []),
            ...(catData.categories || []).flatMap((c) => c.children || []),
          ];
          categoryId = flat.find((c) =>
            PC_CATEGORY_SLUGS.includes((c.slug || "").toLowerCase())
          )?._id;
        } catch {
          // catégories indisponibles : on continue sans filtre catégorie
        }

        const query = categoryId
          ? `/products?limit=100&sort=price_asc&category=${categoryId}`
          : "/products?limit=100&sort=price_asc";
        const { data } = await api.get(query);
        const products = (Array.isArray(data) ? data : data.data || []).filter(
          (p) => typeof p.price === "number"
        );

        if (!cancelled) {
          setAllProducts(products);
          setBrands([
            ...new Set(products.map((p) => p.brand).filter(Boolean)),
          ].sort());
        }
      } catch (error) {
        console.error("Erreur lors du chargement des produits:", error);
        if (!cancelled) {
          toast.error(error.response?.data?.message || "Impossible de charger les produits");
        }
      } finally {
        if (!cancelled) setLoadingProducts(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const priceRange = useMemo(() => {
    if (allProducts.length === 0) return null;
    const prices = allProducts.map((p) => p.price);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [allProducts]);

  const generateRecommendations = () => {
    const scored = allProducts
      .map((product) => ({
        ...product,
        score: scoreProduct(product, config),
        reasons: getMatchReasons(product, config),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
    setRecommendations(scored);
  };

  const handleAddToCart = (product) => {
    dispatch(
      addToCart({
        _id: product._id,
        name: product.name,
        price: product.price,
        image: getImageUrl(product),
        quantity: 1,
      })
    );
    toast.success(`${product.name} ajouté au panier`);
  };

  const nextStep = () => {
    if (currentStep === 1 && !config.usage) {
      toast.warning("Veuillez sélectionner un usage");
      return;
    }
    if (currentStep === 2 && !config.budget) {
      toast.warning("Veuillez sélectionner une tranche de budget");
      return;
    }
    if (currentStep === 3) generateRecommendations();
    setCurrentStep((s) => s + 1);
  };

  const restart = () => {
    setConfig(emptyConfig);
    setRecommendations([]);
    setCurrentStep(1);
  };

  if (loadingProducts) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-5xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Chargement du catalogue…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/40 rounded-full mb-5">
            <FaLaptop className="text-3xl text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Configurateur PC
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Décrivez vos besoins, nous sélectionnons les machines adaptées parmi{" "}
            <strong>{allProducts.length}</strong> modèles disponibles.
          </p>
        </div>

        {/* ── Progression ────────────────────────────────────────────── */}
        <div className="max-w-2xl mx-auto mb-10">
          <div className="flex items-start">
            {steps.map((step, index) => (
              <div key={step.number} className={`flex items-center ${index < steps.length - 1 ? "flex-1" : ""}`}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                      currentStep > step.number
                        ? "bg-blue-600 text-white"
                        : currentStep === step.number
                          ? "bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900/50"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {currentStep > step.number ? <FaCheckCircle /> : step.number}
                  </div>
                  <span
                    className={`mt-2 text-xs font-medium ${
                      currentStep >= step.number
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mt-[18px] mx-2 ${
                      currentStep > step.number
                        ? "bg-blue-600"
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Carte principale ───────────────────────────────────────── */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 sm:p-8">

          {/* ÉTAPE 1 : USAGE */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
                Quel est votre usage principal ?
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
                Sélectionnez l'utilisation qui correspond le mieux à vos besoins
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {usageOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setConfig({ ...config, usage: option.id })}
                    className={`relative p-5 rounded-xl border-2 text-left transition-all ${
                      config.usage === option.id
                        ? "border-blue-600 bg-blue-50 dark:bg-blue-900/30 shadow-md"
                        : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-11 h-11 rounded-lg flex items-center justify-center text-xl flex-shrink-0 ${
                          config.usage === option.id
                            ? "bg-blue-600 text-white"
                            : "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
                        }`}
                      >
                        {option.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-1">{option.label}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{option.description}</p>
                      </div>
                      {config.usage === option.id && (
                        <FaCheckCircle className="text-blue-600 dark:text-blue-400 text-xl flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ÉTAPE 2 : BUDGET */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
                Quel est votre budget ?
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
                {priceRange
                  ? `Prix disponibles : ${formatPrice(priceRange.min)} à ${formatPrice(priceRange.max)}`
                  : "Sélectionnez une tranche"}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                {budgetRanges.map((range) => {
                  const count = allProducts.filter(
                    (p) => p.price >= range.min && p.price <= range.max
                  ).length;
                  const selected = config.budget?.min === range.min;

                  return (
                    <button
                      key={range.label}
                      onClick={() => setConfig({ ...config, budget: range })}
                      disabled={count === 0}
                      className={`relative p-5 rounded-xl border-2 text-left transition-all ${
                        count === 0
                          ? "opacity-40 cursor-not-allowed border-gray-200 dark:border-gray-700"
                          : selected
                            ? "border-blue-600 bg-blue-50 dark:bg-blue-900/30 shadow-md"
                            : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500"
                      }`}
                    >
                      <p className="font-bold text-gray-900 dark:text-white mb-1">{range.label}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {count} modèle{count > 1 ? "s" : ""} disponible{count > 1 ? "s" : ""}
                      </p>
                      {selected && (
                        <FaCheckCircle className="absolute top-4 right-4 text-blue-600 dark:text-blue-400 text-lg" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ÉTAPE 3 : MARQUE */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
                Une marque en particulier ?
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
                Optionnel — laissez « Pas de préférence » pour voir toutes les marques
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
                <button
                  onClick={() => setConfig({ ...config, brand: "any" })}
                  className={`p-3 rounded-xl border-2 font-semibold transition ${
                    config.brand === "any"
                      ? "border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                      : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-500"
                  }`}
                >
                  Pas de préférence
                </button>
                {brands.map((brand) => (
                  <button
                    key={brand}
                    onClick={() => setConfig({ ...config, brand })}
                    className={`p-3 rounded-xl border-2 font-semibold transition ${
                      config.brand === brand
                        ? "border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                        : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-500"
                    }`}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ÉTAPE 4 : RÉSULTATS */}
          {currentStep === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
                Nos recommandations
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
                Les {recommendations.length} modèles les mieux adaptés à vos critères
              </p>

              {recommendations.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-xl">
                  <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    Aucun produit ne correspond à vos critères
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Essayez d'élargir votre budget ou de modifier vos critères.
                  </p>
                  <button
                    onClick={restart}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition"
                  >
                    Recommencer
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {recommendations.map((product, index) => {
                    const inStock = (product.stock || 0) > 0;
                    const specChips = [
                      product.specs?.processor,
                      product.specs?.ram,
                      product.specs?.storage,
                      product.specs?.graphics,
                    ].filter(Boolean).slice(0, 3);

                    return (
                      <div
                        key={product._id}
                        className={`relative rounded-xl border-2 overflow-hidden flex flex-col ${
                          index === 0
                            ? "border-blue-600 shadow-lg"
                            : "border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        {index === 0 && (
                          <div className="bg-blue-600 text-white text-xs font-bold uppercase tracking-wide px-4 py-1.5">
                            Meilleur choix
                          </div>
                        )}

                        <div className="flex gap-4 p-5 flex-1">
                          {/* Image */}
                          <Link
                            href={`/products/${product._id}`}
                            className="w-28 h-28 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700"
                          >
                            <img
                              src={getImageUrl(product)}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onError={(e) => { e.target.src = "/placeholder.jpg"; }}
                            />
                          </Link>

                          {/* Infos */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <Link href={`/products/${product._id}`}>
                                <h3 className="font-bold text-gray-900 dark:text-white leading-snug line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition">
                                  {product.name}
                                </h3>
                              </Link>
                              <span
                                className={`flex-shrink-0 text-xs font-bold px-2 py-1 rounded-full ${
                                  product.score >= 70
                                    ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                                    : product.score >= 40
                                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
                                      : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                                }`}
                              >
                                {product.score}%
                              </span>
                            </div>

                            <p className="text-xl font-extrabold text-blue-600 dark:text-blue-400 mt-1.5">
                              {formatPrice(product.price)}
                            </p>

                            {specChips.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {specChips.map((chip) => (
                                  <span
                                    key={chip}
                                    className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded truncate max-w-full"
                                  >
                                    {chip}
                                  </span>
                                ))}
                              </div>
                            )}

                            {product.reasons.length > 0 && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                {product.reasons.join(" · ")}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 px-5 pb-5">
                          <button
                            onClick={() => handleAddToCart(product)}
                            disabled={!inStock}
                            className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2 ${
                              inStock
                                ? "bg-blue-600 hover:bg-blue-700 text-white"
                                : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                            }`}
                          >
                            <FaShoppingCart />
                            {inStock ? "Ajouter au panier" : "Rupture de stock"}
                          </button>
                          <button
                            onClick={() => router.push(`/products/${product._id}`)}
                            className="px-4 py-2.5 rounded-xl font-semibold text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                          >
                            Détails
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {recommendations.length > 0 && (
                <div className="text-center mt-8">
                  <button
                    onClick={restart}
                    className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                  >
                    <FaArrowLeft size={12} /> Recommencer la configuration
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── Navigation ───────────────────────────────────────────── */}
          {currentStep < 4 && (
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
                disabled={currentStep === 1}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <FaArrowLeft size={13} /> Précédent
              </button>

              <button
                onClick={nextStep}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white transition"
              >
                {currentStep === 3 ? "Voir les recommandations" : "Suivant"}
                <FaArrowRight size={13} />
              </button>
            </div>
          )}
        </div>

        {/* ── Aide ─────────────────────────────────────────────────────── */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <FaInfoCircle className="text-blue-600 dark:text-blue-400 text-xl flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">Besoin d'aide ?</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Nos experts vous conseillent au{" "}
                <a href="tel:+221786346946" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                  +221 78 634 69 46
                </a>{" "}
                ou via notre{" "}
                <Link href="/contact" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                  page contact
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Configurator;
