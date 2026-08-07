// components/product/ProductSearch.jsx
import React from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

const ProductSearch = ({ value, onSearch }) => {
  const handleChange = (e) => {
    onSearch(e.target.value);
  };

  const clearSearch = () => {
    onSearch('');
  };

  return (
    <div className="relative w-full">
      <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
      <input
        type="text"
        placeholder="Search by name, barcode, or category..."
        value={value}
        onChange={handleChange}
        className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white"
      />
      {value && (
        <button
          onClick={clearSearch}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <FiX className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default ProductSearch;