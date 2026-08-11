import React, { useEffect, useState, useCallback } from "react";
import { useCustomer } from "../hooks/useCustomer";
import {
  FiUsers,
  FiUserPlus,
  FiSearch,
  FiX,
  FiEdit2,
  FiTrash2,
  FiUser,
  FiPhone,
  FiMail,
  FiMapPin,
  FiTag,
  FiDollarSign,
  FiClock,
  FiCheckCircle,
  FiStar,
  FiRefreshCw,
  FiShoppingBag,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

const CustomerPage = () => {
  const { 
    customers, 
    loading, 
    loadCustomers, 
    addCustomer, 
    editCustomer,
    removeCustomer,
    selectCustomer,
    pagination,
    summary,
  } = useCustomer();

  const [filter, setFilter] = useState({
    search: "",
    type: "",
    page: 1,
    limit: 10,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    tel: "",
    email: "",
    address: "",
    type: "regular",
    discount: 0,
  });

  // Load customers on mount and when filter changes
  useEffect(() => {
    loadCustomers(filter);
  }, [filter, loadCustomers]);

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilter(prev => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilter({ search: "", type: "", page: 1, limit: 10 });
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= (pagination?.totalPages || 1)) {
      setFilter(prev => ({ ...prev, page: newPage }));
    }
  };

  // Open modal for new customer
  const handleAddClick = () => {
    setEditingCustomer(null);
    setFormData({
      name: "",
      tel: "",
      email: "",
      address: "",
      type: "regular",
      discount: 0,
    });
    setIsModalOpen(true);
  };

  // Open modal for editing customer
  const handleEditClick = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name || "",
      tel: customer.tel || "",
      email: customer.email || "",
      address: customer.address || "",
      type: customer.type || "regular",
      discount: parseFloat(customer.discount) || 0,
    });
    setIsModalOpen(true);
  };

  // Handle delete customer
  const handleDeleteClick = async (customer) => {
    if (window.confirm(`Are you sure you want to delete customer "${customer.name}"?`)) {
      const res = await removeCustomer(customer.id);
      if (res?.success) {
        alert("Customer deleted successfully!");
        loadCustomers(filter);
      } else {
        alert(res?.message || "Failed to delete customer");
      }
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert("Customer name is required");
      return;
    }

    try {
      let res;
      if (editingCustomer) {
        res = await editCustomer(editingCustomer.id, formData);
      } else {
        res = await addCustomer(formData);
      }
      
      if (res?.success) {
        alert(editingCustomer ? "Customer updated successfully!" : "Customer created successfully!");
        setIsModalOpen(false);
        setFormData({
          name: "",
          tel: "",
          email: "",
          address: "",
          type: "regular",
          discount: 0,
        });
        loadCustomers(filter);
      } else {
        if (res?.message?.includes("already exists")) {
          alert(res.message);
        } else {
          alert(res?.message || "Failed to save customer");
        }
      }
    } catch (error) {
      console.error("Error saving customer:", error);
      if (error.message?.includes("already exists")) {
        alert(error.message);
      } else {
        alert("An error occurred while saving the customer. Please try again.");
      }
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "discount" ? parseFloat(value) || 0 : value,
    }));
  };

  // Handle select customer (for POS)
  const handleSelectCustomer = (customer) => {
    selectCustomer(customer);
    alert(`Selected customer: ${customer.name} (Discount: ${parseFloat(customer.discount) || 0}%)`);
  };

  // Get customer type badge
  const getTypeBadge = (type) => {
    const typeMap = {
      vip: { label: "VIP", color: "bg-amber-50 text-amber-700 border-amber-200", icon: FiStar },
      member: { label: "Member", color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: FiCheckCircle },
      regular: { label: "Regular", color: "bg-gray-50 text-gray-700 border-gray-200", icon: FiUser },
    };
    return typeMap[type?.toLowerCase()] || typeMap.regular;
  };

  // Safely get customers array
  const customerList = Array.isArray(customers) ? customers : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 tracking-tight">
            Customer Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {loading ? "Loading..." : `${summary?.total || 0} customers found`}
          </p>
        </div>
        <button
          onClick={handleAddClick}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-black hover:bg-gray-800 text-white rounded-lg transition-all shadow-sm text-sm font-medium"
        >
          <FiUserPlus className="w-4 h-4" />
          Add Customer
        </button>
      </div>

      {/* Stats Cards - Using summary from hook */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total</p>
              <p className="text-2xl font-semibold text-gray-800 mt-1">{summary?.total || 0}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
              <FiUsers className="w-5 h-5" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">VIP</p>
              <p className="text-2xl font-semibold text-gray-800 mt-1">{summary?.vip || 0}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <FiStar className="w-5 h-5" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Members</p>
              <p className="text-2xl font-semibold text-gray-800 mt-1">{summary?.member || 0}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <FiCheckCircle className="w-5 h-5" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Regular</p>
              <p className="text-2xl font-semibold text-gray-800 mt-1">{summary?.regular || 0}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-600">
              <FiUser className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, phone, email, or address..."
              value={filter.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white"
            />
            {filter.search && (
              <button
                onClick={() => handleFilterChange("search", "")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="sm:w-48">
            <select
              value={filter.type}
              onChange={(e) => handleFilterChange("type", e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white"
            >
              <option value="">All Types</option>
              <option value="vip">⭐ VIP</option>
              <option value="member">Member</option>
              <option value="regular">Regular</option>
            </select>
          </div>

          {(filter.search || filter.type) && (
            <button
              onClick={clearFilters}
              className="px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors whitespace-nowrap"
            >
              Clear filters
            </button>
          )}

          <button
            onClick={() => loadCustomers(filter)}
            className="px-4 py-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiRefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Results Section */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent"></div>
            <p className="text-sm text-gray-500 mt-3">Loading customers...</p>
          </div>
        ) : customerList.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiUsers className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">No customers found</p>
            <p className="text-sm text-gray-400 mt-1">
              {filter.search || filter.type ? "Try adjusting your filters" : "Add your first customer"}
            </p>
            {!filter.search && !filter.type && (
              <button
                onClick={handleAddClick}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-lg transition-all text-sm font-medium"
              >
                <FiUserPlus className="w-4 h-4" />
                Add Customer
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              {/* Desktop Table */}
              <table className="w-full hidden md:table">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spent</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {customerList.map((item) => {
                    const typeBadge = getTypeBadge(item.type);
                    const Icon = typeBadge.icon;
                    const discount = parseFloat(item.discount) || 0;
                    return (
                      <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-500">
                          #{item.id}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 font-medium text-sm flex-shrink-0">
                              {item.name?.charAt(0).toUpperCase() || "?"}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-800">
                                {item.name || "N/A"}
                              </div>
                              <div className="text-xs text-gray-400">
                                ID: {item.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-700">{item.tel || "N/A"}</div>
                          <div className="text-xs text-gray-400 truncate max-w-[120px]">{item.email || "N/A"}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-600 max-w-[150px] truncate">
                            {item.address || "N/A"}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full border ${typeBadge.color}`}>
                            <Icon className="w-3 h-3" />
                            {typeBadge.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${
                            discount > 0 
                              ? "bg-purple-50 text-purple-700 border border-purple-200" 
                              : "bg-gray-50 text-gray-500 border border-gray-200"
                          }`}>
                            <FiDollarSign className="w-3 h-3" />
                            {discount}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-800">
                          ${parseFloat(item.total_spent || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          <div className="flex items-center gap-1.5">
                            <FiClock className="w-3.5 h-3.5 text-gray-400" />
                            <span>{formatDate(item.create_at)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleSelectCustomer(item)}
                              className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Select for POS"
                            >
                              <FiShoppingBag className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditClick(item)}
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit customer"
                            >
                              <FiEdit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(item)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete customer"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-gray-100">
                {customerList.map((item) => {
                  const typeBadge = getTypeBadge(item.type);
                  const Icon = typeBadge.icon;
                  const discount = parseFloat(item.discount) || 0;
                  return (
                    <div key={item.id} className="p-4 hover:bg-gray-50/80 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 font-medium text-sm flex-shrink-0">
                            {item.name?.charAt(0).toUpperCase() || "?"}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-800">
                              {item.name || "N/A"}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full border ${typeBadge.color}`}>
                                <Icon className="w-3 h-3" />
                                {typeBadge.label}
                              </span>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full ${
                                discount > 0 
                                  ? "bg-purple-50 text-purple-700 border border-purple-200" 
                                  : "bg-gray-50 text-gray-500 border border-gray-200"
                              }`}>
                                <FiDollarSign className="w-3 h-3" />
                                {discount}%
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleSelectCustomer(item)}
                            className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <FiShoppingBag className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditClick(item)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(item)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                        <div>
                          <p className="text-xs text-gray-400">Phone</p>
                          <p className="text-gray-700">{item.tel || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Email</p>
                          <p className="text-gray-700 truncate">{item.email || "N/A"}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-xs text-gray-400">Address</p>
                          <p className="text-gray-600">{item.address || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Total Spent</p>
                          <p className="text-sm font-medium text-gray-800">
                            ${parseFloat(item.total_spent || 0).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Created</p>
                          <p className="text-xs text-gray-500">{formatDate(item.create_at)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-200 bg-gray-50/50 flex items-center justify-between flex-wrap gap-2">
                <div className="text-sm text-gray-500">
                  Showing {(pagination.page - 1) * pagination.limit + 1} -{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} customers
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-3 py-1 text-sm font-medium text-gray-700">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add/Edit Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {editingCustomer ? "Edit Customer" : "Add New Customer"}
                </h3>
                <p className="text-sm text-gray-500">
                  {editingCustomer ? "Update customer information" : "Create a new customer account"}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white"
                    placeholder="Enter customer name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="tel"
                    name="tel"
                    value={formData.tel}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white"
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Address
                </label>
                <div className="relative">
                  <FiMapPin className="absolute left-3.5 top-3 text-gray-400 w-4 h-4" />
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="2"
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white resize-none"
                    placeholder="Enter address"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Customer Type
                  </label>
                  <div className="relative">
                    <FiTag className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white"
                    >
                      <option value="regular">Regular</option>
                      <option value="member">Member</option>
                      <option value="vip">VIP</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Discount (%)
                  </label>
                  <div className="relative">
                    <FiDollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="number"
                      name="discount"
                      value={formData.discount}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      step="0.5"
                      className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-black hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-all shadow-sm flex-1"
                  disabled={loading}
                >
                  {loading ? "Saving..." : editingCustomer ? "Update Customer" : "Create Customer"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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

export default CustomerPage;