// pages/PermissionManagement.jsx
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
  FiUserX,
} from "react-icons/fi";
import usePermission from "../../hooks/usePermission";
import useRole from "../../hooks/useRole";
import Table from "../../components/ui/Table";

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

  const { roles, loadRoles } = useRole();

  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingPermission, setEditingPermission] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    module: "",
    description: "",
    create_by: 1,
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    loadPermissions({ page: currentPage, limit: 10 });
    loadRoles();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPermissions({
        search: searchTerm,
        page: 1,
        limit: 10,
      });
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

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
    setSubmitError("");
    setSuccessMessage("");
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
    setSubmitError("");
    setSuccessMessage("");

    try {
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
        if (result) {
          setSuccessMessage("Permission updated successfully!");
        }
      } else {
        result = await create(permissionData);
        if (result) {
          setSuccessMessage("Permission created successfully!");
        }
      }

      if (result) {
        setFormData({
          name: "",
          code: "",
          module: "",
          description: "",
          create_by: 1,
        });
        await loadPermissions({ page: currentPage, limit: 10 });
        setTimeout(() => {
          setShowModal(false);
          setEditingPermission(null);
          setSuccessMessage("");
        }, 1500);
      }
    } catch (err) {
      console.error("Error saving permission:", err);
      setSubmitError(err.message || "An error occurred");
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
        setSubmitError("");
        setSuccessMessage("");
      }
    } catch (error) {
      console.error("Error loading permission:", error);
      setSubmitError("Failed to load permission details");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this permission?")) return;

    try {
      await remove(id);
      await loadPermissions({ page: currentPage, limit: 10 });
      setSuccessMessage("Permission deleted successfully!");
      setTimeout(() => setSuccessMessage(""), 2000);
    } catch (error) {
      console.error("Error deleting permission:", error);
      setSubmitError(error.message || "Failed to delete permission");
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
    setSubmitError("");
    setSuccessMessage("");
  };

  const handleAssignPermissions = async () => {
    if (!selectedRole) return;

    try {
      await assignPermissions(selectedRole.id, selectedPermissionIds);
      await loadRolePermissions(selectedRole.id);
      setSelectedPermissionIds([]);
      setSuccessMessage("Permissions assigned successfully!");
      setTimeout(() => setSuccessMessage(""), 2000);
      setShowAssignModal(false);
    } catch (error) {
      console.error("Error assigning permissions:", error);
      setSubmitError(error.message || "Failed to assign permissions");
    }
  };

  const handleRemovePermission = async (permissionId) => {
    if (!selectedRole) return;
    if (!window.confirm("Remove this permission from the role?")) return;

    try {
      await removePermission(selectedRole.id, permissionId);
      await loadRolePermissions(selectedRole.id);
      setSuccessMessage("Permission removed successfully!");
      setTimeout(() => setSuccessMessage(""), 2000);
    } catch (error) {
      console.error("Error removing permission:", error);
      setSubmitError(error.message || "Failed to remove permission");
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

  const uniqueModules = [...new Set(permissions.map((p) => p.module))];

  const columns = [
    {
      key: "id",
      title: "#",
      width: "60px",
      render: (row, index) => (
        <span className="text-xs text-gray-400 font-mono">
          {String(index + 1).padStart(2, "0")}
        </span>
      ),
    },
    {
      key: "name",
      title: "Permission",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700">
            <FiKey className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">{row.name}</p>
            <p className="text-xs text-gray-400 font-mono">{row.code}</p>
          </div>
        </div>
      ),
    },
    {
      key: "module",
      title: "Module",
      width: "130px",
      render: (row) => (
        <span className="inline-flex px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
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
      width: "100px",
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
            onClick={() => handleDelete(row.id)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const stats = [
    {
      label: "Total Permissions",
      value: pagination?.total || permissions.length || 0,
      icon: FiShield,
      bgColor: "bg-gray-100",
      textColor: "text-gray-700",
      subtitle: "System permissions",
    },
    {
      label: "Modules",
      value: uniqueModules.length,
      icon: FiGrid,
      bgColor: "bg-gray-100",
      textColor: "text-gray-700",
      subtitle: "Unique modules",
    },
    {
      label: "Roles",
      value: roles?.length || 0,
      icon: FiUsers,
      bgColor: "bg-gray-100",
      textColor: "text-gray-700",
      subtitle: "Available roles",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 tracking-tight">
            Permission Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage system permissions and role assignments
          </p>
        </div>
        <div className="flex items-center gap-3">
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
              setSubmitError("");
              setSuccessMessage("");
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-black hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-all shadow-sm"
          >
            <FiPlus className="w-4 h-4" />
            New Permission
          </button>
          <button
            onClick={() => loadPermissions({ page: currentPage, limit: 10 })}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-600 text-sm font-medium rounded-lg border border-gray-200 transition-colors"
          >
            <FiRefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
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
              className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-semibold text-gray-800 mt-1">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{stat.subtitle}</p>
                </div>
                <div className={`w-11 h-11 rounded-lg ${stat.bgColor} flex items-center justify-center ${stat.textColor}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-sm">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search permissions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white"
          />
        </div>
      </div>

      {/* Permissions Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm mb-6">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="text-sm font-medium text-gray-700">Permission List</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {pagination?.total || permissions.length || 0} permissions found
            </p>
          </div>
        </div>

        <Table
          columns={columns}
          data={permissions}
          loading={loading}
          emptyMessage="No permissions found"
        />
      </div>

      {/* Role Permission Assignment - Redesigned */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium text-gray-700">Role Permissions</h2>
              <p className="text-xs text-gray-400 mt-0.5">Assign and manage permissions for roles</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSelectedRole(null);
                  setSelectedPermissionIds([]);
                }}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                Clear selection
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Role Selection Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
            {roles.map((role) => {
              const isSelected = selectedRole?.id === role.id;
              const assignedCount = rolePermissions.filter(p => 
                selectedRole?.id === role.id && isPermissionAssigned(p.id)
              ).length;
              
              return (
                <button
                  key={role.id}
                  onClick={() => {
                    setSelectedRole(role);
                    setSelectedPermissionIds([]);
                  }}
                  className={`relative p-4 rounded-lg border-2 text-left transition-all ${
                    isSelected
                      ? "border-black bg-gray-50 shadow-sm"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isSelected ? "bg-black text-white" : "bg-gray-100 text-gray-600"
                      }`}>
                        <FiUsers className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className={`font-medium ${
                          isSelected ? "text-black" : "text-gray-700"
                        }`}>
                          {role.name}
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {assignedCount} permissions assigned
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center flex-shrink-0 mt-1">
                        <FiCheck className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {selectedRole ? (
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-800 flex items-center gap-2">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {selectedRole.name} Permissions
                  </h4>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {rolePermissions.length} permissions assigned
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedPermissionIds([]);
                    setShowAssignModal(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-black hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-all shadow-sm"
                >
                  <FiPlus className="w-4 h-4" />
                  Add Permissions
                </button>
              </div>

              {rolePermissions.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {rolePermissions.map((permission) => (
                    <div
                      key={permission.id}
                      className="group flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-all"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                          <FiCheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-700 truncate">
                            {permission.name}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {permission.code}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemovePermission(permission.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all flex-shrink-0 ml-2"
                        title="Remove permission"
                      >
                        <FiX className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                  <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FiLock className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-400 font-medium">No permissions assigned</p>
                  <p className="text-xs text-gray-300 mt-1">
                    Click "Add Permissions" to assign permissions to {selectedRole.name}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FiUsers className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-sm text-gray-400 font-medium">Select a role to manage permissions</p>
              <p className="text-xs text-gray-300 mt-1">
                Choose a role from the cards above to view and assign permissions
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Permission Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
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

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
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

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Permission Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white ${
                      formErrors.name ? "border-red-400" : "border-gray-200"
                    }`}
                    placeholder="e.g., Create User"
                  />
                  {formErrors.name && (
                    <p className="mt-1.5 text-xs text-red-500">{formErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Permission Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white ${
                      formErrors.code ? "border-red-400" : "border-gray-200"
                    }`}
                    placeholder="e.g., user.create"
                  />
                  {formErrors.code && (
                    <p className="mt-1.5 text-xs text-red-500">{formErrors.code}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-400">Lowercase letters, numbers, underscores, and dots only</p>
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
                    className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white ${
                      formErrors.module ? "border-red-400" : "border-gray-200"
                    }`}
                    placeholder="e.g., User, Role, Product"
                  />
                  {formErrors.module && (
                    <p className="mt-1.5 text-xs text-red-500">{formErrors.module}</p>
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
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white resize-none"
                    placeholder="Optional description"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-black hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-all shadow-sm"
                >
                  {editingPermission ? "Update Permission" : "Create Permission"}
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

      {/* Assign Permissions Modal - Redesigned */}
      {showAssignModal && selectedRole && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Add Permissions to {selectedRole.name}
                </h3>
                <p className="text-sm text-gray-500">
                  Select permissions to assign to this role
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedPermissionIds([]);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3.5 flex items-start gap-3">
                  <FiAlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{submitError}</p>
                </div>
              )}

              {/* Search within modal */}
              <div className="relative">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Filter permissions..."
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white"
                />
              </div>

              <div className="space-y-2 max-h-[350px] overflow-y-auto">
                {permissions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-400">No permissions available</p>
                  </div>
                ) : (
                  permissions.map((permission) => {
                    const isAssigned = isPermissionAssigned(permission.id);
                    const isSelected = selectedPermissionIds.includes(permission.id);
                    
                    return (
                      <label
                        key={permission.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          isAssigned
                            ? "bg-gray-50 border-gray-200 cursor-not-allowed opacity-60"
                            : isSelected
                            ? "bg-gray-100 border-gray-300 ring-1 ring-black"
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
                          className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-800">{permission.name}</p>
                            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                              {permission.module}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 font-mono mt-0.5">{permission.code}</p>
                        </div>
                        {isAssigned && (
                          <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded">
                            <FiCheck className="w-3 h-3" /> Assigned
                          </span>
                        )}
                      </label>
                    );
                  })
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <span className="text-sm text-gray-500">
                  {selectedPermissionIds.length} permissions selected
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setShowAssignModal(false);
                      setSelectedPermissionIds([]);
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
                        ? "bg-black hover:bg-gray-800 text-white shadow-sm"
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
    </div>
  );
};

export default PermissionManagement;