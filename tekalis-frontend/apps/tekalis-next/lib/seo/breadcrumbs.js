/**
 * lib/seo/breadcrumbs.js
 *
 * Construction du fil d'Ariane. Utilise par :
 *  - le composant visible components/seo/Breadcrumb.jsx
 *  - le BreadcrumbList JSON-LD (lib/seo/jsonld.js)
 *
 * Une seule source : le visible et le balisage ne peuvent pas diverger.
 */

import { capitalize, stripHtml } from './format';

/** Normalise et nettoie une liste d'etapes. */
export function breadcrumbItems(items) {
  if (!Array.isArray(items)) return [];
  return items
    .filter((item) => item && item.name)
    .map((item) => ({
      name: stripHtml(item.name) || String(item.name),
      path: item.path || null,
    }));
}

/** Accueil > Produits (racine du catalogue). */
export function baseBreadcrumb() {
  return [
    { name: 'Accueil', path: '/' },
    { name: 'Produits', path: '/products' },
  ];
}

/** Accueil > Produits > Categorie > Produit. */
export function productBreadcrumb(product, category) {
  const items = baseBreadcrumb();
  if (category?.slug && category?.name) {
    items.push({ name: category.name, path: `/category/${category.slug}` });
  }
  items.push({
    name: stripHtml(product?.name) || 'Produit',
    path: `/products/${product?.slug || product?._id || ''}`,
  });
  return items;
}

/** Accueil > Categorie. */
export function categoryBreadcrumb(categoryName, categorySlug) {
  return [
    { name: 'Accueil', path: '/' },
    { name: 'Produits', path: '/products' },
    { name: categoryName || 'Catégorie', path: `/category/${categorySlug}` },
  ];
}

/** Accueil > Blog > Article. */
export function articleBreadcrumb(article) {
  return [
    { name: 'Accueil', path: '/' },
    { name: 'Blog', path: '/blog' },
    { name: stripHtml(article?.title) || 'Article', path: `/blog/${article?.slug || ''}` },
  ];
}

/** Accueil > Page. Pour les pages institutionnelles. */
export function pageBreadcrumb(name, path) {
  return [
    { name: 'Accueil', path: '/' },
    { name: capitalize(name), path },
  ];
}
