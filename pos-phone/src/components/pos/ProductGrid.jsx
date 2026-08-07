// components/pos/ProductGrid.jsx - Fixed list view with ProductImage component
import React, { useState, useMemo, useEffect } from "react";
import ProductCard from "./ProductCard";
import ProductImage from "../product/ProductImage";
import { getActiveCategories } from "../../api/categoryApi";
import { FiSearch, FiFilter, FiX, FiGrid, FiList, FiBox } from "react-icons/fi";

const ProductGrid = ({
  products,
  loading,
  onProductClick,
  memberDiscount = 0,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("grid");

  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getActiveCategories();
        if (res?.success) {
          setCategories(Array.isArray(res.data) ? res.data : []);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // Filter products
  const filteredProducts = useMemo(() => {
    let filtered = Array.isArray(products) ? products : [];

    if (searchTerm && searchTerm.trim()) {
      filtered = filtered.filter(
        (p) =>
          p?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p?.barcode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p?.code?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(
        (p) => p?.category_id === parseInt(selectedCategory),
      );
    }

    return filtered;
  }, [products, searchTerm, selectedCategory]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find((c) => c.Id === parseInt(categoryId));
    return category ? category.Name : "Uncategorized";
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-3 flex-shrink-0">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by name or barcode..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <FiX className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex gap-2">
          {/* Category Filter - Desktop */}
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="hidden sm:block px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none bg-white min-w-[140px]"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.Id} value={cat.Id}>
                {cat.Name}
              </option>
            ))}
          </select>

          {/* Mobile Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="sm:hidden px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FiFilter className="w-4 h-4 text-gray-600" />
          </button>

          {/* View Mode Toggle */}
          <div className="hidden sm:flex border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-2.5 py-2 transition-colors ${
                viewMode === "grid"
                  ? "bg-black text-white"
                  : "bg-white text-gray-500 hover:bg-gray-50"
              }`}
            >
              <FiGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-2.5 py-2 transition-colors ${
                viewMode === "list"
                  ? "bg-black text-white"
                  : "bg-white text-gray-500 hover:bg-gray-50"
              }`}
            >
              <FiList className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Category Filter - Expandable */}
      {showFilters && (
        <div className="sm:hidden mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Filter by Category
            </span>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-400"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none bg-white"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.Id} value={cat.Id}>
                {cat.Name}
              </option>
            ))}
          </select>
          {(searchTerm || selectedCategory) && (
            <button
              onClick={clearFilters}
              className="mt-2 text-xs text-gray-500 hover:text-gray-700"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Active Filters - Desktop */}
      {(searchTerm || selectedCategory) && (
        <div className="hidden sm:flex items-center gap-2 mb-3 flex-wrap">
          {searchTerm && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
              Search: "{searchTerm}"
              <button
                onClick={() => setSearchTerm("")}
                className="hover:text-gray-900"
              >
                <FiX className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedCategory && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
              Category: {getCategoryName(selectedCategory)}
              <button
                onClick={() => setSelectedCategory("")}
                className="hover:text-gray-900"
              >
                <FiX className="w-3 h-3" />
              </button>
            </span>
          )}
          <button
            onClick={clearFilters}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Results Count */}
      <div className="text-xs text-gray-400 mb-2 flex-shrink-0">
        {!loading && (
          <span>
            Showing {filteredProducts.length}{" "}
            {filteredProducts.length === 1 ? "product" : "products"}
            {selectedCategory && ` in ${getCategoryName(selectedCategory)}`}
          </span>
        )}
      </div>

      {/* Product Grid/List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent"></div>
            <p className="text-sm text-gray-500 mt-3">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <FiSearch className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-500">
              No products found
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {searchTerm || selectedCategory
                ? "Try adjusting your filters"
                : "No products available"}
            </p>
            {(searchTerm || selectedCategory) && (
              <button
                onClick={clearFilters}
                className="mt-3 text-xs text-black hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : viewMode === "list" ? (
          // List View - Fixed with ProductImage component
          <div className="space-y-2">
            {filteredProducts.map((product) => (
              <div
                key={product?.id}
                onClick={() => onProductClick(product)}
                className="flex items-center gap-4 p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer"
              >
                <div className="w-12 h-12 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                  <ProductImage 
                    image={product?.image} 
                    alt={product?.name} 
                    size="sm"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-800 text-sm truncate">
                    {product?.name || 'Unnamed'}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>{product?.category_name || "Uncategorized"}</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5">
                      <FiBox className="w-3 h-3" />
                      Stock: {parseInt(product?.qty) || 0}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-black text-sm">
                    ${parseFloat(product?.price || 0).toFixed(2)}
                  </p>
                  {parseFloat(product?.discount) > 0 && (
                    <p className="text-xs text-red-500">
                      -{product.discount}%
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Grid View
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product?.id}
                product={product}
                onClick={() => onProductClick(product)}
                memberDiscount={memberDiscount}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(ProductGrid);