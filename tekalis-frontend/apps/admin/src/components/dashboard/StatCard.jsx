import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * StatCard — Carte de KPI réutilisable
 * @param {string} title - Libellé
 * @param {string|number} value - Valeur principale
 * @param {string} subtitle - Sous-titre optionnel
 * @param {React.ComponentType} icon - Icône Lucide
 * @param {string} iconColor - Classe de couleur pour l'icône (ex: "text-blue-400")
 * @param {string} iconBg - Classe de fond pour l'icône (ex: "bg-blue-500/10")
 * @param {number} trend - Pourcentage de variation (positif/négatif)
 * @param {string} trendLabel - Label de la tendance (ex: "vs mois dernier")
 * @param {boolean} loading - État de chargement
 * @param {string} className - Classes CSS additionnelles
 */
const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-blue-400',
  iconBg = 'bg-blue-500/10',
  trend,
  trendLabel = 'vs mois dernier',
  loading = false,
  className = '',
}) => {
  const trendPositive = trend > 0;
  const trendNeutral  = trend === 0 || trend === null || trend === undefined;

  return (
    <div
      className={`
        relative overflow-hidden
        bg-gray-900 border border-white/5 rounded-2xl p-5
        hover:border-white/10 transition-all duration-200
        ${className}
      `}
    >
      {/* Subtle glow derrière l'icône */}
      <div className={`absolute -top-6 -right-6 w-24 h-24 ${iconBg} rounded-full blur-2xl opacity-40`} />

      {loading ? (
        <LoadingSkeleton />
      ) : (
        <div className="relative">
          {/* Header : titre + icône */}
          <div className="flex items-start justify-between mb-4">
            <p className="text-sm font-medium text-gray-400">{title}</p>
            {Icon && (
              <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
                <Icon size={17} className={iconColor} />
              </div>
            )}
          </div>

          {/* Valeur principale */}
          <p className="text-2xl font-bold text-white tracking-tight mb-1">
            {value ?? '—'}
          </p>

          {/* Sous-titre */}
          {subtitle && (
            <p className="text-xs text-gray-500 mb-3">{subtitle}</p>
          )}

          {/* Tendance */}
          {!trendNeutral && (
            <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-white/5">
              {trendPositive ? (
                <TrendingUp size={13} className="text-emerald-400" />
              ) : (
                <TrendingDown size={13} className="text-red-400" />
              )}
              <span className={`text-xs font-semibold ${trendPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                {trendPositive ? '+' : ''}{trend}%
              </span>
              <span className="text-xs text-gray-600">{trendLabel}</span>
            </div>
          )}

          {trendNeutral && trend !== undefined && (
            <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-white/5">
              <Minus size={13} className="text-gray-500" />
              <span className="text-xs text-gray-600">Stable {trendLabel && `— ${trendLabel}`}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="animate-pulse">
    <div className="flex justify-between mb-4">
      <div className="h-4 w-24 bg-white/5 rounded" />
      <div className="w-9 h-9 bg-white/5 rounded-xl" />
    </div>
    <div className="h-8 w-32 bg-white/5 rounded mb-2" />
    <div className="h-3 w-20 bg-white/5 rounded" />
  </div>
);

export default StatCard;