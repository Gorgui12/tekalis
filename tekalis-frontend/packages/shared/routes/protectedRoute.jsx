import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

const ProtectedRoute = ({ children, requireAdmin = false, redirectTo = '/login' }) => {
  const { user, token } = useSelector((state) => state.auth);
  const location = useLocation();

  const isAuthenticated = !!(user && token);

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // ✅ Fix : gère les deux formats backend
  //    { role: 'admin' }  OU  { isAdmin: true }
  const isAdmin = user?.role === 'admin' || user?.isAdmin === true;

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requireAdmin: PropTypes.bool,
  redirectTo: PropTypes.string,
};

export default ProtectedRoute;