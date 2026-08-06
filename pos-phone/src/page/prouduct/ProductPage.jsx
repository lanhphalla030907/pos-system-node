
import React, { useState, useEffect, useCallback } from "react";
import useProduct from "../../hooks/useProduct";
import ProductModal from "../../components/product/ProductModal";
import ProductTable from "../../components/product/ProuductTable";
import ProductSearch from "../../components/product/ProductSearch";
import ProductFilter from "../../components/product/ProductFilter";
import ProductPagination from "../../components/product/ProductPagination";
import { getActiveCategories } from "../../api/categoryApi";

const ProductPage = () => {
  const { products, loading, pagination, loadProducts, addProduct, editProduct, removeProduct } = useProduct();

  const [categories, setCategories] = useState([]);
  const [filter, setFilter] = useState({
    search: "",
    page: 1,
    limit: 10,
    category_id: "",
    status: "",
    stock_status: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

 
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getActiveCategories();
        if (res?.success) {
          // Make sure it's an array
          const categoriesData = Array.isArray(res.data) ? res.data : [];
          setCategories(categoriesData);
        } else {
          console.error("❌ Failed to load categories:", res?.message || "Unknown error");
          setCategories([]);
        }
      } catch (error) {
        console.error("❌ Error fetching categories:", error);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // Load products on mount only
  useEffect(() => {
    if (isInitialLoad) {
      setIsInitialLoad(false);
      loadProducts(filter);
    }
  }, []);

  //  Handle filter changes with debugging
  const handleFilterChange = useCallback((newFilter) => {
    setFilter(newFilter);
    loadProducts(newFilter);
  }, [loadProducts]);

  // Handle page change
  const handlePageChange = useCallback((page) => {
    const newFilter = { ...filter, page };
    setFilter(newFilter);
    loadProducts(newFilter);
  }, [filter, loadProducts]);

  // Handle search
  const handleSearch = useCallback((value) => {
    const newFilter = { ...filter, search: value, page: 1 };
    setFilter(newFilter);
    loadProducts(newFilter);
  }, [filter, loadProducts]);

  // Handle add product
  const handleAddClick = () => {
    setIsEdit(false);
    setCurrentId(null);
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  // Handle edit product
  const handleEditClick = (product) => {
    setIsEdit(true);
    setCurrentId(product.id);
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setIsEdit(false);
    setCurrentId(null);
    setSelectedProduct(null);
  };

  // Handle form submit
  const handleSubmit = async (formData) => {
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'image' && formData.image) {
        data.append('image', formData.image);
      } else if (key !== 'image') {
        data.append(key, formData[key]);
      }
    });

    let response;
    if (isEdit) {
      response = await editProduct(currentId, data);
    } else {
      response = await addProduct(data);
    }

    if (response?.success) {
      handleModalClose();
      await loadProducts(filter);
    } else {
      alert(response?.message || "Operation failed!");
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      const response = await removeProduct(id);
      if (response?.success) {
        await loadProducts(filter);
      } else {
        alert(response?.message || "Delete failed!");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className=" px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your product inventory</p>
          </div>
          <button
            onClick={handleAddClick}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition shadow-sm"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Product
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Total Products</p>
            <p className="text-2xl font-bold text-gray-900">{pagination.total || 0}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500">In Stock</p>
            <p className="text-2xl font-bold text-green-600">
              {products.filter(p => parseInt(p.qty) > 0).length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Low Stock</p>
            <p className="text-2xl font-bold text-yellow-600">
              {products.filter(p => parseInt(p.qty) > 0 && parseInt(p.qty) <= 5).length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Out of Stock</p>
            <p className="text-2xl font-bold text-red-600">
              {products.filter(p => parseInt(p.qty) === 0).length}
            </p>
          </div>
        </div>

        {/* Debug: Show categories count */}
        <div className="text-xs text-gray-400 mb-2">
          Categories loaded: {categories.length}
        </div>

        {/* Search and Filter */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <ProductSearch 
              value={filter.search} 
              onSearch={handleSearch} 
            />
          </div>
          <ProductFilter
            filter={filter}
            categories={categories}
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <ProductTable
            products={products}
            loading={loading}
            onEdit={handleEditClick}
            onDelete={handleDelete}
          />
          
          
          <ProductPagination
            currentPage={pagination.currentPage || filter.page}
            totalPages={pagination.totalPages || 1}
            totalItems={pagination.total || 0}
            limit={filter.limit}
            onPageChange={handlePageChange}
          />
        </div>

        {/* Modal */}
        <ProductModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          categories={categories}
          isEdit={isEdit}
          selectedProduct={selectedProduct}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
};

export default ProductPage;