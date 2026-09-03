"use client";

import { useState } from "react";
import { FaChevronDown, FaChevronUp, FaPlus, FaMinus } from "react-icons/fa";

const Accordion = ({
  items,
  allowMultiple = false,
  defaultOpen = [],
  variant = "default", // default, bordered, filled
  iconPosition = "right", // left, right
  icon = "chevron" // chevron, plus
}) => {
  const [openItems, setOpenItems] = useState(defaultOpen);

  const toggleItem = (index) => {
    if (allowMultiple) {
      setOpenItems((prev) =>
        prev.includes(index)
          ? prev.filter((i) => i !== index)
          : [...prev, index]
      );
    } else {
      setOpenItems((prev) =>
        prev.includes(index) ? [] : [index]
      );
    }
  };

  const isOpen = (index) => openItems.includes(index);

  // Icônes
  const getIcon = (isItemOpen) => {
    if (icon === "plus") {
      return isItemOpen ? <FaMinus /> : <FaPlus />;
    }
    return isItemOpen ? <FaChevronUp /> : <FaChevronDown />;
  };

  // Variantes de styles
  const variantClasses = {
    default: {
      container: "space-y-2",
      item: "bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl overflow-hidden",
      header: "px-5 py-4 hover:bg-surface-100 dark:hover:bg-surface-700 transition cursor-pointer",
      content: "px-5 pb-4 text-surface-700 dark:text-surface-300"
    },
    bordered: {
      container: "border border-surface-200 dark:border-surface-700 rounded-xl divide-y",
      item: "",
      header: "px-5 py-4 hover:bg-surface-100 dark:hover:bg-surface-700 transition cursor-pointer",
      content: "px-5 pb-4 bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300"
    },
    filled: {
      container: "space-y-2",
      item: "bg-surface-100 dark:bg-surface-800 rounded-xl overflow-hidden",
      header: "px-5 py-4 hover:bg-surface-200 dark:hover:bg-surface-700 transition cursor-pointer",
      content: "px-5 pb-4 bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-300"
    }
  };

  const styles = variantClasses[variant];

  return (
    <div className={styles.container}>
      {Array.isArray(items) && items.map((item, index) => {
        const itemOpen = isOpen(index);

        return (
          <div key={index} className={styles.item}>
            {/* Header */}
            <div
              onClick={() => toggleItem(index)}
              className={styles.header}
            >
              <div className="flex items-center justify-between gap-4">
                {iconPosition === "left" && (
                  <span className="text-surface-500 dark:text-surface-400 flex-shrink-0">
                    {getIcon(itemOpen)}
                  </span>
                )}

                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-surface-900 dark:text-white">
                    {item.title}
                  </h3>
                  {item.subtitle && (
                    <p className="text-sm text-surface-600 dark:text-surface-400 mt-1">
                      {item.subtitle}
                    </p>
                  )}
                </div>

                {iconPosition === "right" && (
                  <span className="text-surface-500 dark:text-surface-400 flex-shrink-0">
                    {getIcon(itemOpen)}
                  </span>
                )}
              </div>
            </div>

            {/* Content */}
            {itemOpen && (
              <div className={`${styles.content} animate-fadeIn`}>
                {item.content}
              </div>
            )}
          </div>
        );
      })}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

// Composant AccordionItem pour usage alternatif
export const AccordionItem = ({
  title,
  subtitle,
  children,
  isOpen,
  onToggle,
  icon = "chevron",
  iconPosition = "right"
}) => {
  const getIcon = () => {
    if (icon === "plus") {
      return isOpen ? <FaMinus /> : <FaPlus />;
    }
    return isOpen ? <FaChevronUp /> : <FaChevronDown />;
  };

  return (
    <div className="bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl overflow-hidden">
      <div
        onClick={onToggle}
        className="px-5 py-4 hover:bg-surface-100 dark:hover:bg-surface-700 transition cursor-pointer"
      >
        <div className="flex items-center justify-between gap-4">
          {iconPosition === "left" && (
            <span className="text-surface-500 dark:text-surface-400 flex-shrink-0">
              {getIcon()}
            </span>
          )}

          <div className="flex-1">
            <h3 className="text-lg font-semibold text-surface-900 dark:text-white">{title}</h3>
            {subtitle && (
              <p className="text-sm text-surface-600 dark:text-surface-400 mt-1">{subtitle}</p>
            )}
          </div>

          {iconPosition === "right" && (
            <span className="text-surface-500 dark:text-surface-400 flex-shrink-0">
              {getIcon()}
            </span>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="px-5 pb-4 text-surface-700 dark:text-surface-300 animate-fadeIn">
          {children}
        </div>
      )}
    </div>
  );
};

// Hook pour gérer l'accordéon
export const useAccordion = (defaultOpen = []) => {
  const [openItems, setOpenItems] = useState(defaultOpen);

  const toggle = (index, allowMultiple = false) => {
    if (allowMultiple) {
      setOpenItems((prev) =>
        prev.includes(index)
          ? prev.filter((i) => i !== index)
          : [...prev, index]
      );
    } else {
      setOpenItems((prev) =>
        prev.includes(index) ? [] : [index]
      );
    }
  };

  const isOpen = (index) => openItems.includes(index);

  return { openItems, toggle, isOpen };
};

export default Accordion;
