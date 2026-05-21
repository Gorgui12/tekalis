import { Link } from "react-router-dom";
import { 
  FaLaptop, 
  FaMobileAlt, 
  FaGamepad, 
  FaCamera,
  FaDesktop,
  FaKeyboard,
  FaHeadphones,
  FaMouse,
  FaTv,
  FaTabletAlt,
  FaPrint,
  FaHdd
} from "react-icons/fa";

const CategoriesGrid = ({ categories, columns = 6, showAll = false }) => {
  // Catégories par défaut si non fournies
  const defaultCategories = [
    { 
      name: "Smartphones", 
      icon: <FaMobileAlt />, 
      slug: "smartphones", 
      color: "from-blue-500 to-cyan-500",
      count: 0
    },
    { 
      name: "Gaming", 
      icon: <FaGamepad />, 
      slug: "gaming", 
      color: "from-purple-500 to-pink-500",
      count: 0
    },
    { 
      name: "Home Cinema", 
      icon: <FaDesktop />, 
      slug: "home-cinema", 
      color: "from-red-500 to-orange-500",
      count: 0
    },
    { 
      name: "Caméras", 
      icon: <FaCamera />, 
      slug: "cameras", 
      color: "from-green-500 to-teal-500",
      count: 0
    },
    { 
      name: "Laptops", 
      icon: <FaLaptop />, 
      slug: "laptops", 
      color: "from-indigo-500 to-purple-500",
      count: 0
    },
    { 
      name: "Accessoires", 
      icon: <FaKeyboard />, 
      slug: "accessories", 
      color: "from-yellow-500 to-orange-500",
      count: 0
    },
    {
      name: "Audio",
      icon: <FaHeadphones />,
      slug: "audio",
      color: "from-pink-500 to-rose-500",
      count: 0
    },
    {
      name: "Périphériques",
      icon: <FaMouse />,
      slug: "peripherals",
      color: "from-teal-500 to-green-500",
      count: 0
    },
    {
      name: "Téléviseurs",
      icon: <FaTv />,
      slug: "tv",
      color: "from-blue-500 to-indigo-500",
      count: 0
    },
    {
      name: "Tablettes",
      icon: <FaTabletAlt />,
      slug: "tablets",
      color: "from-orange-500 to-red-500",
      count: 0
    },
    {
      name: "Imprimantes",
      icon: <FaPrint />,
      slug: "printers",
      color: "from-gray-500 to-gray-600",
      count: 0
    },
    {
      name: "Stockage",
      icon: <FaHdd />,
      slug: "storage",
      color: "from-cyan-500 to-blue-500",
      count: 0
    }
  ];

  const displayCategories = categories || defaultCategories;
  const categoriesToShow = showAll ? displayCategories : displayCategories.slice(0, columns);

  // Déterminer le nombre de colonnes en responsive
  const getGridCols = () => {
    if (columns <= 3) return "lg:grid-cols-3";
    if (columns <= 4) return "lg:grid-cols-4";
    if (columns <= 6) return "lg:grid-cols-6";
    return "lg:grid-cols-6";
  };

  return (
    <section className="container mx-auto px-4 py-8">
      <div className={`grid grid-cols-2 md:grid-cols-3 ${getGridCols()} gap-4`}>
        {categoriesToShow.map((category, index) => (
          <Link
            key={category.slug}
            to={`/category/${category.slug}`}
            className="group relative"
          >
            {/* Card avec gradient */}
            <div className={`bg-gradient-to-br ${category.color} rounded-lg shadow-md hover:shadow-xl transition-all duration-300 p-6 md:p-8 text-center text-white aspect-square flex flex-col items-center justify-center transform hover:scale-105`}>
              {/* Icône */}
              <div className="text-4xl md:text-5xl mb-3 group-hover:scale-110 transition-transform duration-300">
                {category.icon}
              </div>
              
              {/* Nom */}
              <h3 className="font-bold text-base md:text-lg mb-1">
                {category.name}
              </h3>
              
              {/* Compteur de produits (optionnel) */}
              {category.count > 0 && (
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                  {category.count} produits
                </span>
              )}

              {/* Badge "Nouveau" (optionnel) */}
              {category.isNew && (
                <div className="absolute top-2 right-2 bg-yellow-400 text-gray-900 px-2 py-1 rounded-full text-xs font-bold">
                  Nouveau
                </div>
              )}

              {/* Badge "Promo" (optionnel) */}
              {category.hasDeals && (
                <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                  Promo
                </div>
              )}
            </div>

            {/* Effet hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg transition-all duration-300 pointer-events-none"></div>
          </Link>
        ))}
      </div>

      {/* Bouton "Voir toutes les catégories" */}
      {!showAll && displayCategories.length > columns && (
        <div className="text-center mt-8">
          <Link
            to="/categories"
            className="inline-block bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-lg font-bold transition"
          >
            Voir toutes les catégories →
          </Link>
        </div>
      )}
    </section>
  );
};

// Export aussi les icônes disponibles
export const CategoryIcons = {
  FaLaptop,
  FaMobileAlt,
  FaGamepad,
  FaCamera,
  FaDesktop,
  FaKeyboard,
  FaHeadphones,
  FaMouse,
  FaTv,
  FaTabletAlt,
  FaPrint,
  FaHdd
};

export default CategoriesGrid;