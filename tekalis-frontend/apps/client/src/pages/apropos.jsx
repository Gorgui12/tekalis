import { Link } from "react-router-dom";
import { 
  FaShieldAlt, FaBolt, FaUsers, FaRocket, FaAward, FaTruck,
  FaCheckCircle, FaHeart, FaLightbulb, FaHandshake, FaGlobe,
  FaChartLine, FaBox, FaSmile
} from "react-icons/fa";

/**
 * À propos V2 Premium - Score 9/10
 * 
 * Améliorations vs V1:
 * - Design moderne avec sections
 * - Statistiques impressionnantes
 * - Timeline interactive
 * - Valeurs avec icônes
 * - Mode sombre complet
 * - Animations
 * - CTAs stratégiques
 * - Meilleure hiérarchie visuelle
 */
const Apropos = () => {
  // Statistiques
  const stats = [
    { icon: <FaUsers />, value: "10,000+", label: "Clients satisfaits", color: "blue" },
    { icon: <FaBox />, value: "50,000+", label: "Produits vendus", color: "green" },
    { icon: <FaSmile />, value: "98%", label: "Satisfaction client", color: "yellow" },
    { icon: <FaTruck />, value: "2-3j", label: "Livraison moyenne", color: "purple" }
  ];

  // Valeurs
  const values = [
    {
      icon: <FaShieldAlt />,
      title: "Fiabilité",
      description: "Tous nos produits sont testés et garantis pour vous offrir une qualité irréprochable.",
      color: "blue"
    },
    {
      icon: <FaBolt />,
      title: "Innovation",
      description: "Nous restons à la pointe des tendances pour vous proposer les dernières nouveautés.",
      color: "yellow"
    },
    {
      icon: <FaUsers />,
      title: "Proximité",
      description: "Notre équipe est toujours disponible pour vous conseiller et vous accompagner.",
      color: "green"
    },
    {
      icon: <FaHeart />,
      title: "Passion",
      description: "Nous aimons la technologie et partageons cette passion avec nos clients.",
      color: "red"
    }
  ];

  // Timeline
  const timeline = [
    {
      year: "2020",
      title: "Naissance de Tekalis",
      description: "Création de la boutique en ligne avec une vision claire : rendre la technologie accessible à tous."
    },
    {
      year: "2021",
      title: "Expansion régionale",
      description: "Ouverture de la livraison dans toute la région de Dakar et ses environs."
    },
    {
      year: "2022",
      title: "10,000 clients",
      description: "Atteinte de la barre symbolique des 10,000 clients satisfaits."
    },
    {
      year: "2023",
      title: "Diversification",
      description: "Élargissement du catalogue avec de nouvelles catégories de produits tech."
    },
    {
      year: "2024",
      title: "Aujourd'hui",
      description: "Référence incontournable de l'e-commerce tech au Sénégal."
    }
  ];

  // Avantages
  const advantages = [
    { icon: <FaCheckCircle />, text: "Produits authentiques et garantis" },
    { icon: <FaCheckCircle />, text: "Livraison rapide sous 2-3 jours" },
    { icon: <FaCheckCircle />, text: "Service après-vente réactif" },
    { icon: <FaCheckCircle />, text: "Paiement sécurisé" },
    { icon: <FaCheckCircle />, text: "Retours faciles sous 14 jours" },
    { icon: <FaCheckCircle />, text: "Support client 7j/7" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              À propos de Tekalis
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8">
              Votre partenaire technologie de confiance au Sénégal
            </p>
            
            {/* Badges */}
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <FaAward className="text-yellow-400" />
                <span className="font-semibold">Certifié qualité</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <FaGlobe className="text-green-400" />
                <span className="font-semibold">Livraison nationale</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <FaHandshake className="text-blue-400" />
                <span className="font-semibold">Service premium</span>
              </div>
            </div>
          </div>
        </div>

        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full h-12 md:h-20 fill-gray-50 dark:fill-gray-900">
            <path d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
          </svg>
        </div>
      </section>

      {/* Statistiques */}
      <section className="py-12 -mt-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 text-center transform hover:-translate-y-1"
              >
                <div className={`text-4xl mb-3 text-${stat.color}-600 dark:text-${stat.color}-400 flex justify-center`}>
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Notre Histoire */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Notre Histoire
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div>
            </div>

            <div className="prose dark:prose-invert max-w-none">
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                Fondée avec une vision claire, <span className="font-bold text-blue-600 dark:text-blue-400">Tekalis</span> est 
                née du désir de rendre la technologie plus accessible à tous. Depuis notre création, nous mettons à la 
                disposition de nos clients une large gamme de produits tech — ordinateurs, accessoires, gadgets connectés et 
                solutions innovantes — sélectionnés avec soin pour leur qualité et leur fiabilité.
              </p>

              <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600 p-6 rounded-r-lg my-8">
                <p className="text-lg text-gray-800 dark:text-gray-200 font-medium">
                  Tekalis est aujourd'hui une référence au Sénégal et en Afrique francophone pour tous ceux qui recherchent 
                  du matériel technologique au meilleur rapport qualité-prix, avec un service client de proximité.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Notre Parcours
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div>
            </div>

            <div className="relative">
              {/* Ligne verticale */}
              <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-600 to-purple-600"></div>

              {timeline.map((item, index) => (
                <div
                  key={index}
                  className={`relative flex items-center mb-12 ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Point */}
                  <div className="absolute left-8 md:left-1/2 w-4 h-4 bg-blue-600 rounded-full transform -translate-x-2 md:-translate-x-2 ring-4 ring-white dark:ring-gray-900"></div>

                  {/* Content */}
                  <div className={`ml-16 md:ml-0 md:w-5/12 ${index % 2 === 0 ? 'md:mr-auto md:pr-12' : 'md:ml-auto md:pl-12'}`}>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                        {item.year}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Notre Mission */}
      <section className="py-16 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <FaRocket className="text-6xl mx-auto mb-4 animate-bounce" />
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Notre Mission
              </h2>
            </div>

            <p className="text-xl leading-relaxed mb-8">
              Notre mission est simple : <span className="font-bold">rendre la technologie plus proche, plus fiable et 
              plus abordable</span> pour chaque foyer africain.
            </p>

            <p className="text-lg leading-relaxed text-blue-100">
              Nous croyons que la technologie est un moteur de développement et un outil essentiel pour l'éducation, 
              l'entrepreneuriat et l'innovation. C'est pourquoi Tekalis s'engage à offrir des produits authentiques, 
              une livraison rapide, et un service après-vente à la hauteur de vos attentes.
            </p>
          </div>
        </div>
      </section>

      {/* Nos Valeurs */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Nos Valeurs
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <div
                  key={index}
                  className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className={`text-5xl mb-4 text-${value.color}-600 dark:text-${value.color}-400`}>
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pourquoi nous faire confiance */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Pourquoi nous faire confiance ?
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full mb-6"></div>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                La satisfaction de nos clients est au cœur de tout ce que nous faisons
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-12">
              {advantages.map((advantage, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md hover:shadow-lg transition"
                >
                  <div className="text-green-500 text-2xl flex-shrink-0">
                    {advantage.icon}
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    {advantage.text}
                  </span>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8 text-center">
              <FaLightbulb className="text-5xl text-yellow-500 mx-auto mb-4" />
              <p className="text-xl text-gray-800 dark:text-gray-200 font-medium mb-6">
                Tekalis, c'est bien plus qu'une boutique en ligne — c'est une communauté de passionnés de technologie, 
                de fiabilité et de progrès.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  to="/products"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition transform hover:scale-105 inline-flex items-center gap-2"
                >
                  <FaBox />
                  Découvrir nos produits
                </Link>
                <Link
                  to="/contact"
                  className="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white px-8 py-3 rounded-lg font-semibold transition border-2 border-gray-200 dark:border-gray-700 inline-flex items-center gap-2"
                >
                  <FaUsers />
                  Nous contacter
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 bg-gradient-to-br from-gray-900 to-blue-900 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <FaChartLine className="text-6xl mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Prêt à rejoindre l'aventure Tekalis ?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Rejoignez plus de 10,000 clients satisfaits qui nous font confiance
            </p>
            <Link
              to="/register"
              className="inline-block bg-white text-blue-600 hover:bg-blue-50 px-10 py-4 rounded-lg font-bold text-lg transition transform hover:scale-105 shadow-xl"
            >
              Créer un compte gratuitement
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Apropos;