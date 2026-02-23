import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatCompactPrice } from '../../../../../packages/shared/outils/formatters';

/* ── Tooltip personnalisé ───────────────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-800 border border-white/10 rounded-xl px-4 py-3 shadow-2xl">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-sm font-semibold text-white">
          {formatCompactPrice(entry.value)}
        </p>
      ))}
    </div>
  );
};

/* ── RevenueChart ───────────────────────────────────────────────────────── */
const RevenueChart = ({ data = [], loading = false }) => {
  // Données de démo si aucune donnée fournie
  const chartData = data.length > 0 ? data : DEMO_DATA;

  if (loading) {
    return (
      <div className="bg-gray-900 border border-white/5 rounded-2xl p-5 h-72 flex items-center justify-center animate-pulse">
        <div className="w-full h-full bg-white/[0.03] rounded-xl" />
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-white/5 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-semibold text-white">Revenus</h3>
          <p className="text-xs text-gray-500 mt-0.5">12 derniers mois</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-500 rounded-full" />
          <span className="text-xs text-gray-400">Revenus (FCFA)</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)' }} />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#revenueGrad)"
            dot={false}
            activeDot={{ r: 5, fill: '#3b82f6', stroke: '#1d4ed8', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

const DEMO_DATA = [
  { month: 'Jan', revenue: 1200000 },
  { month: 'Fév', revenue: 1850000 },
  { month: 'Mar', revenue: 1450000 },
  { month: 'Avr', revenue: 2100000 },
  { month: 'Mai', revenue: 1900000 },
  { month: 'Jun', revenue: 2400000 },
  { month: 'Jul', revenue: 2200000 },
  { month: 'Aoû', revenue: 2700000 },
  { month: 'Sep', revenue: 2500000 },
  { month: 'Oct', revenue: 3100000 },
  { month: 'Nov', revenue: 3400000 },
  { month: 'Déc', revenue: 3800000 },
];

export default RevenueChart;