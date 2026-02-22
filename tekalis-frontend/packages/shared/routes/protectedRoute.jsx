import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

/**
 * Route protégée - Nécessite authentification
 */
const ProtectedRoute = ({ children, requireAdmin = false, redirectTo = '/login' }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // Pas authentifié → rediriger vers login
  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Besoin admin mais user n'est pas admin
  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requireAdmin: PropTypes.bool,
  redirectTo: PropTypes.string
};

export default ProtectedRoute;

/**
 * UTILISATION :
 * 
 * // Dans App.jsx ou routes
 * import ProtectedRoute from './routes/ProtectedRoute';
 * 
 * <Route 
 *   path="/profile" 
 *   element={
 *     <ProtectedRoute>
 *       <Profile />
 *     </ProtectedRoute>
 *   } 
 * />
 * 
 * <Route 
 *   path="/admin/*" 
 *   element={
 *     <ProtectedRoute requireAdmin>
 *       <AdminLayout />
 *     </ProtectedRoute>
 *   } 
 * />
 * 
 * // Avec redirection custom
 * <Route 
 *   path="/checkout" 
 *   element={
 *     <ProtectedRoute redirectTo="/login?redirect=checkout">
 *       <Checkout />
 *     </ProtectedRoute>
 *   } 
 * />
 */