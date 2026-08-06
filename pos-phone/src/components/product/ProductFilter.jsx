// components/product/ProductFilter.jsx
import React from 'react';

const ProductFilter = ({ filter, categories = [], onFilterChange }) => {

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    onFilterChange({
      ...filter,
      [name]: value,
      page: 1,
    });
  };

  const handleClearFilters = () => {
    onFilterChange({
      search: "",
      page: 1,
      limit: 10,
      category_id: "",
      status: "",
      stock_status: "",
    });
  };

  const activeFilterCount = [
    filter.search,
    filter.category_id,
    filter.status,
    filter.stock_status
  ].filter(Boolean).length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <h3 className="text-sm font-medium text-gray-700">Filters</h3>
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={handleClearFilters}
            className="text-sm text-gray-500 hover:text-gray-700 hover:underline transition"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Filter Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Category Filter - FIXED: Use Id and Name */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Category
          </label>
          <select
            name="category_id"
            value={filter.category_id}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition outline-none bg-white"
          >
            <option value="">All Categories</option>
            {Array.isArray(categories) && categories.length > 0 ? (
              categories.map((category) => (
                // FIXED: Use Id and Name (capital letters)
                <option key={category.Id} value={category.Id}>
                  {category.Name}
                </option>
              ))
            ) : (
              <option value="" disabled>No categories available</option>
            )}
          </select>
          {(!Array.isArray(categories) || categories.length === 0) && (
            <p className="text-xs text-red-500 mt-1">⚠️ No categories loaded</p>
          )}
        </div>

        {/* Status Filter - FIXED: Use numbers */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Status
          </label>
          <select
            name="status"
            value={filter.status}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition outline-none bg-white"
          >
            <option value="">All Status</option>
            <option value="1">Active</option>
            <option value="0">Inactive</option>
          </select>
        </div>

        {/* Stock Status Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Stock Status
          </label>
          <select
            name="stock_status"
            value={filter.stock_status}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition outline-none bg-white"
          >
            <option value="">All Stock</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>

        {/* Items Per Page */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Items Per Page
          </label>
          <select
            name="limit"
            value={filter.limit}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition outline-none bg-white"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-200">
          <span className="text-xs text-gray-500 font-medium">Active filters:</span>
          
          {filter.category_id && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-green-50 text-green-700 rounded-full border border-green-200">
              {/* FIXED: Use Id and Name */}
              Category: {Array.isArray(categories) && categories.find(c => c.Id === parseInt(filter.category_id))?.Name || 'Unknown'}
              <button
                onClick={() => onFilterChange({ ...filter, category_id: "", page: 1 })}
                className="ml-0.5 hover:text-green-900 transition"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
          
          {filter.status && (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full border ${
              filter.status === '1' 
                ? 'bg-green-50 text-green-700 border-green-200' 
                : 'bg-red-50 text-red-700 border-red-200'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                filter.status === '1' ? 'bg-green-500' : 'bg-red-500'
              }`}></span>
              {filter.status === '1' ? 'Active' : 'Inactive'}
              <button
                onClick={() => onFilterChange({ ...filter, status: "", page: 1 })}
                className="ml-0.5 hover:opacity-70 transition"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
          
          {filter.stock_status && (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full border ${
              filter.stock_status === 'in_stock' 
                ? 'bg-green-50 text-green-700 border-green-200'
                : filter.stock_status === 'low_stock'
                ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                : 'bg-red-50 text-red-700 border-red-200'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                filter.stock_status === 'in_stock' 
                  ? 'bg-green-500'
                  : filter.stock_status === 'low_stock'
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}></span>
              {filter.stock_status === 'in_stock' && 'In Stock'}
              {filter.stock_status === 'low_stock' && 'Low Stock'}
              {filter.stock_status === 'out_of_stock' && 'Out of Stock'}
              <button
                onClick={() => onFilterChange({ ...filter, stock_status: "", page: 1 })}
                className="ml-0.5 hover:opacity-70 transition"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductFilter;