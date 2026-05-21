import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

/**
 * Composant EmptyState réutilisable pour les états vides
 */
const EmptyState = ({
  icon = '📭',
  title = 'Aucun élément',
  description = 'Il n\'y a rien à afficher pour le moment.',
  actionText = null,
  actionLink = null,
  onAction = null,
  children = null,
  size = 'md',
  className = ''
}) => {
  const sizes = {
    sm: {
      icon: 'text-5xl',
      title: 'text-xl',
      description: 'text-sm',
      button: 'px-4 py-2 text-sm'
    },
    md: {
      icon: 'text-6xl',
      title: 'text-2xl',
      description: 'text-base',
      button: 'px-6 py-3 text-base'
    },
    lg: {
      icon: 'text-8xl',
      title: 'text-3xl',
      description: 'text-lg',
      button: 'px-8 py-4 text-lg'
    }
  };

  const sizeClasses = sizes[size];

  const renderAction = () => {
    if (!actionText) return null;

    const buttonClasses = `
      ${sizeClasses.button}
      bg-blue-600 
      hover:bg-blue-700 
      text-white 
      font-semibold 
      rounded-lg 
      transition
      shadow-sm
      hover:shadow-md
    `;

    if (actionLink) {
      return (
        <Link to={actionLink} className={buttonClasses}>
          {actionText}
        </Link>
      );
    }

    if (onAction) {
      return (
        <button onClick={onAction} className={buttonClasses}>
          {actionText}
        </button>
      );
    }

    return null;
  };

  return (
    <div className={`text-center py-12 px-4 ${className}`}>
      <div className={`${sizeClasses.icon} mb-4`} aria-hidden="true">
        {icon}
      </div>
      
      <h3 className={`${sizeClasses.title} font-bold text-gray-900 mb-2`}>
        {title}
      </h3>
      
      <p className={`${sizeClasses.description} text-gray-600 mb-6 max-w-md mx-auto`}>
        {description}
      </p>
      
      {renderAction()}
      
      {children && (
        <div className="mt-6">
          {children}
        </div>
      )}
    </div>
  );
};

EmptyState.propTypes = {
  icon: PropTypes.node,
  title: PropTypes.string,
  description: PropTypes.string,
  actionText: PropTypes.string,
  actionLink: PropTypes.string,
  onAction: PropTypes.func,
  children: PropTypes.node,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string
};

export default EmptyState;


