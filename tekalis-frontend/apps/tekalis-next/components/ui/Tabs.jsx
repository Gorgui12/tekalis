"use client";

import { useState } from "react";

const Tabs = ({
  tabs,
  defaultTab = 0,
  onChange,
  variant = "default", // default, pills, underline, boxed
  orientation = "horizontal", // horizontal, vertical
  fullWidth = false,
  className = ""
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleTabClick = (index) => {
    setActiveTab(index);
    if (onChange) onChange(index);
  };

  // Variantes de styles
  const variantClasses = {
    default: {
      container: "border-b border-surface-200",
      tab: "px-6 py-3 font-semibold transition",
      active: "border-b-2 border-brand-500 text-brand-600",
      inactive: "text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white hover:border-surface-300 border-b-2 border-transparent"
    },
    pills: {
      container: "bg-surface-100 p-1 rounded-xl",
      tab: "px-6 py-2 rounded-xl font-semibold transition",
      active: "bg-white text-brand-600 shadow-sm",
      inactive: "text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white"
    },
    underline: {
      container: "",
      tab: "px-6 py-3 font-semibold transition relative",
      active: "text-brand-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-brand-500",
      inactive: "text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white"
    },
    boxed: {
      container: "border-b border-surface-200",
      tab: "px-6 py-3 font-semibold transition border border-transparent -mb-px",
      active: "bg-white border-surface-200 border-b-white text-brand-600",
      inactive: "text-surface-600 dark:text-surface-400 hover:bg-surface-50"
    }
  };

  const styles = variantClasses[variant];

  if (orientation === "vertical") {
    return (
      <div className={`flex gap-4 ${className}`}>
        {/* Sidebar des onglets */}
        <div className="flex flex-col w-48 space-y-1">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => handleTabClick(index)}
              disabled={tab.disabled}
              className={`text-left px-4 py-3 rounded-xl font-semibold transition ${
                activeTab === index
                  ? "bg-brand-500 text-white"
                  : "text-surface-600 dark:text-surface-400 hover:bg-surface-100"
              } ${tab.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <div className="flex items-center gap-3">
                {tab.icon && <span className="text-xl">{tab.icon}</span>}
                <span>{tab.label}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Contenu */}
        <div className="flex-1">
          {tabs[activeTab]?.content}
        </div>
      </div>
    );
  }

  // Mode horizontal (défaut)
  return (
    <div className={className}>
      {/* Liste des onglets */}
      <div className={`flex ${fullWidth ? "" : "inline-flex"} ${styles.container}`}>
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => handleTabClick(index)}
            disabled={tab.disabled}
            className={`${styles.tab} ${
              activeTab === index ? styles.active : styles.inactive
            } ${fullWidth ? "flex-1" : ""} ${
              tab.disabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              {tab.icon && <span>{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                  {tab.badge}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Contenu de l'onglet actif */}
      <div className="mt-4">
        {tabs[activeTab]?.content}
      </div>
    </div>
  );
};

// Composant TabPanel pour utilisation simplifiée
export const TabPanel = ({ children, className = "" }) => {
  return <div className={`py-4 ${className}`}>{children}</div>;
};

// Hook personnalisé pour gérer les onglets
export const useTabs = (initialTab = 0) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  
  return {
    activeTab,
    setActiveTab,
    isActive: (index) => activeTab === index
  };
};

export default Tabs;
