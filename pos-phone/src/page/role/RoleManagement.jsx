import React, { useState, useEffect } from 'react';
import useRole from '../../hooks/useRole';
const RoleManagement = () => {
  const {
    roles,
    loading,
    pagination,
    loadRoles,
    loadRoleById,
    addRole,
    editRole,
    removeRole,
  } = useRole();
  const [showForm, setShowForm] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');

  // Load roles on mount and when page/search changes
  useEffect(() => {
    loadRolesData();
  }, [searchTerm, currentPage]);

  const loadRolesData = async () => {
    try {
      await loadRoles({
        search: searchTerm,
        page: currentPage,
        limit: 10,
      });
    } catch (error) {
      console.error('Error loading roles:', error);
    }
  };

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      loadRolesData();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (formErrors[e.target.name]) {
      setFormErrors({
        ...formErrors,
        [e.target.name]: '',
      });
    }
    setErrorMessage('');
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Role name is required';
    }
    if (!formData.code.trim()) {
      errors.code = 'Role code is required';
    }
    if (formData.code && !/^[a-z0-9_]+$/.test(formData.code.toLowerCase())) {
      errors.code = 'Code must contain only lowercase letters, numbers, and underscores';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // CREATE & UPDATE
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const roleData = {
        name: formData.name.trim(),
        code: formData.code.trim().toLowerCase(),
        description: formData.description.trim() || null,
      };

      if (editingRole) {
        await editRole(editingRole.id, roleData);
        setErrorMessage('');
      } else {
        await addRole(roleData);
        setErrorMessage('');
      }

      setFormData({ name: '', code: '', description: '' });
      setShowForm(false);
      setEditingRole(null);
      await loadRolesData();
    } catch (error) {
      console.error('Error saving role:', error);
      setErrorMessage(error.message || 'Failed to save role');
    }
  };

  // DELETE
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this role?')) return;

    try {
      await removeRole(id);
      await loadRolesData();
    } catch (error) {
      console.error('Error deleting role:', error);
      setErrorMessage(error.message || 'Failed to delete role');
    }
  };

  // EDIT
  const handleEdit = async (id) => {
    try {
      const role = await loadRoleById(id);
      setEditingRole(role);
      setFormData({
        name: role.name || '',
        code: role.code || '',
        description: role.description || '',
      });
      setShowForm(true);
      setErrorMessage('');
    } catch (error) {
      console.error('Error loading role:', error);
      setErrorMessage('Failed to load role details');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingRole(null);
    setFormData({ name: '', code: '', description: '' });
    setFormErrors({});
    setErrorMessage('');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Pagination
  const totalPages = pagination?.totalPages || 0;
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 flex items-center gap-3">
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{errorMessage}</span>
          <button
            onClick={() => setErrorMessage('')}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
            <p className="text-sm text-gray-500 mt-1">Manage user roles and permissions</p>
          </div>
          <button
            onClick={() => {
              if (showForm) {
                handleCancel();
              } else {
                setShowForm(true);
              }
            }}
            className={`inline-flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
              showForm
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {showForm ? (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Add Role
              </>
            )}
          </button>
        </div>
      </div>

      {/* Create/Update Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
            <h2 className="text-lg font-semibold text-gray-900">
              {editingRole ? 'Edit Role' : 'Create New Role'}
            </h2>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Role Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-3.5 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow ${
                    formErrors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Administrator"
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Role Code *
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  className={`w-full px-3.5 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow ${
                    formErrors.code ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., admin"
                />
                {formErrors.code && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.code}</p>
                )}
                <p className="mt-1 text-xs text-gray-400">Lowercase letters, numbers, and underscores only</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                  placeholder="Describe the role's purpose and permissions..."
                />
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingRole ? 'Update Role' : 'Create Role'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Roles Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Search Bar */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search roles by name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
              />
            </div>
            <div className="text-sm text-gray-500">
              Total: <span className="font-semibold text-gray-700">{pagination?.total || 0}</span> roles
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-3 border-gray-200 border-t-blue-600"></div>
            <p className="text-sm text-gray-500 mt-4">Loading roles...</p>
          </div>
        ) : roles.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-200">
                  <th className="text-left py-3.5 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="text-left py-3.5 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="text-left py-3.5 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Code</th>
                  <th className="text-left py-3.5 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="text-left py-3.5 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Created At</th>
                <th className="text-left py-3.5 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Created By</th>
                  <th className="text-right py-3.5 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {roles.map((role) => (
                  <tr key={role.id} className="hover:bg-gray-50/70 transition-colors group">
                    <td className="py-3.5 px-6">
                      <span className="text-sm text-gray-500">#{role.id}</span>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="text-sm font-medium text-gray-900">{role.name}</span>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="inline-flex px-2.5 py-1 text-xs font-mono font-medium bg-gray-100 text-gray-700 rounded-md">
                        {role.code}
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="text-sm text-gray-600 line-clamp-1">
                        {role.description || '-'}
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="text-sm text-gray-500">
                        {formatDate(role.create_at)}
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="text-sm text-gray-500">
                        {role.create_by_name}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(role.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(role.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <p className="text-gray-500 font-medium">No roles found</p>
            <p className="text-sm text-gray-400 mt-1">Create your first role to get started</p>
          </div>
        )}

        {/* Pagination */}
        {roles.length > 0 && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing page {pagination?.page || 1} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <div className="flex gap-1">
                  {pageNumbers.map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3.5 py-1.5 text-sm rounded-lg transition-colors ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleManagement;