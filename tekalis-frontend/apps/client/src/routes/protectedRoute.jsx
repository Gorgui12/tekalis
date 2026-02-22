import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";

/**
 * ProtectedRoute - Protection des pages client nécessitant une connexion
 *
 * Usage dans App.jsx client :
 * <Route element={<ProtectedRoute />}>
 *   <Route path="/checkout" element={<Checkout />} />
 *   <Route path="/profile" element={<Profile />} />
 * </Route>
 *
 * Comportement :
 * - Si non connecté → redirect /login avec retour après connexion
 * - Si connecté → affiche la page (<Outlet />)
 */
const ProtectedRoute = () => {
  const { token, user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!token || !user) {
    // Sauvegarder l'URL pour y retourner après login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;