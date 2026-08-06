// pages/EmployeePage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useEmployee } from '../../hooks/useEmployee';
import useRole from '../../hooks/useRole';
import { Link } from 'react-router-dom';
import EmployeeImage from '../../components/employee/EmployeeImage';

const EmployeePage = () => {
  const {
    employees,
    loading,
    pagination,
    loadEmployees,
    changeStatus,
    removeEmployee,
  } = useEmployee();

  const { roles, loading: rolesLoading, loadRoles } = useRole();

  const [filter, setFilter] = useState({
    search: '',
    status: '',
    role_id: '',
  });

  // ✅ ប្រើ useRef ដើម្បីការពារ Load ច្រើនដង
  const hasLoadedRoles = useRef(false);

  // ✅ Load roles once when component mounts
  useEffect(() => {
    if (!hasLoadedRoles.current) {
      hasLoadedRoles.current = true;
      loadRoles({ status: 1 });
    }
  }, [loadRoles]);

  // ✅ Load employees when filter changes
  useEffect(() => {
    loadEmployees(filter);
  }, [filter, loadEmployees]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilter(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  // Clear filters
  const clearFilters = () => {
    setFilter({ search: '', status: '', role_id: '' });
  };

  // Handle status toggle
  const handleStatusToggle = async (id, currentStatus) => {
    const newStatus = currentStatus === 1 ? 0 : 1;
    const action = newStatus === 1 ? 'activate' : 'deactivate';
    if (window.confirm(`Are you sure you want to ${action} this employee?`)) {
      const res = await changeStatus(id, newStatus);
      if (res?.success) {
        alert(`Employee ${action}d successfully!`);
        loadEmployees(filter);
      } else {
        alert(res?.message || `Failed to ${action} employee`);
      }
    }
  };

  // Handle delete
  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete employee "${name}"?`)) {
      const res = await removeEmployee(id);
      if (res?.success) {
        alert('Employee deleted successfully!');
        loadEmployees(filter);
      } else {
        alert(res?.message || 'Failed to delete employee');
      }
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get status badge
  const getStatusBadge = (status) => {
    if (status === 1) {
      return { label: 'Active', color: 'bg-green-100 text-green-800' };
    }
    return { label: 'Inactive', color: 'bg-red-100 text-red-800' };
  };

  // Get gender badge
  const getGenderBadge = (gender) => {
    if (gender === 'male') {
      return { label: 'Male', color: 'bg-blue-100 text-blue-800' };
    } else if (gender === 'female') {
      return { label: 'Female', color: 'bg-pink-100 text-pink-800' };
    }
    return { label: 'Other', color: 'bg-gray-100 text-gray-600' };
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Employees</h1>
            <p className="text-sm text-gray-500 mt-1">
              {loading ? 'Loading...' : `${employees.length} employees found`}
            </p>
          </div>
          <Link
            to="/employees/add"
            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition shadow-sm flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Employee
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                placeholder="Search by name, code or phone..."
                value={filter.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                value={filter.role_id}
                onChange={(e) => handleFilterChange('role_id', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent outline-none transition bg-white"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filter.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent outline-none transition bg-white"
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
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 underline underline-offset-2 transition"
                >
                  Clear filters
                </button>
              )}
              <button
                onClick={() => loadEmployees(filter)}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition text-sm flex items-center gap-1"
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800"></div>
            </div>
          ) : employees.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <p className="text-gray-500 text-lg">No employees found</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Salary
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {employees.map((item) => {
                    const status = getStatusBadge(item.status);
                    const gender = getGenderBadge(item.gender);
                    return (
                      <tr key={item.id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {/* ✅ Use EmployeeImage component */}
                            <EmployeeImage image={item.image} name={item.name} size="sm" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {item.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {gender.label}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                          {item.code || 'N/A'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                          {item.role_name || 'N/A'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-600">
                            {item.phone || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-400">
                            {item.email || 'N/A'}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          ${parseFloat(item.salary || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${status.label === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <div className="flex items-center space-x-2">
                            <Link
                              to={`/employees/edit/${item.id}`}
                              className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition"
                              title="Edit"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </Link>
                            <button
                              onClick={() => handleStatusToggle(item.id, item.status)}
                              className={`p-1 rounded transition ${
                                item.status === 1
                                  ? 'text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50'
                                  : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                              }`}
                              title={item.status === 1 ? 'Deactivate' : 'Activate'}
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
                              className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition"
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
          <div className="mt-6 flex items-center justify-between flex-wrap gap-4">
            <div className="text-sm text-gray-500">
              Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.currentPage * pagination.limit, pagination.total)} of{' '}
              {pagination.total} employees
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleFilterChange('page', pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className={`px-4 py-2 border rounded-lg transition ${
                  pagination.currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Previous
              </button>
              <span className="px-4 py-2 border rounded-lg bg-gray-50 text-gray-700">
                {pagination.currentPage} / {pagination.totalPages}
              </span>
              <button
                onClick={() => handleFilterChange('page', pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className={`px-4 py-2 border rounded-lg transition ${
                  pagination.currentPage === pagination.totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeePage;