import React from 'react';
import { ShoppingCart, Package, Wrench, Shield, FileText } from 'lucide-react';
import { formatRelativeTime } from '../../../../../packages/shared/outils/formatters';

const TYPE_CONFIG = {
  order:    { icon: ShoppingCart, color: 'text-blue-400',   bg: 'bg-blue-500/10'   },
  product:  { icon: Package,      color: 'text-emerald-400',bg: 'bg-emerald-500/10' },
  rma:      { icon: Wrench,       color: 'text-orange-400', bg: 'bg-orange-500/10'  },
  warranty: { icon: Shield,       color: 'text-purple-400', bg: 'bg-purple-500/10'  },
  article:  { icon: FileText,     color: 'text-pink-400',   bg: 'bg-pink-500/10'    },
};

const ActivityItem = ({ item }) => {
  const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.order;
  const Icon = config.icon;

  return (
    <div className="flex items-start gap-3 py-2.5">
      <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
        <Icon size={14} className={config.color} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-300 leading-snug">{item.message}</p>
        <p className="text-xs text-gray-600 mt-0.5">{formatRelativeTime(item.createdAt)}</p>
      </div>
    </div>
  );
};

const RecentActivity = ({ activities = [], loading = false }) => {
  const items = activities.length > 0 ? activities : DEMO_ACTIVITIES;

  return (
    <div className="bg-gray-900 border border-white/5 rounded-2xl p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-white">Activité récente</h3>
        <p className="text-xs text-gray-500 mt-0.5">Dernières actions</p>
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-8 h-8 bg-white/5 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-1.5 pt-1">
                <div className="h-3 bg-white/5 rounded w-full" />
                <div className="h-2.5 bg-white/5 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="divide-y divide-white/[0.04]">
          {items.map((item, i) => (
            <ActivityItem key={item._id || i} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};

const now = new Date();
const ago = (min) => new Date(now - min * 60 * 1000);

const DEMO_ACTIVITIES = [
  { _id: '1', type: 'order',    message: 'Nouvelle commande #A3F91B — 125 000 FCFA',      createdAt: ago(5)  },
  { _id: '2', type: 'product',  message: 'Stock mis à jour — RTX 4080 Super (3 restants)', createdAt: ago(18) },
  { _id: '3', type: 'rma',      message: 'Demande SAV #RMA-0042 soumise par Moussa D.',    createdAt: ago(34) },
  { _id: '4', type: 'warranty', message: 'Garantie expirante dans 7 jours — Commande #B29',createdAt: ago(60) },
  { _id: '5', type: 'article',  message: 'Article publié — "Guide Ryzen 9 vs Core i9"',   createdAt: ago(90) },
];

export default RecentActivity;