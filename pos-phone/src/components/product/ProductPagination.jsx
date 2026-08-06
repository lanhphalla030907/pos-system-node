// components/product/ProductPagination.jsx
import React from 'react';

const ProductPagination = ({ 
  currentPage = 1, 
  totalPages = 1, 
  totalItems = 0, 
  limit = 10,
  onPageChange 
}) => {

  if (totalPages <= 1 && totalItems <= limit) {
    return null;
  }

  // Calculate page range to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    const halfVisible = Math.floor(maxVisible / 2);

    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, currentPage + halfVisible);

    // Adjust if we're near the beginning
    if (currentPage - halfVisible < 1) {
      endPage = Math.min(totalPages, endPage + (halfVisible - currentPage + 1));
    }

    // Adjust if we're near the end
    if (currentPage + halfVisible > totalPages) {
      startPage = Math.max(1, startPage - (currentPage + halfVisible - totalPages));
    }

    // Always show first page
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) pages.push('...');
    }

    // Add visible pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Always show last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  const handlePageClick = (page) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  // Calculate item range
  const startItem = totalItems === 0 ? 0 : ((currentPage - 1) * limit) + 1;
  const endItem = Math.min(currentPage * limit, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-gray-50 border-t border-gray-200 rounded-b-xl">
      {/* Items info */}
      <div className="text-sm text-gray-600">
        {totalItems > 0 ? (
          <>Showing {startItem} to {endItem} of {totalItems} items</>
        ) : (
          <>No items found</>
        )}
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-1">
        {/* Previous button */}
        <button
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-3 py-1 text-sm rounded-md transition ${
            currentPage === 1
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-700 hover:bg-gray-200'
          }`}
          aria-label="Previous page"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Page numbers */}
        {getPageNumbers().map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="px-2 py-1 text-gray-500 text-sm">…</span>
            ) : (
              <button
                onClick={() => handlePageClick(page)}
                className={`px-3 py-1 text-sm rounded-md transition ${
                  page === currentPage
                    ? 'bg-blue-600 text-white font-medium cursor-default'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
                aria-label={`Go to page ${page}`}
                aria-current={page === currentPage ? 'page' : undefined}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}

        {/* Next button */}
        <button
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-3 py-1 text-sm rounded-md transition ${
            currentPage === totalPages
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-700 hover:bg-gray-200'
          }`}
          aria-label="Next page"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Quick jump - only for many pages */}
      {totalPages > 10 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Go to</span>
          <input
            type="number"
            min="1"
            max={totalPages}
            defaultValue={currentPage}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const page = parseInt(e.target.value);
                if (page >= 1 && page <= totalPages) {
                  handlePageClick(page);
                }
                e.target.value = currentPage; // Reset input
              }
            }}
            className="w-14 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            aria-label="Jump to page"
          />
          <span className="text-sm text-gray-600">of {totalPages}</span>
        </div>
      )}
    </div>
  );
};

export default ProductPagination;