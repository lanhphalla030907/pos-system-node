// pages/EmployeePage.jsx - With Alert & Confirm Modal
import React, { useState, useEffect, useRef } from "react";
import { useEmployee } from "../../hooks/useEmployee";
import useRole from "../../hooks/useRole";
import { Link } from "react-router-dom";
import EmployeeImage from "../../components/employee/EmployeeImage";
import CreateAccountModal from "../../components/employee/CreateAccountModal";
import { useAlert } from "../../components/common/Alert";
import { useConfirm } from "../../hooks/useConfirm";
import ConfirmModal from "../../components/common/ConfirmModal";

const EmployeePage = () => {
  const {
    employees,
    loading,
    pagination,
    loadEmployees,
    changeStatus,
    removeEmployee,
    addEmployeeAccount,
  } = useEmployee();

  const alert = useAlert();
  const { showConfirm, config, setLoading: setConfirmLoading } = useConfirm();

  const { roles, loading: rolesLoading, loadRoles } = useRole();

  const [filter, setFilter] = useState({
    search: "",
    status: "",
    role_id: "",
  });

  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [accountLoading, setAccountLoading] = useState(false);

  const hasLoadedRoles = useRef(false);

  // Load roles once
  useEffect(() => {
    if (!hasLoadedRoles.current) {
      hasLoadedRoles.current = true;
      loadRoles({ status: 1 });
    }
  }, [loadRoles]);

  // Load employees when filter changes
  useEffect(() => {
    loadEmployees(filter);
  }, [filter, loadEmployees]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilter((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Clear filters
  const clearFilters = () => {
    setFilter({ search: "", status: "", role_id: "" });
  };

  // Handle status toggle with Confirm Modal
  const handleStatusToggle = async (id, currentStatus, name) => {
    const newStatus = currentStatus === 1 ? 0 : 1;
    const action = newStatus === 1 ? "activate" : "deactivate";
    
    const confirmed = await showConfirm({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} Employee`,
      message: `Are you sure you want to ${action} "${name}"?`,
      confirmText: action.charAt(0).toUpperCase() + action.slice(1),
      cancelText: "Cancel",
      type: newStatus === 1 ? "success" : "warning",
    });

    if (!confirmed) return;

    setConfirmLoading(true);
    try {
      const loadingId = alert.showAlert({
        type: 'info',
        message: `${action} employee...`,
        description: `Please wait...`,
        duration: 0,
        closable: false,
      });

      const res = await changeStatus(id, newStatus);
      alert.hideAlert(loadingId);

      if (res?.success) {
        await loadEmployees(filter);
        alert.success(`Employee ${action}d successfully!`, {
          description: `"${name}" has been ${action}d.`,
        });
      } else {
        alert.error(`Failed to ${action} employee`, {
          description: res?.message || "Please try again.",
        });
      }
    } catch (error) {
      alert.error("An error occurred", {
        description: error.message || "Please try again later.",
      });
    } finally {
      setConfirmLoading(false);
    }
  };

  // Handle delete with Confirm Modal
  const handleDelete = async (id, name) => {
    const confirmed = await showConfirm({
      title: "Delete Employee",
      message: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      confirmText: "Delete Employee",
      cancelText: "Cancel",
      type: "danger",
    });

    if (!confirmed) return;

    setConfirmLoading(true);
    try {
      const loadingId = alert.showAlert({
        type: 'info',
        message: `Deleting "${name}"...`,
        description: 'Please wait...',
        duration: 0,
        closable: false,
      });

      const res = await removeEmployee(id);
      alert.hideAlert(loadingId);

      if (res?.success) {
        await loadEmployees(filter);
        alert.success("Employee deleted successfully!", {
          description: `"${name}" has been removed from the system.`,
        });
      } else {
        alert.error("Failed to delete employee", {
          description: res?.message || "Please try again.",
        });
      }
    } catch (error) {
      alert.error("An error occurred while deleting", {
        description: error.message || "Please try again later.",
      });
    } finally {
      setConfirmLoading(false);
    }
  };

  // Handle create account
  const handleCreateAccount = async (employeeId, data) => {
    setAccountLoading(true);
    try {
      const loadingId = alert.showAlert({
        type: 'info',
        message: 'Creating account...',
        description: 'Please wait...',
        duration: 0,
        closable: false,
      });

      const res = await addEmployeeAccount(employeeId, data);
      alert.hideAlert(loadingId);

      if (res?.success) {
        alert.success("Account created successfully!", {
          description: `Account has been created for "${selectedEmployee?.name}".`,
        });
        setIsAccountModalOpen(false);
        setSelectedEmployee(null);
        await loadEmployees(filter);
      } else {
        alert.error("Failed to create account", {
          description: res?.message || "Please try again.",
        });
      }
    } catch (error) {
      alert.error("An error occurred", {
        description: error.message || "Please try again later.",
      });
    } finally {
      setAccountLoading(false);
    }
  };

  // Open account modal
  const openAccountModal = (employee) => {
    if (employee.user_id) {
      alert.warning("Account already exists", {
        description: "This employee already has an account.",
      });
      return;
    }
    setSelectedEmployee(employee);
    setIsAccountModalOpen(true);
  };

  // Format date
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

  // Get status badge
  const getStatusBadge = (status) => {
    if (status === 1) {
      return {
        label: "Active",
        color: "bg-emerald-50 text-emerald-700 border-emerald-200",
        dotColor: "bg-emerald-500",
      };
    }
    return {
      label: "Inactive",
      color: "bg-gray-50 text-gray-500 border-gray-200",
      dotColor: "bg-gray-400",
    };
  };

  // Get gender badge
  const getGenderBadge = (gender) => {
    if (gender === "Male") {
      return { label: "Male", color: "bg-blue-50 text-blue-700 border-blue-200" };
    } else if (gender === "Female") {
      return { label: "Female", color: "bg-pink-50 text-pink-700 border-pink-200" };
    }
    return { label: "Other", color: "bg-gray-50 text-gray-600 border-gray-200" };
  };

  // Check if employee has account
  const hasAccount = (employee) => {
    return (
      employee.username &&
      employee.username !== null &&
      employee.username !== ""
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 tracking-tight">
              Employee Management
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {loading ? "Loading..." : `${employees.length} employees found`}
            </p>
          </div>
          <Link
            to="/employees/add"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-black hover:bg-gray-800 text-white rounded-lg transition-all shadow-sm text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Employee
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mb-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Search
              </label>
              <input
                type="text"
                placeholder="Search by name, code or phone..."
                value={filter.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Role
              </label>
              <select
                value={filter.role_id}
                onChange={(e) => handleFilterChange("role_id", e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white"
              >
                <option value="">All Roles</option>
                {rolesLoading ? (
                  <option value="" disabled>Loading roles...</option>
                ) : roles.length === 0 ? (
                  <option value="" disabled>No roles available</option>
                ) : (
                  roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Status
              </label>
              <select
                value={filter.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white"
              >
                <option value="">All Status</option>
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </select>
            </div>

            <div className="flex items-end gap-2">
              {(filter.search || filter.status || filter.role_id) && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Clear filters
                </button>
              )}
              <button
                onClick={() => {
                  loadEmployees(filter);
                  alert.success("Employees refreshed!", {
                    description: "Data has been updated.",
                    duration: 2000,
                  });
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-600 text-sm font-medium rounded-lg border border-gray-200 transition-colors"
                disabled={loading}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent"></div>
              <p className="text-sm text-gray-500 mt-3">Loading employees...</p>
            </div>
          ) : employees.length === 0 ? (
            <div className="text-center py-16">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <p className="text-gray-500 font-medium">No employees found</p>
              <p className="text-sm text-gray-400 mt-1">
                {filter.search || filter.status || filter.role_id ? "Try adjusting your filters" : "Add your first employee"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Code</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Contact</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Salary</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {employees.map((item) => {
                    const status = getStatusBadge(item.status);
                    const gender = getGenderBadge(item.gender);
                    const hasUserAccount = hasAccount(item);

                    return (
                      <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <EmployeeImage image={item.image} name={item.name} size="sm" />
                            <div>
                              <div className="text-sm font-medium text-gray-800">{item.name}</div>
                              <div className="text-xs text-gray-400 flex items-center gap-1">
                                <span>{gender.label}</span>
                                <span className="text-gray-300">•</span>
                                {hasUserAccount ? (
                                  <span className="text-blue-600 font-medium">@{item.username}</span>
                                ) : (
                                  <span className="text-amber-600">No account</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                          {item.code || "N/A"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-sm text-gray-700">{item.role_name || "N/A"}</span>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <div className="text-sm text-gray-600">{item.phone || "N/A"}</div>
                          <div className="text-xs text-gray-400">{item.email || "N/A"}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap hidden lg:table-cell">
                          <span className="text-sm font-medium text-gray-800">
                            ${parseFloat(item.salary || 0).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border ${status.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${status.dotColor}`}></span>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1">
                            {!hasUserAccount && (
                              <button
                                onClick={() => openAccountModal(item)}
                                className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="Create Account"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                              </button>
                            )}
                            {hasUserAccount && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                {item.username}
                              </span>
                            )}
                            <Link
                              to={`/employees/edit/${item.id}`}
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </Link>
                            <Link
                              to={`/employees/${item.id}`}
                              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </Link>
                            <button
                              onClick={() => handleStatusToggle(item.id, item.status, item.name)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                item.status === 1
                                  ? "text-gray-400 hover:text-amber-600 hover:bg-amber-50"
                                  : "text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"
                              }`}
                              title={item.status === 1 ? "Deactivate" : "Activate"}
                            >
                              {item.status === 1 ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              )}
                            </button>
                            <button
                              onClick={() => handleDelete(item.id, item.name)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
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

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-sm text-gray-500 order-2 sm:order-1">
              Showing {(pagination.currentPage - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.currentPage * pagination.limit, pagination.total)} of {pagination.total} employees
            </div>
            <div className="flex items-center gap-1 order-1 sm:order-2">
              <button
                onClick={() => handleFilterChange("page", pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="px-3 py-1 text-sm font-medium text-gray-700">
                {pagination.currentPage} / {pagination.totalPages}
              </span>
              <button
                onClick={() => handleFilterChange("page", pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Account Modal */}
      <CreateAccountModal
        isOpen={isAccountModalOpen}
        onClose={() => {
          setIsAccountModalOpen(false);
          setSelectedEmployee(null);
        }}
        employee={selectedEmployee}
        onCreateAccount={handleCreateAccount}
        loading={accountLoading}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={config.isOpen}
        onClose={config.onCancel || (() => {})}
        onConfirm={config.onConfirm}
        title={config.title}
        message={config.message}
        confirmText={config.confirmText}
        cancelText={config.cancelText}
        type={config.type}
        icon={config.icon}
        loading={config.loading}
      />
    </div>
  );
};

export default EmployeePage;