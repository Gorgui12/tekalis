import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

/**
 * AdminGuard - Protection complète des routes admin
 *
 * Logique :
 * 1. Pas de token → redirect /login
 * 2. Token mais role !== 'admin' → page 403
 * 3. Admin confirmé → affiche le contenu (<Outlet />)
 */
const AdminGuard = () => {
  const { user, token } = useSelector((state) => state.auth);

  // Pas connecté
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Connecté mais pas admin
  if (user.role !== 'admin' && user.isAdmin !== true) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md">
          <div className="text-8xl font-black text-red-500 mb-4">403</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Accès refusé
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
          <a
            href={import.meta.env.VITE_CLIENT_URL || "http://localhost:5173"}
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition"
          >
            Retour au site
          </a>
        </div>
      </div>
    );
  }

  // Admin confirmé → affiche les routes enfants
  return <Outlet />;
};

export default AdminGuard;