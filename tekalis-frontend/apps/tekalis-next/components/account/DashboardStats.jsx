import { FaShoppingBag, FaHeart, FaShieldAlt, FaTools } from "react-icons/fa";

/**
 * DashboardStats — Statistiques du tableau de bord utilisateur
 * Props:
 *   stats: { orders, wishlist, warranties, rma }
 *   loading: boolean
 */
const DashboardStats = ({ stats = {}, loading = false }) => {
  const {
    orders = 0,
    wishlist = 0,
    warranties = 0,
    rma = 0
  } = stats;

  const cards = [
    {
      label: "Commandes",
      value: orders,
      icon: <FaShoppingBag />,
      color: "bg-brand-100 text-brand-600",
      gradient: "from-brand-500 to-amber-600",
      description: "Total de vos commandes"
    },
    {
      label: "Favoris",
      value: wishlist,
      icon: <FaHeart />,
      color: "bg-red-100 text-red-500",
      gradient: "from-red-400 to-pink-500",
      description: "Produits sauvegardés"
    },
    {
      label: "Garanties actives",
      value: warranties,
      icon: <FaShieldAlt />,
      color: "bg-green-100 text-green-600",
      gradient: "from-green-500 to-emerald-600",
      description: "Garanties en cours"
    },
    {
      label: "SAV en cours",
      value: rma,
      icon: <FaTools />,
      color: "bg-orange-100 text-orange-600",
      gradient: "from-orange-400 to-orange-600",
      description: "Demandes SAV ouvertes"
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-surface-800 rounded-2xl shadow-card p-6 animate-pulse">
            <div className="w-12 h-12 bg-surface-200 dark:bg-surface-700 rounded-2xl mb-4" />
            <div className="h-3 bg-surface-200 dark:bg-surface-700 rounded w-2/3 mb-2" />
            <div className="h-7 bg-surface-200 dark:bg-surface-700 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="bg-white dark:bg-surface-800 rounded-2xl shadow-card hover:shadow-elevated transition-all p-5 group overflow-hidden relative"
        >
          {/* Fond décoratif */}
          <div className={`absolute -top-4 -right-4 w-20 h-20 rounded-full bg-gradient-to-br ${card.gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />

          {/* Icône */}
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-4 ${card.color} text-lg`}>
            {card.icon}
          </div>

          {/* Label */}
          <p className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wide mb-1">
            {card.label}
          </p>

          {/* Valeur */}
          <p className="text-3xl font-bold text-surface-900 dark:text-white">
            {card.value}
          </p>

          {/* Description */}
          <p className="text-xs text-surface-400 dark:text-surface-500 mt-1">
            {card.description}
          </p>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
