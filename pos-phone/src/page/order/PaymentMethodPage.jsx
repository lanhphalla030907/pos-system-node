// pages/PaymentMethodPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { usePaymentMethod } from "../../hooks/usePaymentMethod";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
  FiCheck,
  FiCreditCard,
  FiDollarSign,
  FiPhone,
  FiSmartphone,
  FiRefreshCw,
  FiAlertCircle,
  FiCheckCircle,
  FiHash,
} from "react-icons/fi";
import { useAlert } from "../../components/common/Alert";
import { useConfirm } from "../../hooks/useConfirm";
import ConfirmModal from "../../components/common/ConfirmModal";

const PaymentMethodPage = () => {
  const {
    paymentMethods,
    loading,
    loadPaymentMethods,
    addPaymentMethod,
    editPaymentMethod,
    togglePaymentMethodStatus,
  } = usePaymentMethod();

  const alert = useAlert();
  const { showConfirm, config, setLoading: setConfirmLoading } = useConfirm();

  const [showModal, setShowModal] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "cash",
    is_active: 1,
  });
  const [formErrors, setFormErrors] = useState({});

  const hasLoaded = useRef(false);

  // Load payment methods on mount
  useEffect(() => {
    if (!hasLoaded.current) {
      hasLoaded.current = true;
      loadPaymentMethods();
    }
  }, [loadPaymentMethods]);

  // Get type icon
  const getTypeIcon = (type) => {
    switch (type) {
      case "mobile bank":
        return <FiSmartphone className="w-4 h-4" />;
      case "card":
        return <FiCreditCard className="w-4 h-4" />;
      case "cash":
        return <FiDollarSign className="w-4 h-4" />;
      default:
        return <FiHash className="w-4 h-4" />;
    }
  };

  // Get type badge color
  const getTypeBadge = (type) => {
    switch (type) {
      case "mobile bank":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "card":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "cash":
        return "bg-green-50 text-green-700 border-green-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  // Get type label
  const getTypeLabel = (type) => {
    switch (type) {
      case "mobile bank":
        return "Mobile Bank";
      case "card":
        return "Card";
      case "cash":
        return "Cash";
      default:
        return type || "Other";
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    });
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: "" });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = "Payment method name is required";
    }
    if (!formData.type) {
      errors.type = "Payment method type is required";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const loadingId = alert.showAlert({
        type: "info",
        message: editingMethod
          ? "Updating payment method..."
          : "Creating payment method...",
        description: "Please wait...",
        duration: 0,
        closable: false,
      });

      const data = {
        name: formData.name.trim(),
        type: formData.type,
        is_active: formData.is_active,
      };

      let result;
      if (editingMethod) {
        result = await editPaymentMethod(editingMethod.id, data);
      } else {
        result = await addPaymentMethod(data);
      }

      alert.hideAlert(loadingId);

      if (result?.success) {
        setFormData({ name: "", type: "cash", is_active: 1 });
        setShowModal(false);
        setEditingMethod(null);
        await loadPaymentMethods();
        alert.success(
          editingMethod
            ? "Payment method updated successfully!"
            : "Payment method created successfully!",
          {
            description: `"${formData.name}" has been ${editingMethod ? "updated" : "added"}.`,
          },
        );
      } else {
        alert.error("Failed to save payment method", {
          description: result?.message || "Please try again.",
        });
      }
    } catch (error) {
      console.error("Error saving payment method:", error);
      alert.error("Failed to save payment method", {
        description: error.message || "Please try again.",
      });
    }
  };

  const handleEdit = (method) => {
    setEditingMethod(method);
    setFormData({
      name: method.name || "",
      type: method.type || "cash",
      is_active: method.is_active !== undefined ? method.is_active : 1,
    });
    setShowModal(true);
    setFormErrors({});
  };

  const handleStatusToggle = async (id, currentStatus, name) => {
    const newStatus = currentStatus === 1 ? 0 : 1;
    const action = newStatus === 1 ? "activate" : "deactivate";

    const confirmed = await showConfirm({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} Payment Method`,
      message: `Are you sure you want to ${action} "${name}"?`,
      confirmText: action.charAt(0).toUpperCase() + action.slice(1),
      cancelText: "Cancel",
      type: newStatus === 1 ? "success" : "warning",
    });

    if (!confirmed) return;

    setConfirmLoading(true);
    try {
      const loadingId = alert.showAlert({
        type: "info",
        message: `${action} payment method...`,
        description: "Please wait...",
        duration: 0,
        closable: false,
      });

      const res = await togglePaymentMethodStatus(id, newStatus);
      alert.hideAlert(loadingId);

      if (res?.success) {
        await loadPaymentMethods();
        alert.success(`Payment method ${action}d successfully!`, {
          description: `"${name}" has been ${action}d.`,
        });
      } else {
        alert.error(`Failed to ${action} payment method`, {
          description: res?.message || "Please try again.",
        });
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert.error("Failed to update status", {
        description: error.message || "Please try again.",
      });
    } finally {
      setConfirmLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingMethod(null);
    setFormData({ name: "", type: "cash", is_active: 1 });
    setShowModal(true);
    setFormErrors({});
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingMethod(null);
    setFormData({ name: "", type: "cash", is_active: 1 });
    setFormErrors({});
  };

  const totalMethods = paymentMethods.length;
  const activeMethods = paymentMethods.filter((m) => m.is_active === 1).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div>
        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6 hover:shadow-md transition-shadow">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center">
                  <FiCreditCard className="w-5 h-5 text-white" />
                </div>
                Payment Methods
              </h1>
              <p className="text-sm text-gray-500 mt-1 ml-14">
                Manage payment methods for POS and orders
              </p>
            </div>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-all shadow-sm"
            >
              <FiPlus className="w-4 h-4" />
              Add Payment Method
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Methods</p>
                <p className="text-2xl font-bold text-gray-800">
                  {totalMethods}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
                <FiCreditCard className="w-6 h-6" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {activeMethods}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <FiCheck className="w-6 h-6" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Inactive</p>
                <p className="text-2xl font-bold text-gray-400">
                  {totalMethods - activeMethods}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                <FiX className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium text-gray-700">
                Payment Methods List
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {totalMethods} methods found
              </p>
            </div>
            <button
              onClick={() => {
                loadPaymentMethods();
                alert.success("Payment methods refreshed!", {
                  description: "Data has been updated.",
                  duration: 2000,
                });
              }}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiRefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent"></div>
              <p className="text-sm text-gray-500 mt-3">
                Loading payment methods...
              </p>
            </div>
          ) : paymentMethods.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCreditCard className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium">
                No payment methods found
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Create your first payment method to get started
              </p>
              <button
                onClick={openCreateModal}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-all text-sm font-medium"
              >
                <FiPlus className="w-4 h-4" />
                Add Payment Method
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-right py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paymentMethods.map((method, index) => (
                    <tr
                      key={method.id}
                      className="hover:bg-gray-50/80 transition-colors group"
                    >
                      <td className="py-3 px-6">
                        <span className="text-sm text-gray-400">
                          #{index + 1}
                        </span>
                      </td>
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
                            {getTypeIcon(method.type)}
                          </div>
                          <span className="text-sm font-medium text-gray-800">
                            {method.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-6">
                        <span
                          className={`inline-flex px-2.5 py-1 text-xs font-medium border rounded-full ${getTypeBadge(method.type)}`}
                        >
                          {getTypeLabel(method.type)}
                        </span>
                      </td>
                      <td className="py-3 px-6">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            method.is_active === 1
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                              method.is_active === 1
                                ? "bg-emerald-500"
                                : "bg-gray-400"
                            }`}
                          ></span>
                          {method.is_active === 1 ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() =>
                              handleStatusToggle(
                                method.id,
                                method.is_active,
                                method.name,
                              )
                            }
                            className={`p-1.5 rounded-lg transition-colors ${
                              method.is_active === 1
                                ? "text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50"
                                : "text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50"
                            }`}
                            title={
                              method.is_active === 1 ? "Deactivate" : "Activate"
                            }
                          >
                            {method.is_active === 1 ? (
                              <FiX className="w-4 h-4" />
                            ) : (
                              <FiCheck className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleEdit(method)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {editingMethod ? "Edit Payment Method" : "Add Payment Method"}
                </h3>
                <p className="text-sm text-gray-500">
                  {editingMethod
                    ? "Update payment method details"
                    : "Create a new payment method"}
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
                  Payment Method Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiCreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white ${
                      formErrors.name ? "border-red-400" : "border-gray-200"
                    }`}
                    placeholder="e.g., ABA Pay"
                  />
                </div>
                {formErrors.name && (
                  <p className="mt-1.5 text-xs text-red-500">
                    {formErrors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["cash", "card", "mobile bank"].map((type) => {
                    const isSelected = formData.type === type;
                    const icons = {
                      cash: <FiDollarSign className="w-5 h-5" />,
                      card: <FiCreditCard className="w-5 h-5" />,
                      "mobile bank": <FiSmartphone className="w-5 h-5" />,
                    };
                    const labels = {
                      cash: "Cash",
                      card: "Card",
                      "mobile bank": "Mobile Bank",
                    };
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({ ...formData, type })}
                        className={`p-3 rounded-lg border-2 text-center transition-all ${
                          isSelected
                            ? "border-black bg-gray-50 shadow-sm"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg mx-auto flex items-center justify-center ${
                            isSelected
                              ? "bg-black text-white"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {icons[type]}
                        </div>
                        <p
                          className={`text-xs mt-1.5 font-medium ${
                            isSelected ? "text-black" : "text-gray-600"
                          }`}
                        >
                          {labels[type]}
                        </p>
                      </button>
                    );
                  })}
                </div>
                {formErrors.type && (
                  <p className="mt-1.5 text-xs text-red-500">
                    {formErrors.type}
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active === 1}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        is_active: e.target.checked ? 1 : 0,
                      })
                    }
                    className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                  />
                  Active
                </label>
                <p className="text-xs text-gray-400 mt-1">
                  Inactive methods won't appear in POS checkout
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  className="flex-1 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-all shadow-sm"
                >
                  {editingMethod ? "Update" : "Create"}
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

export default PaymentMethodPage;
