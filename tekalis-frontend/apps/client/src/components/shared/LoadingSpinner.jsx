import React from 'react';
import PropTypes from 'prop-types';

/**
 * Composant Loading Spinner réutilisable
 */
const LoadingSpinner = ({ 
  size = 'md', 
  color = 'blue',
  text = null,
  fullScreen = false,
  className = ''
}) => {
  const sizes = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const colors = {
    blue: 'border-blue-600',
    gray: 'border-gray-600',
    white: 'border-white',
    red: 'border-red-600',
    green: 'border-green-600',
    yellow: 'border-yellow-600'
  };

  const spinner = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div
        className={`
          ${sizes[size]}
          ${colors[color]}
          border-4
          border-t-transparent
          rounded-full
          animate-spin
        `}
        role="status"
        aria-label="Chargement en cours"
      />
      {text && (
        <p className="text-sm font-medium text-gray-600 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  color: PropTypes.oneOf(['blue', 'gray', 'white', 'red', 'green', 'yellow']),
  text: PropTypes.string,
  fullScreen: PropTypes.bool,
  className: PropTypes.string
};

export default LoadingSpinner;

/**
 * EXEMPLES:
 * 
 * // Simple
 * <LoadingSpinner />
 * 
 * // Avec texte
 * <LoadingSpinner text="Chargement des produits..." />
 * 
 * // Différentes tailles
 * <LoadingSpinner size="sm" />
 * <LoadingSpinner size="xl" />
 * 
 * // Plein écran
 * <LoadingSpinner fullScreen text="Préparation..." />
 * 
 * // Dans un conteneur
 * {loading ? (
 *   <LoadingSpinner text="Chargement..." />
 * ) : (
 *   <ProductList products={products} />
 * )}
 */
