import Link from "next/link";
import { FaHome, FaChevronRight } from 'react-icons/fa';

/**
 * Breadcrumb (fil d'Ariane) pour SEO et UX
 * Usage: <Breadcrumb items={[{name: "Produits", path: "/products"}, ...]} />
 */
export const Breadcrumb = ({ items = [] }) => {
  return (
    <nav aria-label="Fil d'Ariane" className="py-3 px-4">
      <ol className="flex items-center gap-2 text-sm flex-wrap">
        <li>
          <Link href="/"
            className="flex items-center gap-1 text-surface-600 dark:text-surface-400 hover:text-brand-600 dark:hover:text-brand-400 transition"
          >
            <FaHome />
            <span>Accueil</span>
          </Link>
        </li>
        
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            <FaChevronRight className="text-surface-400 dark:text-surface-500 text-xs" />
            {index === items.length - 1 ? (
              <span className="text-surface-900 dark:text-white font-semibold">
                {item.name}
              </span>
            ) : (
              <Link href={item.path}
                className="text-surface-600 dark:text-surface-400 hover:text-brand-600 dark:hover:text-brand-400 transition"
              >
                {item.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};
