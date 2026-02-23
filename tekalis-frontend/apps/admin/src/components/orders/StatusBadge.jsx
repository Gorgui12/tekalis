import React from 'react';
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  RMA_STATUS_LABELS,
  WARRANTY_STATUS,
} from '../../../../../packages/shared/outils/constants';

/**
 * StatusBadge — Badge de statut universel
 * @param {string} status - Statut (clé)
 * @param {string} type - 'order' | 'rma' | 'warranty' | 'article'
 * @param {string} size - 'sm' | 'md' (défaut)
 */
const STATUS_MAP = {
  order: {
    pending:    { label: ORDER_STATUS_LABELS.pending,    bg: 'bg-yellow-500/10', text: 'text-yellow-400', dot: 'bg-yellow-400' },
    processing: { label: ORDER_STATUS_LABELS.processing, bg: 'bg-blue-500/10',   text: 'text-blue-400',   dot: 'bg-blue-400'   },
    shipped:    { label: ORDER_STATUS_LABELS.shipped,    bg: 'bg-purple-500/10', text: 'text-purple-400', dot: 'bg-purple-400' },
    delivered:  { label: ORDER_STATUS_LABELS.delivered,  bg: 'bg-emerald-500/10',text: 'text-emerald-400',dot: 'bg-emerald-400' },
    cancelled:  { label: ORDER_STATUS_LABELS.cancelled,  bg: 'bg-red-500/10',    text: 'text-red-400',    dot: 'bg-red-400'    },
    refunded:   { label: ORDER_STATUS_LABELS.refunded,   bg: 'bg-gray-500/10',   text: 'text-gray-400',   dot: 'bg-gray-400'   },
  },
  rma: {
    pending:     { label: RMA_STATUS_LABELS.pending,     bg: 'bg-yellow-500/10',  text: 'text-yellow-400',  dot: 'bg-yellow-400'  },
    approved:    { label: RMA_STATUS_LABELS.approved,    bg: 'bg-blue-500/10',    text: 'text-blue-400',    dot: 'bg-blue-400'    },
    in_progress: { label: RMA_STATUS_LABELS.in_progress, bg: 'bg-orange-500/10',  text: 'text-orange-400',  dot: 'bg-orange-400'  },
    completed:   { label: RMA_STATUS_LABELS.completed,   bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-400' },
    rejected:    { label: RMA_STATUS_LABELS.rejected,    bg: 'bg-red-500/10',     text: 'text-red-400',     dot: 'bg-red-400'     },
  },
  warranty: {
    active:   { label: 'Active',    bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-400' },
    expiring: { label: 'Expire bientôt', bg: 'bg-yellow-500/10',  text: 'text-yellow-400',  dot: 'bg-yellow-400'  },
    expired:  { label: 'Expirée',   bg: 'bg-red-500/10',     text: 'text-red-400',     dot: 'bg-red-400'     },
  },
  article: {
    published: { label: 'Publié',   bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-400' },
    draft:     { label: 'Brouillon',bg: 'bg-gray-500/10',    text: 'text-gray-400',    dot: 'bg-gray-400'    },
  },
};

const SIZES = {
  sm: 'text-[10px] px-2 py-0.5 gap-1',
  md: 'text-xs px-2.5 py-1 gap-1.5',
};

const StatusBadge = ({ status, type = 'order', size = 'md', showDot = true }) => {
  const config = STATUS_MAP[type]?.[status];

  if (!config) {
    return (
      <span className={`inline-flex items-center font-medium rounded-full ${SIZES[size]} bg-gray-500/10 text-gray-400`}>
        {status}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center font-medium rounded-full ${SIZES[size]} ${config.bg} ${config.text}`}>
      {showDot && <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${config.dot}`} />}
      {config.label}
    </span>
  );
};

export default StatusBadge;