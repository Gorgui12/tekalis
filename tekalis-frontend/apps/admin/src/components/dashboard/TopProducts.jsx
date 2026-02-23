import React from 'react';
import { TrendingUp } from 'lucide-react';
import { formatCompactPrice } from '../../../../../packages/shared/outils/formatters';
import { IMAGE } from '../../../../../packages/shared/outils/constants';

const TopProducts = ({ products = [], loading = false }) => {
  const items = products.length > 0 ? products : DEMO_PRODUCTS;

  return (
    <div className="bg-gray-900 border border-white/5 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-white">Top Produits</h3>
          <p className="text-xs text-gray-500 mt-0.5">Par chiffre d'affaires</p>
        </div>
        <TrendingUp size={16} className="text-blue-400" />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-8 h-8 bg-white/5 rounded-lg" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-3/4 bg-white/5 rounded" />
                <div className="h-2.5 w-1/2 bg-white/5 rounded" />
              </div>
              <div className="h-3 w-16 bg-white/5 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((product, index) => (
            <div
              key={product._id || index}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.03] transition group"
            >
              {/* Rang */}
              <span className="text-[11px] font-bold text-gray-600 w-4 flex-shrink-0">
                {index + 1}
              </span>

              {/* Image */}
              <div className="w-9 h-9 rounded-lg bg-white/5 overflow-hidden flex-shrink-0">
                <img
                  src={product.image || IMAGE.PLACEHOLDER}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = IMAGE.PLACEHOLDER; }}
                />
              </div>

              {/* Infos */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{product.name}</p>
                <p className="text-xs text-gray-500">{product.sold ?? 0} vendus</p>
              </div>

              {/* CA */}
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-semibold text-white">
                  {formatCompactPrice(product.revenue ?? product.price * (product.sold ?? 0))}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const DEMO_PRODUCTS = [
  { _id: '1', name: 'MacBook Pro 14"', sold: 24, price: 850000 },
  { _id: '2', name: 'iPhone 15 Pro',   sold: 41, price: 580000 },
  { _id: '3', name: 'RTX 4080 Super',  sold: 18, price: 620000 },
  { _id: '4', name: 'Samsung 4K 27"',  sold: 33, price: 230000 },
  { _id: '5', name: 'Logitech MX Keys',sold: 67, price: 75000  },
];

export default TopProducts;