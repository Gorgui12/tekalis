import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  maxVisible = 5,
  showFirstLast = true,
  showPrevNext = true,
  size = "medium" // small, medium, large
}) => {
  // Générer les numéros de pages à afficher
  const getPageNumbers = () => {
    const pages = [];
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  // Classes de taille
  const sizeClasses = {
    small: "px-2 py-1 text-sm",
    medium: "px-3 py-2 text-base",
    large: "px-4 py-3 text-lg"
  };

  const buttonClass = `${sizeClasses[size]} rounded-lg font-semibold transition duration-200`;

  return (
    <div className="flex items-center justify-center gap-2 flex-wrap">
      {/* Bouton First */}
      {showFirstLast && currentPage > 1 && (
        <button
          onClick={() => onPageChange(1)}
          className={`${buttonClass} bg-white hover:bg-gray-100 text-gray-700 border border-gray-300`}
          aria-label="Première page"
        >
          Première
        </button>
      )}

      {/* Bouton Previous */}
      {showPrevNext && (
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`${buttonClass} ${
            currentPage === 1
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-300"
          }`}
          aria-label="Page précédente"
        >
          <FaChevronLeft />
        </button>
      )}

      {/* Ellipsis gauche */}
      {pageNumbers[0] > 1 && (
        <span className={`${sizeClasses[size]} text-gray-500`}>...</span>
      )}

      {/* Numéros de pages */}
      {pageNumbers.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`${buttonClass} ${
            page === currentPage
              ? "bg-blue-600 text-white shadow-md"
              : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-300"
          }`}
          aria-label={`Page ${page}`}
          aria-current={page === currentPage ? "page" : undefined}
        >
          {page}
        </button>
      ))}

      {/* Ellipsis droite */}
      {pageNumbers[pageNumbers.length - 1] < totalPages && (
        <span className={`${sizeClasses[size]} text-gray-500`}>...</span>
      )}

      {/* Bouton Next */}
      {showPrevNext && (
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={`${buttonClass} ${
            currentPage === totalPages
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-300"
          }`}
          aria-label="Page suivante"
        >
          <FaChevronRight />
        </button>
      )}

      {/* Bouton Last */}
      {showFirstLast && currentPage < totalPages && (
        <button
          onClick={() => onPageChange(totalPages)}
          className={`${buttonClass} bg-white hover:bg-gray-100 text-gray-700 border border-gray-300`}
          aria-label="Dernière page"
        >
          Dernière
        </button>
      )}
    </div>
  );
};

// Pagination simple (variant compact)
export const SimplePagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex items-center justify-center gap-4">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
          currentPage === 1
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
      >
        <FaChevronLeft />
        Précédent
      </button>

      <span className="text-gray-700 font-semibold">
        Page {currentPage} sur {totalPages}
      </span>

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
          currentPage === totalPages
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
      >
        Suivant
        <FaChevronRight />
      </button>
    </div>
  );
};

// Info de pagination
export const PaginationInfo = ({ 
  currentPage, 
  totalPages, 
  totalItems, 
  itemsPerPage 
}) => {
  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="text-sm text-gray-600">
      Affichage de <span className="font-semibold">{start}</span> à{" "}
      <span className="font-semibold">{end}</span> sur{" "}
      <span className="font-semibold">{totalItems}</span> résultats
    </div>
  );
};

export default Pagination;