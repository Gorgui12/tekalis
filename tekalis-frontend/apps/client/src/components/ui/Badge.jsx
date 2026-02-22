const Badge = ({
  children,
  variant = "default", // default, primary, success, danger, warning, info
  size = "medium", // small, medium, large
  rounded = "default", // default, full, none
  dot = false,
  icon,
  onRemove,
  className = ""
}) => {
  // Variantes de couleurs
  const variantClasses = {
    default: "bg-gray-100 text-gray-800 border border-gray-300",
    primary: "bg-blue-100 text-blue-800 border border-blue-300",
    success: "bg-green-100 text-green-800 border border-green-300",
    danger: "bg-red-100 text-red-800 border border-red-300",
    warning: "bg-yellow-100 text-yellow-800 border border-yellow-300",
    info: "bg-cyan-100 text-cyan-800 border border-cyan-300",
    purple: "bg-purple-100 text-purple-800 border border-purple-300",
    pink: "bg-pink-100 text-pink-800 border border-pink-300"
  };

  // Couleurs des dots
  const dotColors = {
    default: "bg-gray-500",
    primary: "bg-blue-500",
    success: "bg-green-500",
    danger: "bg-red-500",
    warning: "bg-yellow-500",
    info: "bg-cyan-500",
    purple: "bg-purple-500",
    pink: "bg-pink-500"
  };

  // Tailles
  const sizeClasses = {
    small: "px-2 py-0.5 text-xs",
    medium: "px-2.5 py-1 text-sm",
    large: "px-3 py-1.5 text-base"
  };

  const dotSizes = {
    small: "w-1.5 h-1.5",
    medium: "w-2 h-2",
    large: "w-2.5 h-2.5"
  };

  // Arrondis
  const roundedClasses = {
    none: "rounded-none",
    default: "rounded",
    full: "rounded-full"
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-semibold
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${roundedClasses[rounded]}
        ${className}
      `}
    >
      {/* Dot indicator */}
      {dot && (
        <span
          className={`${dotColors[variant]} ${dotSizes[size]} rounded-full`}
        ></span>
      )}

      {/* Icon */}
      {icon && <span className="flex-shrink-0">{icon}</span>}

      {/* Content */}
      <span>{children}</span>

      {/* Remove button */}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 hover:bg-black hover:bg-opacity-10 rounded-full p-0.5 transition"
          aria-label="Supprimer"
        >
          <svg
            className="w-3 h-3"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </span>
  );
};

// Badge de statut avec couleurs prédéfinies
export const StatusBadge = ({ status, className = "" }) => {
  const statusConfig = {
    // Commandes
    pending: { label: "En attente", variant: "warning", dot: true },
    processing: { label: "En traitement", variant: "info", dot: true },
    shipped: { label: "Expédiée", variant: "primary", dot: true },
    delivered: { label: "Livrée", variant: "success", dot: true },
    cancelled: { label: "Annulée", variant: "danger", dot: true },

    // Stock
    in_stock: { label: "En stock", variant: "success", dot: true },
    low_stock: { label: "Stock limité", variant: "warning", dot: true },
    out_of_stock: { label: "Rupture", variant: "danger", dot: true },

    // Avis
    approved: { label: "Approuvé", variant: "success" },
    rejected: { label: "Rejeté", variant: "danger" },
    pending_review: { label: "En attente", variant: "warning" },

    // Garanties
    active: { label: "Active", variant: "success", dot: true },
    expired: { label: "Expirée", variant: "danger", dot: true },
    expiring_soon: { label: "Expire bientôt", variant: "warning", dot: true },

    // RMA
    open: { label: "Ouverte", variant: "info", dot: true },
    in_progress: { label: "En cours", variant: "primary", dot: true },
    resolved: { label: "Résolue", variant: "success", dot: true },
    closed: { label: "Fermée", variant: "default", dot: true }
  };

  const config = statusConfig[status] || { 
    label: status, 
    variant: "default" 
  };

  return (
    <Badge
      variant={config.variant}
      dot={config.dot}
      className={className}
    >
      {config.label}
    </Badge>
  );
};

// Badge avec compteur
export const CountBadge = ({ 
  count, 
  max = 99, 
  variant = "danger",
  size = "small",
  className = "" 
}) => {
  const displayCount = count > max ? `${max}+` : count;

  if (count === 0) return null;

  return (
    <Badge
      variant={variant}
      size={size}
      rounded="full"
      className={className}
    >
      {displayCount}
    </Badge>
  );
};

// Badge de réduction
export const DiscountBadge = ({ discount, className = "" }) => {
  return (
    <Badge
      variant="danger"
      size="medium"
      rounded="default"
      className={`font-bold ${className}`}
    >
      -{discount}%
    </Badge>
  );
};

// Badge "Nouveau"
export const NewBadge = ({ className = "" }) => {
  return (
    <Badge
      variant="success"
      size="small"
      rounded="full"
      className={`uppercase ${className}`}
    >
      Nouveau
    </Badge>
  );
};

// Badge "Best Seller"
export const BestSellerBadge = ({ className = "" }) => {
  return (
    <Badge
      variant="warning"
      size="small"
      rounded="full"
      className={`uppercase ${className}`}
    >
      ⭐ Best Seller
    </Badge>
  );
};

export default Badge;