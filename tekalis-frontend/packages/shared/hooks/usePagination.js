import { useState, useMemo, useCallback } from 'react';

/**
 * Hook pour gérer la pagination côté client
 * @param {Array} items - Tableau d'items à paginer
 * @param {Number} itemsPerPage - Nombre d'items par page
 * @returns {Object} État et fonctions de pagination
 */
const usePagination = (items = [], itemsPerPage = 12) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Calculer le nombre total de pages
  const totalPages = useMemo(() => {
    if (!Array.isArray(items) || items.length === 0) return 1;
    return Math.ceil(items.length / itemsPerPage);
  }, [items.length, itemsPerPage]);

  // S'assurer que currentPage est valide
  const validCurrentPage = useMemo(() => {
    if (currentPage < 1) return 1;
    if (currentPage > totalPages) return totalPages;
    return currentPage;
  }, [currentPage, totalPages]);

  // Obtenir les items de la page actuelle
  const paginatedItems = useMemo(() => {
    if (!Array.isArray(items)) return [];
    
    const startIndex = (validCurrentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    return items.slice(startIndex, endIndex);
  }, [items, validCurrentPage, itemsPerPage]);

  // Aller à une page spécifique
  const goToPage = useCallback((page) => {
    const pageNumber = Number(page);
    if (isNaN(pageNumber)) return;
    
    setCurrentPage(Math.max(1, Math.min(pageNumber, totalPages)));
  }, [totalPages]);

  // Page suivante
  const nextPage = useCallback(() => {
    if (validCurrentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  }, [validCurrentPage, totalPages]);

  // Page précédente
  const prevPage = useCallback(() => {
    if (validCurrentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  }, [validCurrentPage]);

  // Aller à la première page
  const firstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  // Aller à la dernière page
  const lastPage = useCallback(() => {
    setCurrentPage(totalPages);
  }, [totalPages]);

  // Vérifier si on peut aller à la page suivante
  const hasNext = useMemo(() => 
    validCurrentPage < totalPages,
    [validCurrentPage, totalPages]
  );

  // Vérifier si on peut aller à la page précédente
  const hasPrev = useMemo(() => 
    validCurrentPage > 1,
    [validCurrentPage]
  );

  // Obtenir la plage de pages à afficher (pour la pagination)
  const getPageRange = useCallback((maxPages = 5) => {
    const pages = [];
    const halfMax = Math.floor(maxPages / 2);
    
    let startPage = Math.max(1, validCurrentPage - halfMax);
    let endPage = Math.min(totalPages, startPage + maxPages - 1);
    
    // Ajuster si on est près de la fin
    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }, [validCurrentPage, totalPages]);

  // Obtenir les infos de la pagination
  const paginationInfo = useMemo(() => {
    const startIndex = (validCurrentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, items.length);
    
    return {
      currentPage: validCurrentPage,
      totalPages,
      itemsPerPage,
      totalItems: items.length,
      startIndex: startIndex + 1, // +1 pour affichage humain (commence à 1)
      endIndex,
      hasNext,
      hasPrev,
      isFirstPage: validCurrentPage === 1,
      isLastPage: validCurrentPage === totalPages
    };
  }, [validCurrentPage, totalPages, itemsPerPage, items.length, hasNext, hasPrev]);

  // Réinitialiser à la page 1
  const reset = useCallback(() => {
    setCurrentPage(1);
  }, []);

  return {
    // Items paginés
    paginatedItems,
    
    // État
    currentPage: validCurrentPage,
    totalPages,
    itemsPerPage,
    hasNext,
    hasPrev,
    
    // Actions
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    reset,
    
    // Utilitaires
    getPageRange,
    paginationInfo
  };
};

export default usePagination;

/**
 * EXEMPLES D'UTILISATION :
 * 
 * // Basique
 * const products = [...]; // Vos produits
 * 
 * const {
 *   paginatedItems,
 *   currentPage,
 *   totalPages,
 *   goToPage,
 *   nextPage,
 *   prevPage
 * } = usePagination(products, 12);
 * 
 * return (
 *   <div>
 *     {// Afficher les produits //}
 *     <div className="grid">
 *       {paginatedItems.map(product => (
 *         <ProductCard key={product._id} product={product} />
 *       ))}
 *     </div>
 *     
 *     {// Navigation //}
 *     <div>
 *       <button onClick={prevPage} disabled={!hasPrev}>
 *         Précédent
 *       </button>
 *       
 *       <span>{currentPage} / {totalPages}</span>
 *       
 *       <button onClick={nextPage} disabled={!hasNext}>
 *         Suivant
 *       </button>
 *     </div>
 *   </div>
 * );
 * 
 * // Avec numéros de pages
 * const { getPageRange, goToPage, currentPage } = usePagination(products, 12);
 * 
 * const pageNumbers = getPageRange(5);
 * 
 * return (
 *   <div>
 *     {pageNumbers.map(page => (
 *       <button
 *         key={page}
 *         onClick={() => goToPage(page)}
 *         className={page === currentPage ? 'active' : ''}
 *       >
 *         {page}
 *       </button>
 *     ))}
 *   </div>
 * );
 * 
 * // Avec infos de pagination
 * const { paginationInfo } = usePagination(products, 12);
 * 
 * return (
 *   <p>
 *     Affichage de {paginationInfo.startIndex} à {paginationInfo.endIndex} 
 *     sur {paginationInfo.totalItems} produits
 *   </p>
 * );
 * 
 * // Avec le composant Pagination
 * import Pagination from '../components/shared/Pagination';
 * 
 * const {
 *   paginatedItems,
 *   currentPage,
 *   totalPages,
 *   goToPage
 * } = usePagination(filteredProducts, 12);
 * 
 * return (
 *   <>
 *     <ProductGrid products={paginatedItems} />
 *     
 *     <Pagination
 *       currentPage={currentPage}
 *       totalPages={totalPages}
 *       onPageChange={goToPage}
 *     />
 *   </>
 * );
 */
