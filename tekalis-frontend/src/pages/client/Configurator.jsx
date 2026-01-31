import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../../redux/slices/cartSlice";
import { 
  FaCheckCircle, 
  FaArrowRight, 
  FaArrowLeft,
  FaLaptop,
  FaGamepad,
  FaBriefcase,
  FaPaintBrush,
  FaGraduationCap,
  FaDesktop,
  FaInfoCircle,
  FaShoppingCart
} from "react-icons/fa";

const Configurator = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // États
  const [currentStep, setCurrentStep] = useState(1);
  const [config, setConfig] = useState({
    usage: "",
    budget: { min: 0, max: 0 },
    preferences: {
      brand: "",
      portability: "",
      upgradeability: ""
    }
  });
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  // Étape 1: Usage principal
  const usageOptions = [
    {
      id: "gaming",
      label: "Gaming",
      icon: <FaGamepad />,
      description: "Jeux vidéo haute performance, streaming",
      color: "from-purple-500 to-pink-500",
      requirements: ["GPU puissant", "Écran 120Hz+", "Refroidissement efficace"]
    },
    {
      id: "work",
      label: "Travail / Bureau",
      icon: <FaBriefcase />,
      description: "Bureautique, multitâche, visioconférences",
      color: "from-blue-500 to-indigo-500",
      requirements: ["Processeur efficace", "RAM 16GB+", "SSD rapide"]
    },
    {
      id: "creation",
      label: "Création de contenu",
      icon: <FaPaintBrush />,
      description: "Montage vidéo, design graphique, 3D",
      color: "from-orange-500 to-red-500",
      requirements: ["GPU pour encodage", "RAM 32GB+", "Écran calibré"]
    },
    {
      id: "student",
      label: "Étudiant",
      icon: <FaGraduationCap />,
      description: "Prise de notes, recherches, léger multimédia",
      color: "from-green-500 to-teal-500",
      requirements: ["Autonomie longue", "Portable léger", "Prix abordable"]
    },
    {
      id: "multimedia",
      label: "Multimédia",
      icon: <FaDesktop />,
      description: "Netflix, navigation web, réseaux sociaux",
      color: "from-cyan-500 to-blue-500",
      requirements: ["Écran qualité", "Audio correct", "Autonomie moyenne"]
    }
  ];

  // Étape 2: Budget
  const budgetRanges = [
    { min: 0, max: 500000, label: "Moins de 500 000 FCFA", tier: "entry" },
    { min: 500000, max: 800000, label: "500 000 - 800 000 FCFA", tier: "mid" },
    { min: 800000, max: 1200000, label: "800 000 - 1 200 000 FCFA", tier: "high" },
    { min: 1200000, max: 2000000, label: "1 200 000 - 2 000 000 FCFA", tier: "premium" },
    { min: 2000000, max: 9999999, label: "Plus de 2 000 000 FCFA", tier: "ultra" }
  ];

  // Étape 3: Préférences
  const brandOptions = [
    { id: "any", label: "Pas de préférence" },
    { id: "hp", label: "HP" },
    { id: "dell", label: "Dell" },
    { id: "lenovo", label: "Lenovo" },
    { id: "asus", label: "Asus" },
    { id: "acer", label: "Acer" },
    { id: "msi", label: "MSI" },
    { id: "apple", label: "Apple (MacBook)" }
  ];

  const portabilityOptions = [
    { id: "very_portable", label: "Très portable (< 1.5kg)", description: "Ultrabook, déplacements fréquents" },
    { id: "portable", label: "Portable (1.5-2.5kg)", description: "Bon équilibre mobilité/performance" },
    { id: "desktop_replacement", label: "Remplace un PC fixe (> 2.5kg)", description: "Performance maximale, peu mobile" }
  ];

  // Générer les recommandations
  const generateRecommendations = () => {
    setLoading(true);

    // Simulation d'appel API
    setTimeout(() => {
      const recs = getRecommendationsBasedOnConfig();
      setRecommendations(recs);
      setLoading(false);
    }, 1500);
  };

  const getRecommendationsBasedOnConfig = () => {
    // Logique simplifiée de recommandations
    const products = [
      {
        id: "1",
        name: "HP Pavilion Gaming 15",
        price: 650000,
        image: "/products/hp-pavilion.jpg",
        specs: {
          processor: "Intel Core i5-12450H",
          ram: "16GB DDR4",
          storage: "512GB SSD",
          gpu: "NVIDIA GTX 1650",
          screen: "15.6\" FHD 144Hz"
        },
        score: 0,
        pros: ["Prix attractif", "GPU correct", "Écran 144Hz"],
        cons: ["Autonomie limitée", "Plastique"],
        usage: ["gaming", "student"],
        budgetTier: ["entry", "mid"]
      },
      {
        id: "2",
        name: "Dell XPS 13 Plus",
        price: 1450000,
        image: "/products/dell-xps.jpg",
        specs: {
          processor: "Intel Core i7-1360P",
          ram: "16GB LPDDR5",
          storage: "512GB SSD",
          gpu: "Intel Iris Xe",
          screen: "13.4\" OLED 3K"
        },
        score: 0,
        pros: ["Design premium", "Écran OLED", "Très portable"],
        cons: ["Prix élevé", "Pas pour gaming"],
        usage: ["work", "creation", "student"],
        budgetTier: ["premium"]
      },
      {
        id: "3",
        name: "Lenovo Legion 5 Pro",
        price: 1850000,
        image: "/products/lenovo-legion.jpg",
        specs: {
          processor: "AMD Ryzen 7 7735H",
          ram: "32GB DDR5",
          storage: "1TB SSD",
          gpu: "NVIDIA RTX 4070",
          screen: "16\" WQXGA 165Hz"
        },
        score: 0,
        pros: ["RTX 4070", "32GB RAM", "Écran 16:10"],
        cons: ["Lourd (2.5kg)", "Prix"],
        usage: ["gaming", "creation"],
        budgetTier: ["premium", "ultra"]
      },
      {
        id: "4",
        name: "Asus Vivobook 15",
        price: 425000,
        image: "/products/asus-vivobook.jpg",
        specs: {
          processor: "AMD Ryzen 5 5500U",
          ram: "8GB DDR4",
          storage: "256GB SSD",
          gpu: "AMD Radeon Graphics",
          screen: "15.6\" FHD"
        },
        score: 0,
        pros: ["Prix abordable", "Autonomie correcte", "Léger"],
        cons: ["8GB RAM", "GPU intégré"],
        usage: ["student", "multimedia", "work"],
        budgetTier: ["entry"]
      },
      {
        id: "5",
        name: "MacBook Air M2",
        price: 1650000,
        image: "/products/macbook-air.jpg",
        specs: {
          processor: "Apple M2",
          ram: "16GB Unified",
          storage: "512GB SSD",
          gpu: "Apple M2 GPU",
          screen: "13.6\" Liquid Retina"
        },
        score: 0,
        pros: ["Puce M2 efficace", "Autonomie 18h", "Silent"],
        cons: ["macOS uniquement", "Pas gaming"],
        usage: ["work", "creation", "student"],
        budgetTier: ["premium"]
      }
    ];

    // Calculer le score pour chaque produit
    return products
      .map(product => {
        let score = 0;

        // Score usage
        if (product.usage.includes(config.usage)) {
          score += 40;
        }

        // Score budget
        if (product.price >= config.budget.min && product.price <= config.budget.max) {
          score += 30;
        } else if (product.price < config.budget.min) {
          score += 10;
        }

        // Score préférences marque
        if (config.preferences.brand === "any" || 
            product.name.toLowerCase().includes(config.preferences.brand)) {
          score += 10;
        }

        // Score portabilité
        const weight = parseFloat(product.name.includes("Legion") ? 2.5 : 
                                 product.name.includes("MacBook") || product.name.includes("XPS") ? 1.3 : 2.0);
        if (config.preferences.portability === "very_portable" && weight < 1.5) score += 10;
        else if (config.preferences.portability === "portable" && weight >= 1.5 && weight <= 2.5) score += 10;
        else if (config.preferences.portability === "desktop_replacement" && weight > 2.5) score += 10;

        return { ...product, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3); // Top 3
  };

  // Navigation
  const nextStep = () => {
    if (currentStep === 1 && !config.usage) {
      alert("Veuillez sélectionner un usage");
      return;
    }
    if (currentStep === 2 && config.budget.min === 0) {
      alert("Veuillez sélectionner un budget");
      return;
    }

    if (currentStep === 3) {
      generateRecommendations();
    }

    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Ajouter au panier
  const handleAddToCart = (product) => {
    dispatch(addToCart({
      _id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      stock: 10
    }));
    alert(`${product.name} ajouté au panier !`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 mt-20">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            🖥️ Configurateur PC
          </h1>
          <p className="text-xl text-gray-600">
            Trouvez le PC parfait en 3 étapes simples
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition ${
                    currentStep > step
                      ? "bg-green-500 text-white"
                      : currentStep === step
                      ? "bg-blue-600 text-white"
                      : "bg-gray-300 text-gray-600"
                  }`}>
                    {currentStep > step ? <FaCheckCircle /> : step}
                  </div>
                  <span className={`text-sm mt-2 font-semibold ${
                    currentStep >= step ? "text-gray-900" : "text-gray-500"
                  }`}>
                    Étape {step}
                  </span>
                </div>
                {step < 3 && (
                  <div className={`w-24 h-1 mx-2 ${
                    currentStep > step ? "bg-green-500" : "bg-gray-300"
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-xl p-8 md:p-12">
          {/* ÉTAPE 1: USAGE */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 text-center">
                1. Quel est votre usage principal ?
              </h2>
              <p className="text-gray-600 text-center mb-8">
                Sélectionnez l'usage qui correspond le mieux à vos besoins
              </p>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {usageOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setConfig({ ...config, usage: option.id })}
                    className={`p-6 rounded-lg border-2 transition transform hover:scale-105 ${
                      config.usage === option.id
                        ? "border-blue-600 bg-blue-50 shadow-lg"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <div className={`text-5xl mb-4 bg-gradient-to-br ${option.color} text-transparent bg-clip-text`}>
                      {option.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {option.label}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {option.description}
                    </p>
                    <div className="text-xs text-left space-y-1">
                      {option.requirements.map((req, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-gray-500">
                          <FaCheckCircle className="text-green-500" size={12} />
                          {req}
                        </div>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ÉTAPE 2: BUDGET */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 text-center">
                2. Quel est votre budget ?
              </h2>
              <p className="text-gray-600 text-center mb-8">
                Définissez votre fourchette de prix
              </p>

              {/* Slider Budget */}
              <div className="max-w-3xl mx-auto mb-8">
                <div className="bg-gray-100 rounded-lg p-8">
                  <div className="text-center mb-6">
                    <p className="text-sm text-gray-600 mb-2">Budget sélectionné</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {config.budget.min > 0 
                        ? `${config.budget.min.toLocaleString()} - ${config.budget.max.toLocaleString()} FCFA`
                        : "Sélectionnez une fourchette"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Budget Options */}
              <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                {budgetRanges.map((range, index) => (
                  <button
                    key={index}
                    onClick={() => setConfig({ ...config, budget: range })}
                    className={`p-6 rounded-lg border-2 transition text-left ${
                      config.budget.min === range.min
                        ? "border-blue-600 bg-blue-50 shadow-lg"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <p className="text-lg font-bold text-gray-900 mb-1">
                      {range.label}
                    </p>
                    <p className="text-sm text-gray-500">
                      {range.tier === "entry" && "Entrée de gamme - Usage basique"}
                      {range.tier === "mid" && "Milieu de gamme - Polyvalent"}
                      {range.tier === "high" && "Haut de gamme - Performance"}
                      {range.tier === "premium" && "Premium - Excellence"}
                      {range.tier === "ultra" && "Ultra - Sans compromis"}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ÉTAPE 3: PRÉFÉRENCES */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 text-center">
                3. Vos préférences (optionnel)
              </h2>
              <p className="text-gray-600 text-center mb-8">
                Affinez votre recherche selon vos préférences
              </p>

              <div className="max-w-3xl mx-auto space-y-8">
                {/* Marque */}
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
                        className={`p-4 rounded-lg border-2 font-semibold transition ${
                          config.preferences.brand === brand.id
                            ? "border-blue-600 bg-blue-50"
                            : "border-gray-200 hover:border-blue-300"
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
                    Niveau de portabilité
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
                  <p className="text-gray-600">Analyse de vos besoins en cours...</p>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 text-center">
                    🎉 Nos recommandations pour vous
                  </h2>
                  <p className="text-gray-600 text-center mb-8">
                    Voici les {recommendations.length} PC qui correspondent le mieux à vos critères
                  </p>

                  <div className="space-y-6">
                    {recommendations.map((product, index) => (
                      <div
                        key={product.id}
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
                            <div className="aspect-video bg-gray-200 rounded-lg mb-4"></div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Score de compatibilité</span>
                              <span className="text-2xl font-bold text-blue-600">{product.score}/100</span>
                            </div>
                          </div>

                          <div className="md:w-2/3">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h3>
                            <p className="text-3xl font-bold text-blue-600 mb-4">
                              {product.price.toLocaleString()} FCFA
                            </p>

                            {/* Specs */}
                            <div className="grid grid-cols-2 gap-3 mb-4">
                              <div className="bg-gray-50 rounded p-3">
                                <p className="text-xs text-gray-600">Processeur</p>
                                <p className="font-semibold text-sm">{product.specs.processor}</p>
                              </div>
                              <div className="bg-gray-50 rounded p-3">
                                <p className="text-xs text-gray-600">RAM</p>
                                <p className="font-semibold text-sm">{product.specs.ram}</p>
                              </div>
                              <div className="bg-gray-50 rounded p-3">
                                <p className="text-xs text-gray-600">Stockage</p>
                                <p className="font-semibold text-sm">{product.specs.storage}</p>
                              </div>
                              <div className="bg-gray-50 rounded p-3">
                                <p className="text-xs text-gray-600">GPU</p>
                                <p className="font-semibold text-sm">{product.specs.gpu}</p>
                              </div>
                            </div>

                            {/* Pros/Cons */}
                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <p className="font-semibold text-sm text-green-700 mb-2">✓ Points forts</p>
                                <ul className="text-sm space-y-1">
                                  {product.pros.map((pro, idx) => (
                                    <li key={idx} className="text-gray-700">• {pro}</li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <p className="font-semibold text-sm text-orange-700 mb-2">⚠ Points faibles</p>
                                <ul className="text-sm space-y-1">
                                  {product.cons.map((con, idx) => (
                                    <li key={idx} className="text-gray-700">• {con}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                              <button
                                onClick={() => handleAddToCart(product)}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                              >
                                <FaShoppingCart />
                                Ajouter au panier
                              </button>
                              <button
                                onClick={() => navigate(`/product/${product.id}`)}
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

                  {/* Recommencer */}
                  <div className="text-center mt-8">
                    <button
                      onClick={() => {
                        setCurrentStep(1);
                        setConfig({ usage: "", budget: { min: 0, max: 0 }, preferences: { brand: "", portability: "" }});
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
                Notre configurateur utilise vos réponses pour vous proposer les PC les mieux adaptés. 
                Les recommandations sont basées sur la performance, le prix et la compatibilité avec votre usage.
              </p>
              <p className="text-sm text-gray-700">
                Vous pouvez aussi contacter notre équipe d'experts au <strong>+221 33 823 45 67</strong> ou via WhatsApp pour un conseil personnalisé.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Configurator;