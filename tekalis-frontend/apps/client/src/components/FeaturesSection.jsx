import { 
  FaTruck, 
  FaShieldAlt, 
  FaHeadset, 
  FaCreditCard,
  FaUndo,
  FaAward,
  FaLock,
  FaGift
} from "react-icons/fa";

const FeaturesSection = ({ features, layout = "grid", theme = "light" }) => {
  // Features par défaut si non fournis
  const defaultFeatures = [
    {
      icon: <FaTruck />,
      title: "Livraison rapide",
      description: "Livraison gratuite à Dakar sous 2-3 jours ouvrés",
      color: "blue"
    },
    {
      icon: <FaShieldAlt />,
      title: "Garantie constructeur",
      description: "Tous nos produits sont garantis 12 mois minimum",
      color: "green"
    },
    {
      icon: <FaHeadset />,
      title: "Support 24/7",
      description: "Notre équipe est disponible pour vous aider à tout moment",
      color: "purple"
    },
    {
      icon: <FaCreditCard />,
      title: "Paiement sécurisé",
      description: "Wave, OM, Free Money ou paiement à la livraison",
      color: "orange"
    }
  ];

  const displayFeatures = features || defaultFeatures;

  // Couleurs par thème
  const colorVariants = {
    blue: {
      bg: "bg-blue-100",
      text: "text-blue-600",
      hover: "group-hover:bg-blue-200"
    },
    green: {
      bg: "bg-green-100",
      text: "text-green-600",
      hover: "group-hover:bg-green-200"
    },
    purple: {
      bg: "bg-purple-100",
      text: "text-purple-600",
      hover: "group-hover:bg-purple-200"
    },
    orange: {
      bg: "bg-orange-100",
      text: "text-orange-600",
      hover: "group-hover:bg-orange-200"
    },
    red: {
      bg: "bg-red-100",
      text: "text-red-600",
      hover: "group-hover:bg-red-200"
    },
    yellow: {
      bg: "bg-yellow-100",
      text: "text-yellow-600",
      hover: "group-hover:bg-yellow-200"
    }
  };

  // Layout grid (défaut)
  if (layout === "grid") {
    return (
      <section className={`py-12 ${theme === "dark" ? "bg-gray-900" : "bg-white"}`}>
        <div className="container mx-auto px-4">
          <div className={`grid sm:grid-cols-2 lg:grid-cols-${Math.min(displayFeatures.length, 4)} gap-6 md:gap-8`}>
            {displayFeatures.map((feature, index) => {
              const colors = colorVariants[feature.color] || colorVariants.blue;
              
              return (
                <div key={index} className="text-center group">
                  <div className={`${colors.bg} ${colors.hover} rounded-full w-16 h-16 md:w-20 md:h-20 flex items-center justify-center mx-auto mb-4 transition-all transform group-hover:scale-110`}>
                    <div className={`${colors.text} text-2xl md:text-3xl`}>
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className={`font-bold mb-2 text-base md:text-lg ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    {feature.title}
                  </h3>
                  <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  // Layout horizontal
  if (layout === "horizontal") {
    return (
      <section className={`py-8 ${theme === "dark" ? "bg-gray-900" : "bg-gray-50"}`}>
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-8 md:gap-12">
            {displayFeatures.map((feature, index) => {
              const colors = colorVariants[feature.color] || colorVariants.blue;
              
              return (
                <div key={index} className="flex items-center gap-3 group">
                  <div className={`${colors.bg} ${colors.hover} rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0 transition-all`}>
                    <div className={`${colors.text} text-xl`}>
                      {feature.icon}
                    </div>
                  </div>
                  <div>
                    <h3 className={`font-bold text-sm ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                      {feature.title}
                    </h3>
                    <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  // Layout cards
  if (layout === "cards") {
    return (
      <section className={`py-12 ${theme === "dark" ? "bg-gray-900" : "bg-gray-50"}`}>
        <div className="container mx-auto px-4">
          <div className={`grid sm:grid-cols-2 lg:grid-cols-${Math.min(displayFeatures.length, 4)} gap-6`}>
            {displayFeatures.map((feature, index) => {
              const colors = colorVariants[feature.color] || colorVariants.blue;
              
              return (
                <div 
                  key={index} 
                  className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md hover:shadow-xl transition-all p-6 group`}
                >
                  <div className={`${colors.bg} ${colors.hover} rounded-full w-14 h-14 flex items-center justify-center mb-4 transition-all transform group-hover:scale-110`}>
                    <div className={`${colors.text} text-2xl`}>
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className={`font-bold mb-2 text-lg ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    {feature.title}
                  </h3>
                  <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  return null;
};

// Export aussi les icônes disponibles pour faciliter l'utilisation
export const FeatureIcons = {
  FaTruck,
  FaShieldAlt,
  FaHeadset,
  FaCreditCard,
  FaUndo,
  FaAward,
  FaLock,
  FaGift
};

export default FeaturesSection;