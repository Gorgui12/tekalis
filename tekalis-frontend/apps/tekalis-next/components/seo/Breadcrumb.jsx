import Link from 'next/link';
import { breadcrumbItems } from '@/lib/seo/breadcrumbs';

/**
 * Fil d'Ariane visible, rendu serveur.
 *
 * Google s'en sert pour comprendre la hierarchie et, combine au BreadcrumbList
 * JSON-LD, pour afficher le chemin dans le resultat. Le dernier element n'est
 * pas un lien : c'est la page courante.
 */
export default function Breadcrumb({ items = [], className = '' }) {
  const list = breadcrumbItems(items);
  if (list.length === 0) return null;

  return (
    <nav aria-label="Fil d'Ariane" className={`text-sm ${className}`}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-surface-500 dark:text-surface-400">
        {list.map((item, index) => {
          const isLast = index === list.length - 1;
          return (
            <li key={`${item.name}-${index}`} className="flex items-center gap-2">
              {index > 0 && (
                <span aria-hidden="true" className="text-surface-300 dark:text-surface-600">
                  /
                </span>
              )}
              {isLast ? (
                <span
                  aria-current="page"
                  className="font-semibold text-surface-900 dark:text-surface-100"
                >
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.path || '/'}
                  className="hover:underline hover:text-brand-600 dark:hover:text-brand-400"
                >
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
