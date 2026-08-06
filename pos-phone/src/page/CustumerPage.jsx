import React, { useEffect, useState, useCallback } from "react";
import { useCustomer } from "../hooks/useCustomer";

const CustomerPage = () => {
  const { 
    customers, 
    loading, 
    loadCustomers, 
    addCustomer, 
    editCustomer,
    removeCustomer,
    selectCustomer 
  } = useCustomer();

  const [filter, setFilter] = useState({
    search: "",
    type: "",
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
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilter({ search: "", type: "" });
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
      discount: customer.discount || 0,
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
        // Update existing customer
        res = await editCustomer(editingCustomer.id, formData);
      } else {
        // Create new customer
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
        // Reload customers
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
    alert(`Selected customer: ${customer.name} (Discount: ${customer.discount || 0}%)`);
  };

  // Get customer type badge
  const getTypeBadge = (type) => {
    const typeMap = {
      vip: { label: "VIP", color: "bg-yellow-100 text-yellow-800", icon: "⭐ " },
      member: { label: "Member", color: "bg-green-100 text-green-800", icon: "" },
      regular: { label: "Regular", color: "bg-blue-100 text-blue-800", icon: "" },
    };
    const t = typeMap[type?.toLowerCase()] || typeMap.regular;
    return t;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Customers</h1>
            <p className="text-sm text-gray-500 mt-1">
              {loading ? "Loading..." : `${customers.length} customers found`}
            </p>
          </div>
          <button
            onClick={handleAddClick}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Customer
          </button>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                id="search"
                type="text"
                placeholder="Search by name, phone, email, or address..."
                value={filter.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>

            <div className="sm:w-48">
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Customer Type
              </label>
              <select
                id="type"
                value={filter.type}
                onChange={(e) => handleFilterChange("type", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white"
              >
                <option value="">All Types</option>
                <option value="vip">⭐ VIP</option>
                <option value="member">Member</option>
                <option value="regular">Regular</option>
              </select>
            </div>

            {(filter.search || filter.type) && (
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 underline underline-offset-2 transition"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No customers found</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or add a new customer</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Discount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Spent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {customers.map((item) => {
                    const typeBadge = getTypeBadge(item.type);
                    return (
                      <tr key={item.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.id}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm mr-3">
                              {item.name?.charAt(0).toUpperCase() || "?"}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {item.name || "N/A"}
                              </div>
                              <div className="text-xs text-gray-500">
                                Created by: {item.create_by || "System"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {item.tel || "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.email || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {item.address || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeBadge.color}`}
                          >
                            {typeBadge.icon}
                            {typeBadge.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.discount > 0 
                              ? "bg-purple-100 text-purple-800" 
                              : "bg-gray-100 text-gray-600"
                          }`}>
                            {item.discount || 0}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ${parseFloat(item.total_spent || 0).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(item.create_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleSelectCustomer(item)}
                              className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50 transition"
                              title="Select for POS"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleEditClick(item)}
                              className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition"
                              title="Edit customer"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteClick(item)}
                              className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition"
                              title="Delete customer"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {editingCustomer ? "Edit Customer" : "Add New Customer"}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="tel"
                    value={formData.tel}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="regular">Regular</option>
                    <option value="member">Member</option>
                    <option value="vip">VIP</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    step="0.5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Custom discount for this customer (0-100%)
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  disabled={loading}
                >
                  {loading ? "Saving..." : editingCustomer ? "Update" : "Create"}
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