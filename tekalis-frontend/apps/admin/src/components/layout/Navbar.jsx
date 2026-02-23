/**
 * ⚠️  Ce fichier Navbar est REMPLACÉ par AdminHeader + Sidebar.
 * 
 * Si vous référencez encore cette Navbar dans Statistiques.jsx ou ailleurs,
 * remplacez les imports par :
 * 
 *   import AdminHeader from '../components/admin/layout/AdminHeader';
 *   import Sidebar     from '../components/admin/layout/Sidebar';
 * 
 * Les routes ont été corrigées (cohérentes avec App.jsx / AdminRoutes.jsx) :
 *   ❌ /admin/produits    →  ✅ /admin/products
 *   ❌ /admin/add-product →  ✅ /admin/products/add
 * 
 * Ce fichier est conservé comme stub pour ne pas casser les imports existants.
 */

export { default } from './AdminHeader';