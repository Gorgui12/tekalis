"use client";

import React from 'react';
import PropTypes from 'prop-types';

/**
 * Composant Button réutilisable avec variants et accessibilité
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon = null,
  iconPosition = 'left',
  fullWidth = false,
  ariaLabel,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  const baseClasses = 'font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2';
  
  const variants = {
    primary: 'bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white focus:ring-brand-500 shadow-sm hover:shadow-md',
    secondary: 'bg-surface-200 hover:bg-surface-300 active:bg-surface-400 text-surface-700 focus:ring-surface-400 dark:bg-surface-700 dark:hover:bg-surface-600 dark:text-surface-100',
    danger: 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white focus:ring-rose-500 shadow-sm hover:shadow-md',
    success: 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white focus:ring-emerald-500 shadow-sm hover:shadow-md',
    warning: 'bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white focus:ring-amber-500 shadow-sm',
    outline: 'border-2 border-brand-500 text-brand-600 hover:bg-brand-50 active:bg-brand-100 focus:ring-brand-500 dark:text-brand-400 dark:hover:bg-brand-900/20',
    outlineDanger: 'border-2 border-rose-600 text-rose-600 hover:bg-rose-50 active:bg-rose-100 focus:ring-rose-500',
    ghost: 'text-surface-700 hover:bg-surface-100 active:bg-surface-200 focus:ring-surface-400 dark:text-surface-300 dark:hover:bg-surface-800',
    link: 'text-brand-600 hover:text-brand-700 hover:underline focus:ring-brand-500 dark:text-brand-400'
  };
  
  const sizes = {
    xs: 'px-2.5 py-1.5 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl'
  };

  const widthClass = fullWidth ? 'w-full' : '';

  const buttonClasses = `
    ${baseClasses} 
    ${variants[variant]} 
    ${sizes[size]} 
    ${widthClass}
    ${className}
  `.trim();

  const renderIcon = () => {
    if (!icon) return null;
    return <span className={isLoading ? 'opacity-0' : ''}>{icon}</span>;
  };

  const renderLoadingSpinner = () => {
    if (!isLoading) return null;
    
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <svg 
          className="animate-spin h-5 w-5" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
    );
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
      aria-busy={isLoading}
      className={`${buttonClasses} relative`}
      {...props}
    >
      {iconPosition === 'left' && renderIcon()}
      
      <span className={isLoading ? 'opacity-0' : ''}>
        {children}
      </span>
      
      {iconPosition === 'right' && renderIcon()}
      
      {renderLoadingSpinner()}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf([
    'primary', 
    'secondary', 
    'danger', 
    'success', 
    'warning',
    'outline', 
    'outlineDanger',
    'ghost',
    'link'
  ]),
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  isLoading: PropTypes.bool,
  disabled: PropTypes.bool,
  icon: PropTypes.node,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  fullWidth: PropTypes.bool,
  ariaLabel: PropTypes.string,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  className: PropTypes.string
};

export default Button;

/**
 * EXEMPLES D'UTILISATION :
 * 
 * // Basique
 * <Button onClick={handleClick}>
 *   Cliquer ici
 * </Button>
 * 
 * // Variants
 * <Button variant="primary">Primaire</Button>
 * <Button variant="danger">Danger</Button>
 * <Button variant="outline">Outline</Button>
 * <Button variant="ghost">Ghost</Button>
 * 
 * // Tailles
 * <Button size="sm">Petit</Button>
 * <Button size="lg">Grand</Button>
 * 
 * // Avec icône
 * <Button icon={<FaShoppingCart />}>
 *   Ajouter au panier
 * </Button>
 * 
 * <Button icon={<FaSave />} iconPosition="right">
 *   Sauvegarder
 * </Button>
 * 
 * // Loading
 * <Button isLoading>
 *   Chargement...
 * </Button>
 * 
 * // Disabled
 * <Button disabled>
 *   Désactivé
 * </Button>
 * 
 * // Full width
 * <Button fullWidth>
 *   Bouton pleine largeur
 * </Button>
 * 
 * // Type submit
 * <Button type="submit" variant="success">
 *   Soumettre
 * </Button>
 */
