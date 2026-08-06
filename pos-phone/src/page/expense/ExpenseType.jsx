// components/ExpenseType.jsx
import React, { useState, useEffect } from "react";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
  FiCheck,
  FiTag,
  FiHash,
  FiGrid,
  FiSearch,
  FiRefreshCw,
  FiAlertCircle,
} from "react-icons/fi";
import useExpenseType from "../../hooks/useExpenseType";

const ExpenseType = () => {
  const {
    expenseTypes,
    loading,
    loadExpenseTypes,
    createExpenseType,
    updateExpenseType,
    deleteExpenseType,
  } = useExpenseType();

  const [showModal, setShowModal] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    code: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    loadExpenseTypes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: "" });
    }
    setSubmitError("");
    setSuccessMessage("");
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Category name is required";
    if (!formData.code.trim()) errors.code = "Category code is required";
    if (formData.code && !/^[A-Z0-9_]+$/.test(formData.code)) {
      errors.code = "Code must contain only uppercase letters, numbers, and underscores";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitError("");
    setSuccessMessage("");

    try {
      const typeData = {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
      };

      let result;
      if (editingType) {
        result = await updateExpenseType(editingType.id, typeData);
        if (result) {
          setSuccessMessage("Category updated successfully!");
        }
      } else {
        result = await createExpenseType(typeData);
        if (result) {
          setSuccessMessage("Category created successfully!");
        }
      }

      if (result) {
        setFormData({ name: "", code: "" });
        await loadExpenseTypes();
        setTimeout(() => {
          setShowModal(false);
          setEditingType(null);
          setSuccessMessage("");
        }, 1500);
      }
    } catch (error) {
      console.error("Error saving expense type:", error);
      setSubmitError(error.message || "An error occurred");
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await deleteExpenseType(id);
      await loadExpenseTypes();
      setSuccessMessage("Category deleted successfully!");
      setTimeout(() => setSuccessMessage(""), 2000);
    } catch (error) {
      console.error("Error deleting expense type:", error);
      setSubmitError(error.message || "Failed to delete category");
    }
  };

  const handleEdit = (type) => {
    setEditingType(type);
    setFormData({
      name: type.name || "",
      code: type.code || "",
    });
    setShowModal(true);
    setFormErrors({});
    setSubmitError("");
    setSuccessMessage("");
  };

  const openCreateModal = () => {
    setEditingType(null);
    setFormData({ name: "", code: "" });
    setShowModal(true);
    setFormErrors({});
    setSubmitError("");
    setSuccessMessage("");
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingType(null);
    setFormData({ name: "", code: "" });
    setFormErrors({});
    setSubmitError("");
    setSuccessMessage("");
  };

  const filteredTypes = expenseTypes.filter((type) =>
    type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    type.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (name) => {
    return name?.charAt(0).toUpperCase() || "?";
  };

  const getColorForCode = (code) => {
    const colors = [
      "bg-gray-100 text-gray-700",
      "bg-blue-50 text-blue-700",
      "bg-emerald-50 text-emerald-700",
      "bg-purple-50 text-purple-700",
      "bg-rose-50 text-rose-700",
      "bg-amber-50 text-amber-700",
      "bg-cyan-50 text-cyan-700",
      "bg-indigo-50 text-indigo-700",
    ];
    const index = code?.charCodeAt(0) || 0;
    return colors[index % colors.length];
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 tracking-tight">
              Expense Categories
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Manage your expense categories
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-black hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-all shadow-sm"
          >
            <FiPlus className="w-4 h-4" />
            Add Category
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Categories</p>
              <p className="text-2xl font-semibold text-gray-800 mt-1">
                {expenseTypes.length}
              </p>
            </div>
            <div className="w-11 h-11 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700">
              <FiTag className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Active Categories</p>
              <p className="text-2xl font-semibold text-gray-800 mt-1">
                {expenseTypes.length}
              </p>
            </div>
            <div className="w-11 h-11 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <FiCheck className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Inactive</p>
              <p className="text-2xl font-semibold text-gray-800 mt-1">0</p>
            </div>
            <div className="w-11 h-11 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
              <FiGrid className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Search & Refresh */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="relative max-w-sm flex-1">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white"
          />
        </div>
        <button
          onClick={() => loadExpenseTypes()}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-600 text-sm font-medium rounded-lg border border-gray-200 transition-colors"
        >
          <FiRefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="mb-4 bg-emerald-50 border border-emerald-200 rounded-lg p-3.5 flex items-start gap-3">
          <FiCheck className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-emerald-700">{successMessage}</p>
        </div>
      )}

      {submitError && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3.5 flex items-start gap-3">
          <FiAlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{submitError}</p>
        </div>
      )}

      {/* Categories Grid */}
      {loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 flex items-center justify-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          <span className="ml-3 text-sm text-gray-500">Loading categories...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTypes.map((type) => (
            <div
              key={type.id}
              className="group bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all duration-200 hover:border-gray-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getColorForCode(type.code)}`}>
                    <FiTag className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-medium text-gray-800 truncate">
                      {type.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <FiHash className="w-3 h-3 text-gray-400" />
                      <span className="text-xs font-mono text-gray-500">
                        {type.code}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0">
                  <button
                    onClick={() => handleEdit(type)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit category"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(type.id, type.name)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete category"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  ID: {type.id}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Active
                </span>
              </div>
            </div>
          ))}
          {filteredTypes.length === 0 && (
            <div className="col-span-full">
              <div className="bg-white rounded-lg border-2 border-dashed border-gray-200 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiTag className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-gray-600 font-medium mb-1">No categories found</h3>
                <p className="text-sm text-gray-400">
                  {searchTerm ? "Try adjusting your search" : "Create your first category to get started"}
                </p>
                {!searchTerm && (
                  <button
                    onClick={openCreateModal}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-black hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-all"
                  >
                    <FiPlus className="w-4 h-4" />
                    Add Category
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {editingType ? "Edit Category" : "Add Category"}
                </h3>
                <p className="text-sm text-gray-500">
                  {editingType ? "Update category details" : "Create a new expense category"}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {successMessage && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3.5 flex items-start gap-3">
                  <FiCheck className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-emerald-700">{successMessage}</p>
                </div>
              )}

              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3.5 flex items-start gap-3">
                  <FiAlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{submitError}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiTag className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className={`w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white ${
                      formErrors.name ? "border-red-400" : "border-gray-200"
                    }`}
                    placeholder="e.g., Food, Transport, Utilities"
                  />
                </div>
                {formErrors.name && (
                  <p className="mt-1.5 text-xs text-red-500">{formErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Category Code <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiHash className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    required
                    className={`w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white ${
                      formErrors.code ? "border-red-400" : "border-gray-200"
                    }`}
                    placeholder="e.g., FOOD, TRAN, UTIL"
                  />
                </div>
                {formErrors.code && (
                  <p className="mt-1.5 text-xs text-red-500">{formErrors.code}</p>
                )}
                <p className="mt-1 text-xs text-gray-400">
                  Uppercase letters, numbers, and underscores only
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-black hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-all shadow-sm"
                >
                  {editingType ? "Update Category" : "Create Category"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-600 text-sm font-medium rounded-lg border border-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseType;