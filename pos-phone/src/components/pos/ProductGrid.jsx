// components/pos/ProductGrid.jsx
import React, { useState, useMemo, useEffect } from 'react';
import ProductCard from './ProductCard';
import { getActiveCategories } from '../../api/categoryApi';

const ProductGrid = ({ products, loading, onProductClick, memberDiscount = 0 }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);

  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getActiveCategories();
        if (res?.success) {
          setCategories(Array.isArray(res.data) ? res.data : []);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // Filter products
  const filteredProducts = useMemo(() => {
    let filtered = Array.isArray(products) ? products : [];
    
    if (searchTerm && searchTerm.trim()) {
      filtered = filtered.filter(p => 
        p?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p?.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(p => p?.category_id === parseInt(selectedCategory));
    }
    
    return filtered;
  }, [products, searchTerm, selectedCategory]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Search and Filter */}
      <div className="flex gap-3 mb-3 flex-shrink-0">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name or barcode..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={handleCategoryChange}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[130px]"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat.Id} value={cat.Id}>
              {cat.Name}
            </option>
          ))}
        </select>
      </div>
      {/* Product Grid */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading products...</div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">No products found</div>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
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