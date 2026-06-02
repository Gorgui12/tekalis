import { Link } from 'react-router-dom';
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
          <Link
            to="/"
            className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
          >
            <FaHome />
            <span>Accueil</span>
          </Link>
        </li>
        
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            <FaChevronRight className="text-gray-400 text-xs" />
            {index === items.length - 1 ? (
              <span className="text-gray-900 dark:text-white font-semibold">
                {item.name}
              </span>
            ) : (
              <Link
                to={item.path}
                className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
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