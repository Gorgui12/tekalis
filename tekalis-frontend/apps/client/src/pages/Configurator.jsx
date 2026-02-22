import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../../../../packages/shared/redux/slices/cartSlice";
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
  FaSpinner
} from "react-icons/fa";
import { useToast } from '../../../../packages/shared/context/ToastContext';
import api from "../../../../packages/shared/api/api";

const Configurator = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();

  // États
  const [currentStep, setCurrentStep] = useState(1);
  const [config, setConfig] = useState({
    usage: "",
    budget: { min: 0, max: 0 },
    preferences: {
      brand: "",
      portability: "",
      category: ""
    }
  });
  const [allProducts, setAllProducts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Charger tous les produits au montage du composant
  useEffect(() => {
    fetchAllProducts();
  }, []);

const fetchAllProducts = async () => {
  try {
    setLoadingProducts(true);

    const { data } = await api.get("/products");

    // si ton backend renvoie { products: [...] }
    setAllProducts(data.products || data);

  } catch (error) {
    console.error("Erreur lors du chargement des produits:", error);
    toast.error(
      error.response?.data?.message || 
      "Impossible de charger les produits"
    );
  } finally {
    setLoadingProducts(false);
  }
};


  // Étape 1: Usage principal
  const usageOptions = [
    {
      id: "gaming",
      label: "Gaming",
      icon: <FaGamepad />,
      description: "Jeux vidéo haute performance, streaming",
      color: "from-purple-500 to-pink-500",
      requirements: ["GPU puissant", "Écran 120Hz+", "Refroidissement efficace"],
      keywords: ["gaming", "gamer", "rtx", "gtx", "jeu", "legion", "rog", "predator"]
    },
    {
      id: "work",
      label: "Travail / Bureau",
      icon: <FaBriefcase />,
      description: "Bureautique, multitâche, visioconférences",
      color: "from-blue-500 to-indigo-500",
      requirements: ["Processeur efficace", "RAM 16GB+", "SSD rapide"],
      keywords: ["business", "pro", "thinkpad", "latitude", "elitebook", "vostro"]
    },
    {
      id: "creation",
      label: "Création de contenu",
      icon: <FaPaintBrush />,
      description: "Montage vidéo, design graphique, 3D",
      color: "from-orange-500 to-red-500",
      requirements: ["GPU pour encodage", "RAM 32GB+", "Écran calibré"],
      keywords: ["creator", "studio", "precision", "zbook", "quadro", "workstation"]
    },
    {
      id: "student",
      label: "Étudiant",
      icon: <FaGraduationCap />,
      description: "Prise de notes, recherches, léger multimédia",
      color: "from-green-500 to-teal-500",
      requirements: ["Autonomie longue", "Portable léger", "Prix abordable"],
      keywords: ["vivobook", "ideapad", "inspiron", "aspire", "chromebook"]
    },
    {
      id: "multimedia",
      label: "Multimédia",
      icon: <FaDesktop />,
      description: "Netflix, navigation web, réseaux sociaux",
      color: "from-cyan-500 to-blue-500",
      requirements: ["Écran qualité", "Audio correct", "Autonomie moyenne"],
      keywords: ["entertainment", "media", "pavilion"]
    }
  ];

  // Étape 2: Budget (dynamique basé sur les prix réels)
  const budgetRanges = [
    { min: 0, max: 500000, label: "Moins de 500 000 FCFA", tier: "entry" },
    { min: 500000, max: 800000, label: "500 000 - 800 000 FCFA", tier: "mid" },
    { min: 800000, max: 1200000, label: "800 000 - 1 200 000 FCFA", tier: "high" },
    { min: 1200000, max: 2000000, label: "1 200 000 - 2 000 000 FCFA", tier: "premium" },
    { min: 2000000, max: 9999999, label: "Plus de 2 000 000 FCFA", tier: "ultra" }
  ];

  // Étape 3: Préférences (marques dynamiques)
  const brandOptions = [
    { id: "any", label: "Pas de préférence" },
    { id: "hp", label: "HP" },
    { id: "dell", label: "Dell" },
    { id: "lenovo", label: "Lenovo" },
    { id: "asus", label: "Asus" },
    { id: "acer", label: "Acer" },
    { id: "msi", label: "MSI" },
    { id: "apple", label: "Apple (MacBook)" },
    { id: "microsoft", label: "Microsoft Surface" }
  ];

  const portabilityOptions = [
    { id: "very_portable", label: "Très portable (< 1.5kg)", description: "Ultrabook, déplacements fréquents", weight: 1.5 },
    { id: "portable", label: "Portable (1.5-2.5kg)", description: "Bon équilibre mobilité/performance", weight: 2.5 },
    { id: "desktop_replacement", label: "Remplace un PC fixe (> 2.5kg)", description: "Performance maximale, peu mobile", weight: 10 }
  ];

  // Fonction de scoring intelligente
  const calculateProductScore = (product, config) => {
    let score = 0;
    const maxScore = 100;

    // 1. Score de budget (30 points)
    const price = product.price || 0;
    if (price >= config.budget.min && price <= config.budget.max) {
      score += 30;
    } else if (price < config.budget.min) {
      score += 15; // Moins cher peut être intéressant
    } else if (price <= config.budget.max * 1.1) {
      score += 20; // Légèrement au-dessus du budget
    }

    // 2. Score d'usage (40 points)
    const selectedUsage = usageOptions.find(u => u.id === config.usage);
    if (selectedUsage) {
      const productName = (product.name || '').toLowerCase();
      const productDesc = (product.description || '').toLowerCase();
      const productCategory = (product.category || '').toLowerCase();
      const combinedText = `${productName} ${productDesc} ${productCategory}`;

      // Vérifier les mots-clés
      const matchingKeywords = selectedUsage.keywords.filter(keyword => 
        combinedText.includes(keyword.toLowerCase())
      );
      
      score += (matchingKeywords.length / selectedUsage.keywords.length) * 40;

      // Bonus pour catégorie exacte
      if (config.usage === "gaming" && productCategory.includes("gaming")) {
        score += 10;
      }
      if (config.usage === "work" && (productCategory.includes("business") || productCategory.includes("pro"))) {
        score += 10;
      }
    }

    // 3. Score de marque (15 points)
    if (config.preferences.brand && config.preferences.brand !== "any") {
      const productBrand = (product.brand || product.name || '').toLowerCase();
      if (productBrand.includes(config.preferences.brand.toLowerCase())) {
        score += 15;
      }
    } else {
      score += 10; // Bonus si pas de préférence
    }

    // 4. Score de disponibilité (15 points)
    if (product.stock > 0) {
      score += 15;
    } else if (product.stock === 0) {
      score -= 20; // Pénalité forte si rupture
    }

    return Math.min(Math.round(score), maxScore);
  };

  // Générer les recommandations à partir des vrais produits
  const generateRecommendations = () => {
    setLoading(true);

    setTimeout(() => {
      // Filtrer et scorer les produits
      let filteredProducts = allProducts.filter(product => {
        // Filtre budget
        const inBudget = product.price >= config.budget.min && product.price <= config.budget.max * 1.2;
        
        // Filtre marque
        const brandMatch = !config.preferences.brand || 
                          config.preferences.brand === "any" ||
                          (product.brand || product.name || '').toLowerCase().includes(config.preferences.brand.toLowerCase());
        
        return inBudget && brandMatch;
      });

      // Calculer le score pour chaque produit
      const scoredProducts = filteredProducts.map(product => ({
        ...product,
        score: calculateProductScore(product, config),
        matchReason: generateMatchReason(product, config)
      }));

      // Trier par score et prendre les 5 meilleurs
      const topRecommendations = scoredProducts
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

      setRecommendations(topRecommendations);
      setLoading(false);
    }, 1500);
  };

  // Générer une explication du match
  const generateMatchReason = (product, config) => {
    const reasons = [];
    
    if (product.price >= config.budget.min && product.price <= config.budget.max) {
      reasons.push("Dans votre budget");
    }
    
    const selectedUsage = usageOptions.find(u => u.id === config.usage);
    if (selectedUsage) {
      const hasKeyword = selectedUsage.keywords.some(keyword => 
        (product.name || '').toLowerCase().includes(keyword)
      );
      if (hasKeyword) {
        reasons.push(`Optimisé pour ${selectedUsage.label.toLowerCase()}`);
      }
    }

    if (product.stock > 5) {
      reasons.push("En stock immédiat");
    }

    return reasons.join(" • ");
  };

  const handleAddToCart = (product) => {
    dispatch(addToCart({
      id: product._id || product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || product.image || '/placeholder.jpg',
      quantity: 1
    }));
    toast.success(`${product.name} ajouté au panier !`);
  };

  const nextStep = () => {
    if (currentStep === 1 && !config.usage) {
      toast.warning("Veuillez sélectionner un usage");
      return;
    }
    if (currentStep === 2 && config.budget.max === 0) {
      toast.warning("Veuillez sélectionner un budget");
      return;
    }

    
    if (currentStep === 3) {
      generateRecommendations();
    }
    
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(Math.max(1, currentStep - 1));
  };

  if (loadingProducts) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-6xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Chargement des produits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            🎯 Configurateur Intelligent
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Trouvez le PC parfait parmi <strong>{allProducts.length} produits</strong> disponibles
          </p>

          {/* Progress Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`flex items-center ${step < 4 ? 'flex-1' : ''}`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      currentStep >= step
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {currentStep > step ? <FaCheckCircle /> : step}
                  </div>
                  {step < 4 && (
                    <div
                      className={`h-1 flex-1 mx-2 ${
                        currentStep > step ? "bg-blue-600" : "bg-gray-200"
                      }`}
                    ></div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-600 mt-2">
              <span>Usage</span>
              <span>Budget</span>
              <span>Préférences</span>
              <span>Résultats</span>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* ÉTAPE 1: USAGE */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 text-center">
                Pour quel usage principal ?
              </h2>
              <p className="text-gray-600 text-center mb-8">
                Sélectionnez l'utilisation qui correspond le mieux à vos besoins
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {usageOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setConfig({ ...config, usage: option.id })}
                    className={`relative p-6 rounded-xl border-2 text-left transition-all hover:scale-105 ${
                      config.usage === option.id
                        ? "border-blue-600 bg-blue-50 shadow-lg"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <div className={`absolute top-0 left-0 w-full h-1 rounded-t-xl bg-gradient-to-r ${option.color}`}></div>
                    
                    <div className="flex items-start gap-4">
                      <div className={`text-4xl bg-gradient-to-r ${option.color} bg-clip-text text-transparent`}>
                        {option.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{option.label}</h3>
                        <p className="text-sm text-gray-600 mb-3">{option.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {option.requirements.map((req, idx) => (
                            <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                              {req}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {config.usage === option.id && (
                      <div className="absolute top-4 right-4">
                        <FaCheckCircle className="text-blue-600 text-2xl" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ÉTAPE 2: BUDGET */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 text-center">
                Quel est votre budget ?
              </h2>
              <p className="text-gray-600 text-center mb-8">
                {allProducts.length > 0 && (
                  <>Prix disponibles : {Math.min(...allProducts.map(p => p.price)).toLocaleString()} - {Math.max(...allProducts.map(p => p.price)).toLocaleString()} FCFA</>
                )}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                {budgetRanges.map((range) => {
                  const productsInRange = allProducts.filter(
                    p => p.price >= range.min && p.price <= range.max
                  ).length;

                  return (
                    <button
                      key={range.tier}
                      onClick={() => setConfig({ ...config, budget: range })}
                      className={`p-6 rounded-lg border-2 text-left transition ${
                        config.budget.min === range.min
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      <p className="font-bold text-lg text-gray-900 mb-2">{range.label}</p>
                      <p className="text-sm text-gray-600">
                        {productsInRange} produit{productsInRange > 1 ? 's' : ''} disponible{productsInRange > 1 ? 's' : ''}
                      </p>
                      {config.budget.min === range.min && (
                        <FaCheckCircle className="text-blue-600 text-xl mt-2" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ÉTAPE 3: PRÉFÉRENCES */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 text-center">
                Préférences supplémentaires
              </h2>
              <p className="text-gray-600 text-center mb-8">
                Affinez votre recherche (optionnel)
              </p>

              <div className="space-y-8">
                {/* Marque préférée */}
                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-4">
                    Marque préférée
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {brandOptions.map((brand) => (
                      <button
                        key={brand.id}
                        onClick={() => setConfig({ 
                          ...config, 
                          preferences: { ...config.preferences, brand: brand.id }
                        })}
                        className={`p-3 rounded-lg border-2 font-semibold transition ${
                          config.preferences.brand === brand.id
                            ? "border-blue-600 bg-blue-50 text-blue-600"
                            : "border-gray-200 text-gray-700 hover:border-blue-300"
                        }`}
                      >
                        {brand.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Portabilité */}
                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-4">
                    Portabilité
                  </label>
                  <div className="space-y-3">
                    {portabilityOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setConfig({ 
                          ...config, 
                          preferences: { ...config.preferences, portability: option.id }
                        })}
                        className={`w-full p-4 rounded-lg border-2 text-left transition ${
                          config.preferences.portability === option.id
                            ? "border-blue-600 bg-blue-50"
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        <p className="font-semibold text-gray-900 mb-1">{option.label}</p>
                        <p className="text-sm text-gray-600">{option.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ÉTAPE 4: RÉSULTATS */}
          {currentStep === 4 && (
            <div>
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Analyse de {allProducts.length} produits en cours...</p>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 text-center">
                    🎉 Nos recommandations pour vous
                  </h2>
                  <p className="text-gray-600 text-center mb-8">
                    {recommendations.length > 0 
                      ? `Voici les ${recommendations.length} meilleurs PC pour ${config.usage}` 
                      : "Aucun produit ne correspond exactement à vos critères"}
                  </p>

                  {recommendations.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <p className="text-xl text-gray-700 mb-4">😔 Aucun produit trouvé</p>
                      <p className="text-gray-600 mb-6">
                        Essayez d'élargir votre budget ou de modifier vos critères
                      </p>
                      <button
                        onClick={() => setCurrentStep(1)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
                      >
                        Recommencer
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {recommendations.map((product, index) => (
                        <div
                          key={product._id || product.id}
                          className={`border-2 rounded-lg p-6 ${
                            index === 0 ? "border-yellow-400 bg-yellow-50" : "border-gray-200"
                          }`}
                        >
                          {index === 0 && (
                            <div className="flex items-center gap-2 text-yellow-600 font-bold mb-4">
                              <span className="text-2xl">🏆</span>
                              <span>Meilleur choix pour vous</span>
                            </div>
                          )}

                          <div className="flex flex-col md:flex-row gap-6">
                            <div className="md:w-1/3">
                              <img 
                                src={product.images?.[0] || product.image || '/placeholder.jpg'} 
                                alt={product.name}
                                className="w-full aspect-video object-cover rounded-lg mb-4"
                                onError={(e) => e.target.src = '/placeholder.jpg'}
                              />
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Score de compatibilité</span>
                                <span className="text-2xl font-bold text-blue-600">{product.score}/100</span>
                              </div>
                              {product.matchReason && (
                                <p className="text-xs text-gray-600 mt-2">{product.matchReason}</p>
                              )}
                            </div>

                            <div className="md:w-2/3">
                              <h3 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h3>
                              <p className="text-3xl font-bold text-blue-600 mb-2">
                                {product.price?.toLocaleString()} FCFA
                              </p>
                              
                              {product.stock !== undefined && (
                                <p className={`text-sm font-semibold mb-4 ${
                                  product.stock > 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {product.stock > 0 ? `✓ En stock (${product.stock} unités)` : '✗ Rupture de stock'}
                                </p>
                              )}

                              {product.description && (
                                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                  {product.description}
                                </p>
                              )}

                              {/* Specs si disponibles */}
                              {product.specs && (
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                  {Object.entries(product.specs).slice(0, 4).map(([key, value]) => (
                                    <div key={key} className="bg-gray-50 rounded p-3">
                                      <p className="text-xs text-gray-600 capitalize">{key}</p>
                                      <p className="font-semibold text-sm">{value}</p>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Actions */}
                              <div className="flex gap-3 mt-4">
                                <button
                                  onClick={() => handleAddToCart(product)}
                                  disabled={product.stock === 0}
                                  className={`flex-1 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                                    product.stock > 0
                                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  }`}
                                >
                                  <FaShoppingCart />
                                  {product.stock > 0 ? 'Ajouter au panier' : 'Rupture de stock'}
                                </button>
                                <button
                                  onClick={() => navigate(`/product/${product._id || product.id}`)}
                                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold transition"
                                >
                                  Voir détails
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Recommencer */}
                  <div className="text-center mt-8">
                    <button
                      onClick={() => {
                        setCurrentStep(1);
                        setConfig({ usage: "", budget: { min: 0, max: 0 }, preferences: { brand: "", portability: "" }});
                        setRecommendations([]);
                      }}
                      className="text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      🔄 Recommencer la configuration
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          {currentStep < 4 && (
            <div className="flex justify-between mt-8 pt-8 border-t">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 text-gray-700 rounded-lg font-semibold transition"
              >
                <FaArrowLeft />
                Précédent
              </button>

              <button
                onClick={nextStep}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
              >
                {currentStep === 3 ? "Voir les recommandations" : "Suivant"}
                <FaArrowRight />
              </button>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <FaInfoCircle className="text-blue-600 text-2xl flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-gray-900 mb-2">💡 Besoin d'aide ?</h3>
              <p className="text-sm text-gray-700 mb-3">
                Notre configurateur analyse en temps réel <strong>{allProducts.length} produits</strong> disponibles 
                pour vous proposer les meilleurs PC adaptés à vos besoins.
              </p>
              <p className="text-sm text-gray-700">
                Contactez nos experts au <strong>+221 33 823 45 67</strong> ou via WhatsApp pour un conseil personnalisé.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Configurator;