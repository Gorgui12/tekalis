import React from 'react';
import PropTypes from 'prop-types';

/**
 * Composant Badge de statut réutilisable
 * Supporte : commandes, RMA, garanties, etc.
 */

const STATUS_CONFIGS = {
  // 🔵 ORDER STATUS
  pending: { 
    bg: "bg-yellow-100", 
    text: "text-yellow-700", 
    label: "En attente", 
    icon: "⏳" 
  },
  processing: { 
    bg: "bg-brand-100", 
    text: "text-brand-700", 
    label: "En traitement", 
    icon: "📦" 
  },
  shipped: { 
    bg: "bg-purple-100", 
    text: "text-purple-700", 
    label: "Expédiée", 
    icon: "🚚" 
  },
  delivered: { 
    bg: "bg-green-100", 
    text: "text-green-700", 
    label: "Livrée", 
    icon: "✅" 
  },
  cancelled: { 
    bg: "bg-red-100", 
    text: "text-red-700", 
    label: "Annulée", 
    icon: "❌" 
  },
  refunded: { 
    bg: "bg-gray-100", 
    text: "text-gray-700", 
    label: "Remboursée", 
    icon: "💰" 
  },
  
  // 🔧 RMA STATUS
  approved: { 
    bg: "bg-brand-100", 
    text: "text-brand-700", 
    label: "Approuvée", 
    icon: "✓" 
  },
  in_progress: { 
    bg: "bg-purple-100", 
    text: "text-purple-700", 
    label: "En cours", 
    icon: "🔧" 
  },
  completed: { 
    bg: "bg-green-100", 
    text: "text-green-700", 
    label: "Terminée", 
    icon: "✓" 
  },
  rejected: { 
    bg: "bg-red-100", 
    text: "text-red-700", 
    label: "Refusée", 
    icon: "✗" 
  },
  
  // 🛡️ WARRANTY STATUS
  active: { 
    bg: "bg-green-100", 
    text: "text-green-700", 
    label: "Active", 
    icon: "🛡️" 
  },
  expiring: { 
    bg: "bg-orange-100", 
    text: "text-orange-700", 
    label: "Expire bientôt", 
    icon: "⚠️" 
  },
  expired: { 
    bg: "bg-red-100", 
    text: "text-red-700", 
    label: "Expirée", 
    icon: "⛔" 
  },
  
  // 📦 STOCK STATUS
  in_stock: { 
    bg: "bg-green-100", 
    text: "text-green-700", 
    label: "En stock", 
    icon: "✓" 
  },
  low_stock: { 
    bg: "bg-orange-100", 
    text: "text-orange-700", 
    label: "Stock faible", 
    icon: "⚠️" 
  },
  out_of_stock: { 
    bg: "bg-red-100", 
    text: "text-red-700", 
    label: "Rupture", 
    icon: "✗" 
  }
};

const StatusBadge = ({ 
  status, 
  type = 'order',
  customConfig = null,
  showIcon = true,
  size = 'md',
  className = ''
}) => {
  // Utiliser config personnalisée ou config par défaut
  const config = customConfig || STATUS_CONFIGS[status] || {
    bg: "bg-surface-200 dark:bg-surface-700",
    text: "text-surface-700 dark:text-surface-300",
    label: status || "Inconnu",
    icon: "•"
  };

  // Tailles
  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base"
  };

  return (
    <span 
      className={`
        ${config.bg} 
        ${config.text} 
        ${sizes[size]}
        rounded-full 
        font-semibold 
        inline-flex 
        items-center 
        gap-1
        ${className}
      `}
      role="status"
      aria-label={config.label}
    >
      {showIcon && <span aria-hidden="true">{config.icon}</span>}
      <span>{config.label}</span>
    </span>
  );
};

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['order', 'rma', 'warranty', 'stock']),
  customConfig: PropTypes.shape({
    bg: PropTypes.string,
    text: PropTypes.string,
    label: PropTypes.string,
    icon: PropTypes.string
  }),
  showIcon: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string
};

export default StatusBadge;

/**
 * EXEMPLES D'UTILISATION :
 * 
 * // Commande
 * <StatusBadge status="pending" />
 * <StatusBadge status="delivered" />
 * 
 * // RMA
 * <StatusBadge status="approved" type="rma" />
 * <StatusBadge status="in_progress" type="rma" />
 * 
 * // Garantie
 * <StatusBadge status="active" type="warranty" />
 * <StatusBadge status="expiring" type="warranty" />
 * 
 * // Stock
 * <StatusBadge status="in_stock" type="stock" />
 * <StatusBadge status="low_stock" type="stock" />
 * 
 * // Personnalisé
 * <StatusBadge 
 *   status="custom"
 *   customConfig={{
 *     bg: "bg-pink-100",
 *     text: "text-pink-700",
 *     label: "Spécial",
 *     icon: "🎉"
 *   }}
 * />
 * 
 * // Sans icône
 * <StatusBadge status="pending" showIcon={false} />
 * 
 * // Taille
 * <StatusBadge status="pending" size="sm" />
 * <StatusBadge status="pending" size="lg" />
 */