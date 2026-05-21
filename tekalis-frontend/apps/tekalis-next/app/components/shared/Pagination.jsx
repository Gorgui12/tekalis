import React from 'react';
import PropTypes from 'prop-types';
import { FaChevronLeft, FaChevronRight, FaAngleDoubleLeft, FaAngleDoubleRight } from 'react-icons/fa';

/**
 * Composant Pagination réutilisable
 */
const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  showPageNumbers = true,
  showFirstLast = true,
  maxPageNumbers = 5,
  size = 'md',
  className = ''
}) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const halfMax = Math.floor(maxPageNumbers / 2);
    
    let startPage = Math.max(1, currentPage - halfMax);
    let endPage = Math.min(totalPages, startPage + maxPageNumbers - 1);
    
    if (endPage - startPage < maxPageNumbers - 1) {
      startPage = Math.max(1, endPage - maxPageNumbers + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const sizes = {
    sm: {
      button: 'px-3 py-1.5 text-sm',
      pageButton: 'w-8 h-8 text-sm'
    },
    md: {
      button: 'px-4 py-2 text-base',
      pageButton: 'w-10 h-10 text-base'
    },
    lg: {
      button: 'px-5 py-3 text-lg',
      pageButton: 'w-12 h-12 text-lg'
    }
  };

  const sizeClasses = sizes[size];

  const buttonBaseClasses = `
    rounded-lg 
    border 
    border-gray-300 
    font-semibold 
    transition-all 
    duration-200
    disabled:opacity-50 
    disabled:cursor-not-allowed
    hover:bg-gray-100
    active:bg-gray-200
    focus:outline-none 
    focus:ring-2 
    focus:ring-blue-500
  `;

  return (
    <div className={`flex items-center justify-center gap-2 mt-8 ${className}`}>
      {/* First page */}
      {showFirstLast && currentPage > 1 && (
        <button
          onClick={() => onPageChange(1)}
          className={`${buttonBaseClasses} ${sizeClasses.button} flex items-center gap-1`}
          aria-label="Première page"
        >
          <FaAngleDoubleLeft size={14} />
          <span className="hidden sm:inline">Premier</span>
        </button>
      )}

      {/* Previous */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`${buttonBaseClasses} ${sizeClasses.button} flex items-center gap-2`}
        aria-label="Page précédente"
      >
        <FaChevronLeft size={12} />
        <span className="hidden sm:inline">Précédent</span>
      </button>

      {/* Page numbers */}
      {showPageNumbers && (
        <div className="flex gap-1">
          {getPageNumbers().map(page => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`
                ${sizeClasses.pageButton}
                rounded-lg 
                font-semibold 
                transition-all 
                duration-200
                focus:outline-none 
                focus:ring-2 
                focus:ring-blue-500
                ${
                  page === currentPage
                    ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700'
                    : 'bg-white border border-gray-300 hover:bg-gray-100 active:bg-gray-200'
                }
              `}
              aria-label={`Page ${page}`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          ))}
        </div>
      )}

      {/* Current page indicator (if page numbers hidden) */}
      {!showPageNumbers && (
        <span className="px-4 py-2 text-sm font-semibold text-gray-700">
          Page {currentPage} sur {totalPages}
        </span>
      )}

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`${buttonBaseClasses} ${sizeClasses.button} flex items-center gap-2`}
        aria-label="Page suivante"
      >
        <span className="hidden sm:inline">Suivant</span>
        <FaChevronRight size={12} />
      </button>

      {/* Last page */}
      {showFirstLast && currentPage < totalPages && (
        <button
          onClick={() => onPageChange(totalPages)}
          className={`${buttonBaseClasses} ${sizeClasses.button} flex items-center gap-1`}
          aria-label="Dernière page"
        >
          <span className="hidden sm:inline">Dernier</span>
          <FaAngleDoubleRight size={14} />
        </button>
      )}
    </div>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  showPageNumbers: PropTypes.bool,
  showFirstLast: PropTypes.bool,
  maxPageNumbers: PropTypes.number,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string
};

export default Pagination;