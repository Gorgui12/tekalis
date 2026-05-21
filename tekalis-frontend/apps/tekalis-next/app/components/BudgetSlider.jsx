import { useState, useEffect } from "react";
import { FaInfoCircle } from "react-icons/fa";

const BudgetSlider = ({ 
  min = 0, 
  max = 3000000, 
  step = 50000,
  defaultMin = 500000,
  defaultMax = 1500000,
  onChange,
  showTiers = true,
  showRecommendations = true,
  currency = "FCFA"
}) => {
  const [minValue, setMinValue] = useState(defaultMin);
  const [maxValue, setMaxValue] = useState(defaultMax);

  // Tiers de prix
  const tiers = [
    {
      range: [0, 500000],
      label: "Entrée de gamme",
      color: "bg-gray-400",
      description: "Usage basique, bureautique simple",
      examples: ["Navigation web", "Office", "Emails"]
    },
    {
      range: [500000, 1000000],
      label: "Milieu de gamme",
      color: "bg-blue-400",
      description: "Polyvalent, multitâche fluide",
      examples: ["Gaming léger", "Photoshop", "Multitâche"]
    },
    {
      range: [1000000, 1500000],
      label: "Haut de gamme",
      color: "bg-purple-400",
      description: "Performance excellente",
      examples: ["Gaming AAA", "Montage vidéo", "Développement"]
    },
    {
      range: [1500000, 2500000],
      label: "Premium",
      color: "bg-yellow-400",
      description: "Excellence et durabilité",
      examples: ["Gaming ultra", "3D", "Workstation"]
    },
    {
      range: [2500000, 9999999],
      label: "Ultra",
      color: "bg-red-400",
      description: "Sans compromis, top absolu",
      examples: ["Pro gaming", "Render farms", "ML/AI"]
    }
  ];

  // Déterminer le tier actuel
  const getCurrentTier = () => {
    const avgBudget = (minValue + maxValue) / 2;
    return tiers.find(tier => avgBudget >= tier.range[0] && avgBudget < tier.range[1]) || tiers[0];
  };

  const currentTier = getCurrentTier();

  // Mettre à jour les valeurs
  useEffect(() => {
    if (onChange) {
      onChange({ min: minValue, max: maxValue, tier: currentTier });
    }
  }, [minValue, maxValue]);

  // Gérer les changements de slider
  const handleMinChange = (e) => {
    const value = Math.min(Number(e.target.value), maxValue - step);
    setMinValue(value);
  };

  const handleMaxChange = (e) => {
    const value = Math.max(Number(e.target.value), minValue + step);
    setMaxValue(value);
  };

  // Calculer la position des sliders en pourcentage
  const getMinPercent = () => ((minValue - min) / (max - min)) * 100;
  const getMaxPercent = () => ((maxValue - min) / (max - min)) * 100;

  return (
    <div className="w-full">
      {/* Display Selected Budget */}
      <div className="text-center mb-8">
        <p className="text-sm text-gray-600 mb-2">Budget sélectionné</p>
        <div className="flex items-center justify-center gap-3">
          <span className="text-3xl font-bold text-blue-600">
            {minValue.toLocaleString()}
          </span>
          <span className="text-2xl text-gray-400">-</span>
          <span className="text-3xl font-bold text-blue-600">
            {maxValue.toLocaleString()}
          </span>
          <span className="text-xl text-gray-600">{currency}</span>
        </div>
        
        {/* Current Tier Badge */}
        <div className="mt-3">
          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-white font-semibold ${currentTier.color}`}>
            <span>{currentTier.label}</span>
          </span>
          <p className="text-sm text-gray-600 mt-2">{currentTier.description}</p>
        </div>
      </div>

      {/* Dual Range Slider */}
      <div className="relative h-2 bg-gray-200 rounded-full mb-12">
        {/* Active Range */}
        <div 
          className="absolute h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
          style={{
            left: `${getMinPercent()}%`,
            width: `${getMaxPercent() - getMinPercent()}%`
          }}
        ></div>

        {/* Min Slider */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={minValue}
          onChange={handleMinChange}
          className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-blue-600 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-lg"
        />

        {/* Max Slider */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={maxValue}
          onChange={handleMaxChange}
          className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-600 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-purple-600 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-lg"
        />

        {/* Min/Max Labels */}
        <div className="absolute -bottom-8 left-0 text-xs text-gray-500">
          {min.toLocaleString()} {currency}
        </div>
        <div className="absolute -bottom-8 right-0 text-xs text-gray-500">
          {max.toLocaleString()} {currency}
        </div>
      </div>

      {/* Budget Tiers (Visual) */}
      {showTiers && (
        <div className="mt-8">
          <p className="text-sm font-semibold text-gray-700 mb-3">Gammes de prix</p>
          <div className="flex gap-1 h-8 rounded-lg overflow-hidden mb-4">
            {tiers.map((tier, index) => {
              const tierWidth = ((tier.range[1] - tier.range[0]) / max) * 100;
              const isActive = 
                (minValue >= tier.range[0] && minValue < tier.range[1]) ||
                (maxValue >= tier.range[0] && maxValue < tier.range[1]) ||
                (minValue < tier.range[0] && maxValue >= tier.range[1]);
              
              return (
                <div
                  key={index}
                  className={`${tier.color} transition-all ${
                    isActive ? "opacity-100 scale-105" : "opacity-50"
                  }`}
                  style={{ width: `${tierWidth}%` }}
                  title={tier.label}
                ></div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {showRecommendations && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <FaInfoCircle className="text-blue-600 text-xl flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-900 mb-2">
                {currentTier.label} - Ce que vous pouvez attendre
              </p>
              <ul className="text-sm text-gray-700 space-y-1">
                {currentTier.examples.map((example, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="text-blue-600">✓</span>
                    {example}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Quick Preset Buttons */}
      <div className="mt-6">
        <p className="text-sm font-semibold text-gray-700 mb-3">Sélections rapides</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {[
            { min: 300000, max: 500000, label: "Étudiant" },
            { min: 500000, max: 800000, label: "Bureautique" },
            { min: 800000, max: 1200000, label: "Gaming" },
            { min: 1200000, max: 1800000, label: "Création" },
            { min: 1800000, max: 2500000, label: "Premium" },
            { min: 2500000, max: 3000000, label: "Ultra" }
          ].map((preset, index) => (
            <button
              key={index}
              onClick={() => {
                setMinValue(preset.min);
                setMaxValue(preset.max);
              }}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                minValue === preset.min && maxValue === preset.max
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BudgetSlider;