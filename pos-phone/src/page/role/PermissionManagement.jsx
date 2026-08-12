// pages/PermissionManagement.jsx - With Alert & Confirm Modal
import React, { useEffect, useState } from "react";
import {
  FiRefreshCw,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
  FiAlertCircle,
  FiCheck,
  FiShield,
  FiLock,
  FiUsers,
  FiSearch,
  FiCheckCircle,
  FiGrid,
  FiKey,
  FiChevronRight,
  FiChevronDown,
  FiUserCheck,
} from "react-icons/fi";
import usePermission from "../../hooks/usePermission";
import useRole from "../../hooks/useRole";
import Table from "../../components/ui/Table";
import ProductPagination from "../../components/product/ProductPagination";
import { useAlert } from "../../components/common/Alert";
import { useConfirm } from "../../hooks/useConfirm";
import ConfirmModal from "../../components/common/ConfirmModal";

const PermissionManagement = () => {
  const {
    permissions,
    rolePermissions,
    loading,
    pagination,
    loadPermissions,
    loadPermissionById,
    create,
    update,
    remove,
    loadRolePermissions,
    assignPermissions,
    removePermission,
  } = usePermission();

  const alert = useAlert();
  const { showConfirm, config, setLoading: setConfirmLoading } = useConfirm();

  const { roles, loadRoles } = useRole();

  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingPermission, setEditingPermission] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [assignSearchTerm, setAssignSearchTerm] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    module: "",
    description: "",
    create_by: 1,
  });
  const [formErrors, setFormErrors] = useState({});

  // Load roles on mount
  useEffect(() => {
    loadRoles();
  }, []);

  // Load permissions when search, page, or limit changes
  useEffect(() => {
    const loadData = () => {
      loadPermissions({
        search: searchTerm,
        page: currentPage,
        limit,
      });
    };

    if (searchTerm) {
      const timer = setTimeout(loadData, 400);
      return () => clearTimeout(timer);
    } else {
      loadData();
    }
  }, [searchTerm, currentPage, limit]);

  // Load role permissions when selected role changes
  useEffect(() => {
    if (selectedRole) {
      loadRolePermissions(selectedRole.id);
    }
  }, [selectedRole]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: "" });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Permission name is required";
    if (!formData.code.trim()) errors.code = "Permission code is required";
    if (!formData.module.trim()) errors.module = "Module is required";
    if (formData.code && !/^[a-z0-9_.]+$/.test(formData.code)) {
      errors.code = "Code must contain only lowercase letters, numbers, underscores, and dots";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const loadingId = alert.showAlert({
        type: 'info',
        message: editingPermission ? 'Updating permission...' : 'Creating permission...',
        description: 'Please wait...',
        duration: 0,
        closable: false,
      });

      const permissionData = {
        name: formData.name.trim(),
        code: formData.code.trim().toLowerCase(),
        module: formData.module.trim(),
        description: formData.description.trim() || null,
        create_by: formData.create_by,
      };

      let result;
      if (editingPermission) {
        result = await update(editingPermission.id, permissionData);
      } else {
        result = await create(permissionData);
      }

      alert.hideAlert(loadingId);

      if (result) {
        setFormData({
          name: "",
          code: "",
          module: "",
          description: "",
          create_by: 1,
        });
        await loadPermissions({ page: currentPage, limit });
        alert.success(
          editingPermission ? "Permission updated successfully!" : "Permission created successfully!",
          {
            description: `"${formData.name}" has been ${editingPermission ? 'updated' : 'added'}.`,
          }
        );
        setShowModal(false);
        setEditingPermission(null);
      }
    } catch (err) {
      console.error("Error saving permission:", err);
      alert.error("Failed to save permission", {
        description: err.message || "Please try again.",
      });
    }
  };

  const handleEdit = async (id) => {
    try {
      const permission = await loadPermissionById(id);
      if (permission) {
        setEditingPermission(permission);
        setFormData({
          name: permission.name || "",
          code: permission.code || "",
          module: permission.module || "",
          description: permission.description || "",
          create_by: permission.create_by || 1,
        });
        setShowModal(true);
        setFormErrors({});
      }
    } catch (error) {
      console.error("Error loading permission:", error);
      alert.error("Failed to load permission details", {
        description: error.message || "Please try again.",
      });
    }
  };

  const handleDelete = async (id, name) => {
    const confirmed = await showConfirm({
      title: "Delete Permission",
      message: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      confirmText: "Delete Permission",
      cancelText: "Cancel",
      type: "danger",
      icon: FiTrash2,
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

      await remove(id);
      await loadPermissions({ page: currentPage, limit });

      alert.hideAlert(loadingId);
      alert.success("Permission deleted successfully!", {
        description: `"${name}" has been removed.`,
      });
    } catch (error) {
      console.error("Error deleting permission:", error);
      alert.error("Failed to delete permission", {
        description: error.message || "Please try again.",
      });
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setEditingPermission(null);
    setFormData({
      name: "",
      code: "",
      module: "",
      description: "",
      create_by: 1,
    });
    setFormErrors({});
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setCurrentPage(1);
  };

  const handleAssignPermissions = async () => {
    if (!selectedRole) return;

    try {
      const loadingId = alert.showAlert({
        type: 'info',
        message: 'Assigning permissions...',
        description: 'Please wait...',
        duration: 0,
        closable: false,
      });

      await assignPermissions(selectedRole.id, selectedPermissionIds);
      await loadRolePermissions(selectedRole.id);

      alert.hideAlert(loadingId);
      setSelectedPermissionIds([]);
      alert.success("Permissions assigned successfully!", {
        description: `${selectedPermissionIds.length} permissions assigned to ${selectedRole.name}.`,
      });
      setShowAssignModal(false);
      setAssignSearchTerm("");
    } catch (error) {
      console.error("Error assigning permissions:", error);
      alert.error("Failed to assign permissions", {
        description: error.message || "Please try again.",
      });
    }
  };

  const handleRemovePermission = async (permissionId, permissionName) => {
    const confirmed = await showConfirm({
      title: "Remove Permission",
      message: `Are you sure you want to remove "${permissionName}" from ${selectedRole?.name}?`,
      confirmText: "Remove",
      cancelText: "Cancel",
      type: "warning",
      icon: FiX,
    });

    if (!confirmed) return;

    setConfirmLoading(true);
    try {
      const loadingId = alert.showAlert({
        type: 'info',
        message: `Removing "${permissionName}"...`,
        description: 'Please wait...',
        duration: 0,
        closable: false,
      });

      await removePermission(selectedRole.id, permissionId);
      await loadRolePermissions(selectedRole.id);

      alert.hideAlert(loadingId);
      alert.success("Permission removed successfully!", {
        description: `"${permissionName}" has been removed from ${selectedRole?.name}.`,
      });
    } catch (error) {
      console.error("Error removing permission:", error);
      alert.error("Failed to remove permission", {
        description: error.message || "Please try again.",
      });
    } finally {
      setConfirmLoading(false);
    }
  };

  const togglePermissionSelection = (permissionId) => {
    setSelectedPermissionIds((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const isPermissionAssigned = (permissionId) => {
    return rolePermissions.some((p) => p.id === permissionId);
  };

  // Filter permissions for assign modal
  const filteredAssignPermissions = permissions.filter(p => 
    !assignSearchTerm || 
    p.name.toLowerCase().includes(assignSearchTerm.toLowerCase()) ||
    p.code.toLowerCase().includes(assignSearchTerm.toLowerCase()) ||
    p.module.toLowerCase().includes(assignSearchTerm.toLowerCase())
  );

  const uniqueModules = [...new Set(permissions.map((p) => p.module))];

  const columns = [
    {
      key: "id",
      title: "#",
      width: "50px",
      render: (row, index) => (
        <span className="text-xs text-gray-400">
          {String(((currentPage - 1) * limit) + index + 1)}
        </span>
      ),
    },
    {
      key: "name",
      title: "Permission",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
            <FiKey className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">{row.name}</p>
            <p className="text-xs text-gray-400">{row.code}</p>
          </div>
        </div>
      ),
    },
    {
      key: "module",
      title: "Module",
      width: "120px",
      render: (row) => (
        <span className="inline-flex px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
          {row.module}
        </span>
      ),
    },
    {
      key: "description",
      title: "Description",
      render: (row) => (
        <span className="text-sm text-gray-500">
          {row.description || "—"}
        </span>
      ),
    },
    {
      key: "actions",
      title: "",
      width: "80px",
      align: "right",
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => handleEdit(row.id)}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit"
          >
            <FiEdit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row.id, row.name)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  // Stats
  const stats = [
    {
      label: "Total Permissions",
      value: pagination?.total || permissions.length || 0,
      icon: FiShield,
      color: "text-gray-700",
    },
    {
      label: "Modules",
      value: uniqueModules.length,
      icon: FiGrid,
      color: "text-blue-600",
    },
    {
      label: "Roles",
      value: roles?.length || 0,
      icon: FiUsers,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div>
        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6 hover:shadow-md transition-shadow">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center">
                  <FiShield className="w-5 h-5 text-white" />
                </div>
                Permission Management
              </h1>
              <p className="text-sm text-gray-500 mt-1 ml-14">
                Manage system permissions and role assignments
              </p>
            </div>
            <button
              onClick={() => {
                setEditingPermission(null);
                setFormData({
                  name: "",
                  code: "",
                  module: "",
                  description: "",
                  create_by: 1,
                });
                setShowModal(true);
                setFormErrors({});
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-all shadow-sm"
            >
              <FiPlus className="w-4 h-4" />
              New Permission
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center">
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Content - Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Permissions List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              {/* Toolbar */}
              <div className="p-4 border-b border-gray-200 bg-gray-50/50">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative flex-1 min-w-[200px]">
                    <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search permissions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 outline-none transition-all bg-white"
                    />
                  </div>
                  <div className="flex items-center gap-2 ml-auto">
                    <select
                      value={limit}
                      onChange={(e) => handleLimitChange(parseInt(e.target.value))}
                      className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 outline-none"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                    <button
                      onClick={() => {
                        loadPermissions({ page: currentPage, limit });
                        alert.success("Permissions refreshed!", {
                          description: "Data has been updated.",
                          duration: 2000,
                        });
                      }}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Refresh"
                    >
                      <FiRefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Table */}
              <Table
                columns={columns}
                data={permissions}
                loading={loading}
                emptyMessage="No permissions found"
              />

              {/* Pagination */}
              {pagination && pagination.totalPages > 0 && (
                <ProductPagination
                  currentPage={pagination.page || currentPage}
                  totalPages={pagination.totalPages || 1}
                  totalItems={pagination.total || 0}
                  limit={pagination.limit || limit}
                  onPageChange={handlePageChange}
                />
              )}
            </div>
          </div>

          {/* Right Column - Role Permissions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden sticky top-6 hover:shadow-md transition-shadow">
              <div className="p-4 border-b border-gray-200 bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <FiUsers className="w-4 h-4 text-gray-500" />
                  <h2 className="text-sm font-semibold text-gray-700">Role Permissions</h2>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">Select a role to manage</p>
              </div>

              <div className="p-4">
                {/* Role List */}
                <div className="space-y-2 mb-4">
                  {roles.map((role) => {
                    const isSelected = selectedRole?.id === role.id;
                    const assignedCount = rolePermissions.length;

                    return (
                      <button
                        key={role.id}
                        onClick={() => {
                          setSelectedRole(role);
                          setSelectedPermissionIds([]);
                        }}
                        className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                          isSelected
                            ? "border-gray-900 bg-gray-50 shadow-sm"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isSelected ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"
                          }`}>
                            <FiUserCheck className="w-4 h-4" />
                          </div>
                          <div className="text-left">
                            <p className={`text-sm font-medium ${isSelected ? "text-gray-900" : "text-gray-700"}`}>
                              {role.name}
                            </p>
                            <p className="text-xs text-gray-400">{assignedCount} permissions</p>
                          </div>
                        </div>
                        {isSelected && (
                          <FiChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Selected Role Permissions */}
                {selectedRole ? (
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-gray-700">
                        {selectedRole.name}
                      </h3>
                      <button
                        onClick={() => {
                          setSelectedPermissionIds([]);
                          setAssignSearchTerm("");
                          setShowAssignModal(true);
                        }}
                        className="text-xs text-white font-medium flex items-center gap-1 bg-gray-800 hover:bg-gray-950 py-1 px-4 rounded-lg "
                      >
                        <FiPlus className="w-3 h-3" /> Add
                      </button>
                    </div>

                    {rolePermissions.length > 0 ? (
                      <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                        {rolePermissions.map((permission) => (
                          <div
                            key={permission.id}
                            className="group flex items-center justify-between p-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <FiCheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                              <span className="text-sm text-gray-700 truncate">
                                {permission.name}
                              </span>
                            </div>
                            <button
                              onClick={() => handleRemovePermission(permission.id, permission.name)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                              title="Remove"
                            >
                              <FiX className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                        <FiLock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">No permissions assigned</p>
                        <p className="text-xs text-gray-300 mt-1">Click Add to assign</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                    <FiUsers className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Select a role</p>
                    <p className="text-xs text-gray-300 mt-1">Choose a role to manage its permissions</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {editingPermission ? "Edit Permission" : "New Permission"}
                </h3>
                <p className="text-sm text-gray-500">
                  {editingPermission ? "Update permission details" : "Create a new permission"}
                </p>
              </div>
              <button
                onClick={handleCancel}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 outline-none transition-all bg-white ${
                    formErrors.name ? "border-red-400" : "border-gray-200"
                  }`}
                  placeholder="e.g., Create User"
                />
                {formErrors.name && (
                  <p className="mt-1 text-xs text-red-500">{formErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 outline-none transition-all bg-white ${
                    formErrors.code ? "border-red-400" : "border-gray-200"
                  }`}
                  placeholder="e.g., user.create"
                />
                {formErrors.code && (
                  <p className="mt-1 text-xs text-red-500">{formErrors.code}</p>
                )}
                <p className="mt-1 text-xs text-gray-400">Lowercase letters, numbers, underscores, and dots</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Module <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="module"
                  value={formData.module}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 outline-none transition-all bg-white ${
                    formErrors.module ? "border-red-400" : "border-gray-200"
                  }`}
                  placeholder="e.g., User, Role, Product"
                />
                {formErrors.module && (
                  <p className="mt-1 text-xs text-red-500">{formErrors.module}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="2"
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 outline-none transition-all bg-white resize-none"
                  placeholder="Optional description"
                />
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  className="flex-1 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-all shadow-sm"
                >
                  {editingPermission ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-600 text-sm font-medium rounded-lg border border-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Permissions Modal */}
      {showAssignModal && selectedRole && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Add Permissions to {selectedRole.name}
                </h3>
                <p className="text-sm text-gray-500">Select permissions to assign</p>
              </div>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedPermissionIds([]);
                  setAssignSearchTerm("");
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Search */}
              <div className="relative mb-4">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search permissions..."
                  value={assignSearchTerm}
                  onChange={(e) => setAssignSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 outline-none transition-all bg-white"
                />
                {assignSearchTerm && (
                  <button
                    onClick={() => setAssignSearchTerm("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Permission List */}
              <div className="space-y-1.5 max-h-[400px] overflow-y-auto border border-gray-200 rounded-lg p-2">
                {filteredAssignPermissions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-400">
                      {assignSearchTerm ? "No permissions found" : "No permissions available"}
                    </p>
                  </div>
                ) : (
                  filteredAssignPermissions.map((permission) => {
                    const isAssigned = isPermissionAssigned(permission.id);
                    const isSelected = selectedPermissionIds.includes(permission.id);
                    
                    return (
                      <label
                        key={permission.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          isAssigned
                            ? "bg-gray-50 border-gray-200 cursor-not-allowed opacity-60"
                            : isSelected
                            ? "bg-gray-100 border-gray-900 ring-1 ring-gray-900"
                            : "border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected || isAssigned}
                          onChange={() => {
                            if (!isAssigned) {
                              togglePermissionSelection(permission.id);
                            }
                          }}
                          disabled={isAssigned}
                          className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-800">{permission.name}</p>
                            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                              {permission.module}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400">{permission.code}</p>
                        </div>
                        {isAssigned && (
                          <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded">
                            <FiCheck className="w-3 h-3 inline mr-1" /> Assigned
                          </span>
                        )}
                      </label>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-200">
                <span className="text-sm text-gray-500">
                  {selectedPermissionIds.length} selected
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setShowAssignModal(false);
                      setSelectedPermissionIds([]);
                      setAssignSearchTerm("");
                    }}
                    className="px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-600 text-sm font-medium rounded-lg border border-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAssignPermissions}
                    disabled={selectedPermissionIds.length === 0}
                    className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all ${
                      selectedPermissionIds.length > 0
                        ? "bg-gray-900 hover:bg-gray-800 text-white shadow-sm"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    Assign {selectedPermissionIds.length > 0 && `(${selectedPermissionIds.length})`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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

export default PermissionManagement;