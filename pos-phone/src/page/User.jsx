// pages/User.jsx
import React, { useEffect, useState } from "react";
import {
  FiRefreshCw,
  FiUsers,
  FiUserCheck,
  FiUserX,
  FiUser,
  FiShield,
  FiHash,
  FiPlus,
  FiX,
  FiAlertCircle,
  FiClock,
  FiToggleLeft,
  FiToggleRight,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiMail,
  FiCalendar,
  FiCheckCircle,
} from "react-icons/fi";
import useUser from "../hooks/useUser";
import useRole from "../hooks/useRole";
import Table from "../components/ui/Table";

const User = () => {
  const { users, loading, error, loadUsers, addUser, toggleUserStatus, clearError } = useUser();
  const { roles, loadRoles } = useRole();

  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    role_id: "",
    is_active: 1,
    create_by: 1,
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [statusUpdating, setStatusUpdating] = useState(null);

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    });
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: "" });
    }
    setSubmitError("");
    setSuccessMessage("");
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.username.trim()) errors.username = "Username is required";
    if (!formData.role_id) errors.role_id = "Role is required";
    if (!formData.password) errors.password = "Password is required";
    if (formData.password && formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
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
      const userData = {
        name: formData.name.trim(),
        username: formData.username.trim(),
        password: formData.password,
        role_id: parseInt(formData.role_id),
        is_active: formData.is_active,
        create_by: formData.create_by,
      };

      const result = await addUser(userData);

      if (result) {
        setSuccessMessage(result.message || "User created successfully!");
        setFormData({
          name: "",
          username: "",
          password: "",
          role_id: "",
          is_active: 1,
          create_by: 1,
        });
        await loadUsers();
        setTimeout(() => {
          setShowModal(false);
          setSuccessMessage("");
        }, 1500);
      }
    } catch (err) {
      console.error("Error saving user:", err);
      setSubmitError(err.message || "An error occurred");
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setFormData({
      name: "",
      username: "",
      password: "",
      role_id: "",
      is_active: 1,
      create_by: 1,
    });
    setFormErrors({});
    setSubmitError("");
    setSuccessMessage("");
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 1 ? 0 : 1;
    setStatusUpdating(id);
    
    const success = await toggleUserStatus(id, newStatus);
    
    if (success) {
      await loadUsers();
    }
    setStatusUpdating(null);
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredUsers = users.filter((user) =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      key: "id",
      title: "ID",
      width: "60px",
      render: (row, index) => (
        <span className="text-xs text-gray-400 font-mono">
          #{String(index + 1).padStart(2, "0")}
        </span>
      ),
    },
    {
      key: "user",
      title: "User",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700 font-medium text-sm flex-shrink-0">
            {getInitials(row.name)}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">{row.name || "Unknown"}</p>
          </div>
        </div>
      ),
    },
    {
      key: "username",
      title: "Username",
      render: (row) => (
        <span className="text-sm text-gray-600">@{row.username || "Unknown"}</span>
      ),
    },
    {
      key: "role",
      title: "Role",
      width: "130px",
      render: (row) => {
        const roleColors = {
          Admin: "bg-gray-100 text-gray-700",
          Manager: "bg-gray-100 text-gray-700",
          Cashier: "bg-gray-100 text-gray-700",
          Account: "bg-gray-100 text-gray-700",
        };
        const colorClass = roleColors[row.role_name] || "bg-gray-100 text-gray-700";
        return (
          <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${colorClass}`}>
            {row.role_name || "User"}
          </span>
        );
      },
    },
    {
      key: "create_by",
      title: "Create By",
      width: "140px",
      render: (row) => (
        <span className="text-sm text-gray-600">
          {row.create_by_name || "System"}
        </span>
      ),
    },
    {
      key: "create_at",
      title: "Created At",
      width: "170px",
      render: (row) => (
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <FiClock className="w-3.5 h-3.5 text-gray-400" />
          <span>{formatDate(row.create_at)}</span>
        </div>
      ),
    },
    {
      key: "update_at",
      title: "Update At",
      width: "170px",
      render: (row) => (
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <FiClock className="w-3.5 h-3.5 text-gray-400" />
          <span>{formatDate(row.update_at)}</span>
        </div>
      ),
    },
    {
      key: "status",
      title: "Status",
      width: "130px",
      render: (row) => {
        const isActive = row.is_active === 1 || row.is_active === true;
        const isUpdating = statusUpdating === row.id;
        
        return (
          <button
            onClick={() => handleToggleStatus(row.id, row.is_active)}
            disabled={isUpdating}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              isActive
                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            } ${isUpdating ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            {isUpdating ? (
              <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : isActive ? (
              <FiCheckCircle className="w-3.5 h-3.5" />
            ) : (
              <FiX className="w-3.5 h-3.5" />
            )}
            {isActive ? "Active" : "Inactive"}
          </button>
        );
      },
    },
  ];

  const stats = [
    {
      label: "Total Users",
      value: users.length,
      icon: FiUsers,
      bgColor: "bg-gray-100",
      textColor: "text-gray-700",
    },
    {
      label: "Active",
      value: users.filter((user) => user.is_active === 1 || user.is_active === true).length,
      icon: FiUserCheck,
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600",
    },
    {
      label: "Inactive",
      value: users.filter((user) => user.is_active !== 1 && user.is_active !== true).length,
      icon: FiUserX,
      bgColor: "bg-gray-50",
      textColor: "text-gray-500",
    },
    {
      label: "Admins",
      value: users.filter((user) => user.role_name === "Admin").length,
      icon: FiShield,
      bgColor: "bg-gray-100",
      textColor: "text-gray-700",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 tracking-tight">
            User Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your application users
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setFormData({
                name: "",
                username: "",
                password: "",
                role_id: "",
                is_active: 1,
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
            Add User
          </button>
          <button
            onClick={() => loadUsers()}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-600 text-sm font-medium rounded-lg border border-gray-200 transition-colors"
          >
            <FiRefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
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
                </div>
                <div className={`w-11 h-11 rounded-lg ${stat.bgColor} flex items-center justify-center ${stat.textColor}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search & Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-medium text-gray-700">User List</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {filteredUsers.length} {filteredUsers.length === 1 ? "user" : "users"} found
            </p>
          </div>
          <div className="relative">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-48 md:w-64 pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white"
            />
          </div>
        </div>

        <Table
          columns={columns}
          data={filteredUsers}
          loading={loading}
          emptyMessage="No users found"
        />
      </div>

      {/* Add User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Add New User</h3>
                <p className="text-sm text-gray-500">Create a new user account</p>
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
                  <FiCheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
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
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white ${
                        formErrors.name ? "border-red-400" : "border-gray-200"
                      }`}
                      placeholder="John Doe"
                    />
                  </div>
                  {formErrors.name && (
                    <p className="mt-1.5 text-xs text-red-500">{formErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiHash className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white ${
                        formErrors.username ? "border-red-400" : "border-gray-200"
                      }`}
                      placeholder="johndoe"
                    />
                  </div>
                  {formErrors.username && (
                    <p className="mt-1.5 text-xs text-red-500">{formErrors.username}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white ${
                        formErrors.password ? "border-red-400" : "border-gray-200"
                      }`}
                      placeholder="Enter password"
                    />
                  </div>
                  {formErrors.password && (
                    <p className="mt-1.5 text-xs text-red-500">{formErrors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="role_id"
                    value={formData.role_id}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white ${
                      formErrors.role_id ? "border-red-400" : "border-gray-200"
                    }`}
                  >
                    <option value="">Select a role</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.role_id && (
                    <p className="mt-1.5 text-xs text-red-500">{formErrors.role_id}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Status
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, is_active: 1 })}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                        formData.is_active === 1
                          ? "bg-black text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      <FiCheckCircle className="w-4 h-4 inline mr-1.5" />
                      Active
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, is_active: 0 })}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                        formData.is_active === 0
                          ? "bg-black text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      <FiX className="w-4 h-4 inline mr-1.5" />
                      Inactive
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-black hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-all shadow-sm"
                >
                  Create User
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

      {/* Error Alert */}
      {error && (
        <div className="fixed bottom-6 right-6 bg-white border border-gray-200 text-gray-700 px-4 py-3 rounded-lg shadow-lg max-w-sm">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center text-red-500 flex-shrink-0">
              <FiAlertCircle className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Error</p>
              <p className="text-xs text-gray-500">{error}</p>
            </div>
            <button
              onClick={clearError}
              className="text-gray-400 hover:text-gray-600"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default User;