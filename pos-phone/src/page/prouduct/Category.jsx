import { useEffect, useState, useCallback } from "react";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiRefreshCw,
  FiX,
  FiGrid,
  FiCheckCircle,
  FiXCircle,
  FiCalendar,
  FiHash,
  FiAlignLeft,
  FiTag,
  FiHome,
  FiSearch,
} from "react-icons/fi";
import { request } from "../../util/helper";
import MainPage from "../../components/layout/MainPage";
import Table from "../../components/ui/Table";
import { useAlert } from "../../components/common/Alert";
import useConfirm from "../../hooks/useConfirm";
import ConfirmModal from "../../components/common/ConfirmModal"; 

const Category = () => {
  // State Management
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const alert = useAlert();
  const { showConfirm, config, setLoading: setConfirmLoading } = useConfirm();
  
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    description: "",
    parentId: "",
    status: 1,
  });

  const fetchCategories = useCallback(async () => {
    setLoading(true);

    try {
      const response = await request("category", "get");

      if (response) {
        setCategories(response.data || []);
        setError("");
      } else {
        setError(response?.message || "Failed to fetch categories");
        setCategories([]);
      }
    } catch (err) {
      setError("An error occurred while fetching categories");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Form Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStatusChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      status: parseInt(value),
    }));
  };

  const resetForm = () => {
    setFormData({
      id: null,
      name: "",
      description: "",
      parentId: "",
      status: 1,
    });
    setIsEditing(false);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (category) => {
    setFormData({
      id: category.Id,
      name: category.Name,
      description: category.Description || "",
      parentId: category.ParentID || "",
      status: category.Status,
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };


  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert.warning('Category name is required', {
        description: 'Please enter a category name.',
      });
      return;
    }

    const payload = {
      Id: formData.id,
      Name: formData.name,
      Description: formData.description,
      Status: parseInt(formData.status),
      ParentID: formData.parentId || null,
    };

    try {
      const endpoint = isEditing ? "category" : "category";
      const method = isEditing ? "put" : "post";

      const loadingId = alert.showAlert({
        type: 'info',
        message: isEditing ? 'Updating category...' : 'Creating category...',
        description: 'Please wait...',
        duration: 0,
        closable: false,
      });

      const response = await request(endpoint, method, payload);

      alert.hideAlert(loadingId);

      if (response) {
        closeModal();
        await fetchCategories();
        
        alert.success(
          isEditing ? 'Category updated successfully!' : 'Category created successfully!',
          {
            description: `"${formData.name}" has been ${isEditing ? 'updated' : 'added'} to the system.`,
          }
        );
      } else {
        alert.error('Failed to save category', {
          description: response?.message || 'Please try again.',
        });
      }
    } catch (err) {
      alert.error('An error occurred while saving', {
        description: err.message || 'Please try again later.',
      });
    }
  };


  const handleDelete = async (category) => {
    const confirmed = await showConfirm({
      title: 'Delete Category',
      message: `Are you sure you want to delete "${category.Name}"? This action cannot be undone.`,
      confirmText: 'Delete Category',
      cancelText: 'Cancel',
      type: 'danger',
      icon: FiTrash2,
    });

    if (!confirmed) return;

    setConfirmLoading(true);
    try {
      const loadingId = alert.showAlert({
        type: 'info',
        message: `Deleting "${category.Name}"...`,
        description: 'Please wait...',
        duration: 0,
        closable: false,
      });

      const response = await request("category", "delete", { id: category.Id });
      
      alert.hideAlert(loadingId);

      if (response) {
        await fetchCategories();
        alert.success('Category deleted successfully!', {
          description: `"${category.Name}" has been removed from the system.`,
        });
      } else {
        alert.error('Failed to delete category', {
          description: response?.message || 'Please try again.',
        });
      }
    } catch (err) {
      alert.error('An error occurred while deleting', {
        description: err.message || 'Please try again later.',
      });
    } finally {
      setConfirmLoading(false);
    }
  };

  // Helper Functions
  const getStatusBadge = (status) => {
    const config = {
      1: {
        label: "Active",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: FiCheckCircle,
      },
      0: {
        label: "Inactive",
        className: "bg-gray-50 text-gray-500 border-gray-200",
        icon: FiXCircle,
      },
    };
    return config[status] || config[0];
  };

  const getInitials = (name) => {
    return name?.charAt(0).toUpperCase() || "?";
  };

  // Filter categories based on search
  const filteredCategories = categories.filter((category) =>
    category.Name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Table Columns Configuration
  const columns = [
    {
      key: "id",
      title: "ID",
      width: "80px",
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 font-mono text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-md">
          <FiHash className="w-3 h-3" />
          {row.Id}
        </span>
      ),
    },
    {
      key: "name",
      title: "Category Name",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700 font-medium text-sm flex-shrink-0">
            {getInitials(row.Name)}
          </div>
          <div>
            <p className="font-medium text-gray-800">{row.Name}</p>
            {row.ParentID && (
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <FiHome className="w-3 h-3" />
                Parent: {row.ParentID}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "description",
      title: "Description",
      render: (row) => (
        <div className="flex items-center gap-2 text-gray-500 max-w-xs">
          <FiAlignLeft className="w-4 h-4 text-gray-300 flex-shrink-0" />
          <span className="truncate">{row.Description || "—"}</span>
        </div>
      ),
    },
    {
      key: "status",
      title: "Status",
      width: "120px",
      render: (row) => {
        const status = getStatusBadge(row.Status);
        const Icon = status.icon;
        return (
          <span
            className={`
            inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium border
            ${status.className}
          `}
          >
            <Icon className="w-3.5 h-3.5" />
            {status.label}
          </span>
        );
      },
    },
    {
      key: "createdAt",
      title: "Created Date",
      width: "250px",
      render: (row) => (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <FiCalendar className="w-4 h-4 text-gray-300" />
          <div>
            <p className="text-sm">
              {new Date(row.CreateAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
            <p className="text-xs text-gray-400">
              {new Date(row.CreateAt).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      width: "120px",
      align: "center",
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => openEditModal(row)}
            className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors duration-200"
            title="Edit category"
          >
            <FiEdit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors duration-200"
            title="Delete category"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  // Stats Configuration
  const stats = [
    {
      label: "Total Categories",
      value: categories.length,
      icon: FiGrid,
      bgColor: "bg-gray-100",
      textColor: "text-gray-700",
      subtitle: "Total in system",
    },
    {
      label: "Active",
      value: categories.filter((item) => item.Status === 1).length,
      icon: FiCheckCircle,
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600",
      subtitle: "Active categories",
    },
    {
      label: "Inactive",
      value: categories.filter((item) => item.Status === 0).length,
      icon: FiXCircle,
      bgColor: "bg-gray-50",
      textColor: "text-gray-500",
      subtitle: "Inactive categories",
    },
    {
      label: "Last Updated",
      value:
        categories.length > 0
          ? new Date(
              Math.max(...categories.map((c) => new Date(c.CreateAt))),
            ).toLocaleDateString()
          : "—",
      icon: FiCalendar,
      bgColor: "bg-gray-100",
      textColor: "text-gray-700",
      subtitle: "Latest update",
    },
  ];

  return (
    <MainPage error={error}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800 tracking-tight">
                Category Management
              </h1>
              <p className="text-gray-500 mt-1 text-sm">
                Manage your product categories
              </p>
            </div>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-black hover:bg-gray-800 text-white rounded-lg transition-all duration-200 text-sm font-medium shadow-sm"
            >
              <FiPlus className="w-4 h-4" />
              Add Category
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="text-2xl font-semibold text-gray-800 mt-1.5">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`w-11 h-11 rounded-lg ${stat.bgColor} flex items-center justify-center ${stat.textColor}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-2.5">
                  <p className="text-xs text-gray-400">{stat.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Search & Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-medium text-gray-700">Category List</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {filteredCategories.length} {filteredCategories.length === 1 ? "category" : "categories"} found
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-48 md:w-64 pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white"
                />
              </div>
              <button
                onClick={() => {
                  fetchCategories();
                  alert.success('Categories refreshed!', {
                    description: 'Data has been updated.',
                    duration: 2000,
                  });
                }}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 text-gray-400 hover:text-gray-600"
                title="Refresh"
              >
                <FiRefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
              </button>
            </div>
          </div>

          <Table
            columns={columns}
            data={filteredCategories}
            loading={loading}
            emptyMessage="No categories found"
          />
        </div>

        {/* Add/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-lg rounded-lg shadow-xl overflow-hidden">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {isEditing ? "Edit Category" : "Add New Category"}
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {isEditing
                      ? "Update category details"
                      : "Create a new product category"}
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600 flex items-center justify-center"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5">
                {/* Name */}
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
                      onChange={handleInputChange}
                      placeholder="Enter category name"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white text-sm"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter category description"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white resize-none text-sm"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Status
                  </label>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value="1"
                        checked={formData.status === 1}
                        onChange={() => handleStatusChange(1)}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-sm text-gray-700">Active</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value="0"
                        checked={formData.status === 0}
                        onChange={() => handleStatusChange(0)}
                        className="w-4 h-4 text-gray-400 focus:ring-gray-400"
                      />
                      <span className="text-sm text-gray-700">Inactive</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
                <button
                  onClick={closeModal}
                  className="px-5 py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-sm text-gray-600 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-5 py-2.5 bg-black hover:bg-gray-800 text-white rounded-lg transition-all duration-200 text-sm font-medium shadow-sm"
                >
                  {isEditing ? "Update Category" : "Save Category"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

   
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
    </MainPage>
  );
};

export default Category;