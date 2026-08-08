import React, { useState, useEffect, useCallback } from "react";
import useProduct from "../../hooks/useProduct";
import ProductModal from "../../components/product/ProductModal";
import ProductTable from "../../components/product/ProuductTable";
import ProductSearch from "../../components/product/ProductSearch";
import ProductFilter from "../../components/product/ProductFilter";
import ProductPagination from "../../components/product/ProductPagination";
import { getActiveCategories } from "../../api/categoryApi";
import {
  FiPackage,
  FiPlus,
  FiRefreshCw,
  FiTrendingUp,
  FiTrendingDown,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";

const ProductPage = () => {
  const {
    products,
    loading,
    pagination,
    loadProducts,
    addProduct,
    editProduct,
    removeProduct,
  } = useProduct();

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
          const categoriesData = Array.isArray(res.data) ? res.data : [];
          setCategories(categoriesData);
        } else {
          console.error(
            "❌ Failed to load categories:",
            res?.message || "Unknown error",
          );
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

  // Handle filter changes
  const handleFilterChange = useCallback(
    (newFilter) => {
      setFilter(newFilter);
      loadProducts(newFilter);
    },
    [loadProducts],
  );

  // Handle page change
  const handlePageChange = useCallback(
    (page) => {
      const newFilter = { ...filter, page };
      setFilter(newFilter);
      loadProducts(newFilter);
    },
    [filter, loadProducts],
  );

  // Handle search
  const handleSearch = useCallback(
    (value) => {
      const newFilter = { ...filter, search: value, page: 1 };
      setFilter(newFilter);
      loadProducts(newFilter);
    },
    [filter, loadProducts],
  );

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
    Object.keys(formData).forEach((key) => {
      if (key === "image" && formData.image) {
        data.append("image", formData.image);
      } else if (key !== "image") {
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

  // Calculate stats
  const totalProducts = pagination.total || 0;
  const inStock = products.filter((p) => parseInt(p.qty) > 0).length;
  const lowStock = products.filter(
    (p) => parseInt(p.qty) > 0 && parseInt(p.qty) <= 5,
  ).length;
  const outOfStock = products.filter((p) => parseInt(p.qty) === 0).length;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 tracking-tight">
            Product Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your product inventory
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => loadProducts(filter)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-600 text-sm font-medium rounded-lg border border-gray-200 transition-colors"
          >
            <FiRefreshCw
              className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
          <button
            onClick={handleAddClick}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-black hover:bg-gray-800 text-white rounded-lg transition-all shadow-sm text-sm font-medium"
          >
            <FiPlus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                Total
              </p>
              <p className="text-2xl font-semibold text-gray-800 mt-1">
                {totalProducts}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
              <FiPackage className="w-5 h-5" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                In Stock
              </p>
              <p className="text-2xl font-semibold text-emerald-600 mt-1">
                {inStock}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <FiCheckCircle className="w-5 h-5" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                Low Stock
              </p>
              <p className="text-2xl font-semibold text-amber-600 mt-1">
                {lowStock}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <FiAlertCircle className="w-5 h-5" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                Out of Stock
              </p>
              <p className="text-2xl font-semibold text-red-600 mt-1">
                {outOfStock}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
              <FiXCircle className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <ProductSearch value={filter.search} onSearch={handleSearch} />
            </div>
          </div>
          <div className="mt-4">
            <ProductFilter
              filter={filter}
              categories={categories}
              onFilterChange={handleFilterChange}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="text-sm font-medium text-gray-700">Product List</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {totalProducts} products found
            </p>
          </div>
        </div>

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
  );
};

export default ProductPage;
