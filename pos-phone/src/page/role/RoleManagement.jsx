// pages/RoleManagement.jsx - Redesigned with Black theme and great UX
import React, { useState, useEffect } from 'react';
import useRole from '../../hooks/useRole';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiX,
  FiShield,
  FiLock,
  FiUsers,
  FiUserCheck,
  FiClock,
  FiHash,
  FiTag,
  FiAlertCircle,
  FiCheckCircle,
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';

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

  const [showModal, setShowModal] = useState(false);
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
  const [successMessage, setSuccessMessage] = useState('');

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
    setSuccessMessage('');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const roleData = {
        name: formData.name.trim(),
        code: formData.code.trim().toLowerCase(),
        description: formData.description.trim() || null,
      };

      let result;
      if (editingRole) {
        result = await editRole(editingRole.id, roleData);
        if (result) {
          setSuccessMessage('Role updated successfully!');
        }
      } else {
        result = await addRole(roleData);
        if (result) {
          setSuccessMessage('Role created successfully!');
        }
      }

      setFormData({ name: '', code: '', description: '' });
      setShowModal(false);
      setEditingRole(null);
      await loadRolesData();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving role:', error);
      setErrorMessage(error.message || 'Failed to save role');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this role?')) return;

    try {
      await removeRole(id);
      await loadRolesData();
      setSuccessMessage('Role deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting role:', error);
      setErrorMessage(error.message || 'Failed to delete role');
    }
  };

  const handleEdit = async (id) => {
    try {
      const role = await loadRoleById(id);
      setEditingRole(role);
      setFormData({
        name: role.name || '',
        code: role.code || '',
        description: role.description || '',
      });
      setShowModal(true);
      setErrorMessage('');
      setSuccessMessage('');
    } catch (error) {
      console.error('Error loading role:', error);
      setErrorMessage('Failed to load role details');
    }
  };

  const openCreateModal = () => {
    setEditingRole(null);
    setFormData({ name: '', code: '', description: '' });
    setShowModal(true);
    setFormErrors({});
    setErrorMessage('');
    setSuccessMessage('');
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingRole(null);
    setFormData({ name: '', code: '', description: '' });
    setFormErrors({});
    setErrorMessage('');
    setSuccessMessage('');
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

  const totalPages = pagination?.totalPages || 0;
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  // Stats
  const totalRoles = pagination?.total || roles.length || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className='space-y-6'>
        {/* Success/Error Messages */}
        {successMessage && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center gap-3">
            <FiCheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            <span className="text-sm text-emerald-700">{successMessage}</span>
            <button
              onClick={() => setSuccessMessage('')}
              className="ml-auto text-emerald-500 hover:text-emerald-700"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <FiAlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span className="text-sm text-red-700">{errorMessage}</span>
            <button
              onClick={() => setErrorMessage('')}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800 tracking-tight flex items-center gap-2">
                <FiShield className="w-6 h-6 text-gray-400" />
                Role Management
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">Manage user roles and permissions</p>
            </div>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-black hover:bg-gray-800 text-white rounded-lg transition-all shadow-sm text-sm font-medium"
            >
              <FiPlus className="w-4 h-4" />
              Add Role
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Roles</p>
                <p className="text-2xl font-semibold text-gray-800 mt-1">{totalRoles}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
                <FiShield className="w-5 h-5" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Active Roles</p>
                <p className="text-2xl font-semibold text-emerald-600 mt-1">{totalRoles}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <FiUserCheck className="w-5 h-5" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Permissions</p>
                <p className="text-2xl font-semibold text-purple-600 mt-1">0</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                <FiLock className="w-5 h-5" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Users</p>
                <p className="text-2xl font-semibold text-blue-600 mt-1">0</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <FiUsers className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Roles Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          {/* Search Bar */}
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50/50">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search roles by name or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none text-sm bg-white transition-all"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => loadRolesData()}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiRefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                </button>
                <span className="text-sm text-gray-400">
                  Total: <span className="font-semibold text-gray-700">{totalRoles}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent"></div>
              <p className="text-sm text-gray-500 mt-3">Loading roles...</p>
            </div>
          ) : roles.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-3 px-4 sm:px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <FiHash className="w-3 h-3" /> ID
                      </span>
                    </th>
                    <th className="text-left py-3 px-4 sm:px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <FiTag className="w-3 h-3" /> Name
                      </span>
                    </th>
                    <th className="text-left py-3 px-4 sm:px-6 text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      <span className="flex items-center gap-1">
                        <FiLock className="w-3 h-3" /> Code
                      </span>
                    </th>
                    <th className="text-left py-3 px-4 sm:px-6 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Description
                    </th>
                    <th className="text-left py-3 px-4 sm:px-6 text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      <span className="flex items-center gap-1">
                        <FiClock className="w-3 h-3" /> Created
                      </span>
                    </th>
                    <th className="text-left py-3 px-4 sm:px-6 text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">
                      Created By
                    </th>
                    <th className="text-right py-3 px-4 sm:px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {roles.map((role) => (
                    <tr key={role.id} className="hover:bg-gray-50/80 transition-colors group">
                      <td className="py-3 px-4 sm:px-6">
                        <span className="text-sm text-gray-400 font-mono">#{role.id}</span>
                      </td>
                      <td className="py-3 px-4 sm:px-6">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 text-xs font-medium">
                            {role.name?.charAt(0).toUpperCase() || 'R'}
                          </div>
                          <span className="text-sm font-medium text-gray-800">{role.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 sm:px-6 hidden sm:table-cell">
                        <span className="inline-flex px-2.5 py-1 text-xs font-mono font-medium bg-gray-100 text-gray-700 rounded-lg">
                          {role.code}
                        </span>
                      </td>
                      <td className="py-3 px-4 sm:px-6 hidden md:table-cell">
                        <span className="text-sm text-gray-600 line-clamp-1 max-w-[150px]">
                          {role.description || '-'}
                        </span>
                      </td>
                      <td className="py-3 px-4 sm:px-6 hidden lg:table-cell">
                        <span className="text-sm text-gray-500 flex items-center gap-1.5">
                          <FiClock className="w-3.5 h-3.5 text-gray-400" />
                          {formatDate(role.create_at)}
                        </span>
                      </td>
                      <td className="py-3 px-4 sm:px-6 hidden xl:table-cell">
                        <span className="text-sm text-gray-500">{role.create_by_name || 'System'}</span>
                      </td>
                      <td className="py-3 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEdit(role.id)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(role.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FiShield className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium">No roles found</p>
              <p className="text-sm text-gray-400 mt-1">
                {searchTerm ? 'Try adjusting your search' : 'Create your first role to get started'}
              </p>
              {!searchTerm && (
                <button
                  onClick={openCreateModal}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-lg transition-all text-sm font-medium"
                >
                  <FiPlus className="w-4 h-4" />
                  Add Role
                </button>
              )}
            </div>
          )}

          {/* Pagination */}
          {roles.length > 0 && totalPages > 1 && (
            <div className="px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-sm text-gray-500 order-2 sm:order-1">
                Showing page <span className="font-medium text-gray-700">{pagination?.page || 1}</span> of{' '}
                <span className="font-medium text-gray-700">{totalPages}</span>
              </p>
              <div className="flex items-center gap-1 order-1 sm:order-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex gap-1">
                  {pageNumbers.map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3.5 py-1.5 text-sm rounded-lg transition-all ${
                        currentPage === page
                          ? 'bg-black text-white shadow-sm'
                          : 'hover:bg-gray-100 text-gray-600'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {editingRole ? 'Edit Role' : 'Create New Role'}
                </h3>
                <p className="text-sm text-gray-500">
                  {editingRole ? 'Update role information' : 'Add a new role to the system'}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Role Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiTag className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white ${
                      formErrors.name ? 'border-red-400' : 'border-gray-200'
                    }`}
                    placeholder="e.g., Administrator"
                  />
                </div>
                {formErrors.name && (
                  <p className="mt-1.5 text-xs text-red-500">{formErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Role Code <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white ${
                      formErrors.code ? 'border-red-400' : 'border-gray-200'
                    }`}
                    placeholder="e.g., admin"
                  />
                </div>
                {formErrors.code && (
                  <p className="mt-1.5 text-xs text-red-500">{formErrors.code}</p>
                )}
                <p className="mt-1 text-xs text-gray-400">Lowercase letters, numbers, and underscores only</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white resize-none"
                  placeholder="Describe the role's purpose and permissions..."
                />
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-black hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-all shadow-sm flex-1"
                >
                  {editingRole ? 'Update Role' : 'Create Role'}
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

export default RoleManagement;