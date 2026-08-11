// components/AllExpense.jsx
import React, { useState, useEffect } from "react";
import useExpense from "../../hooks/useExpense";
import useExpenseType from "../../hooks/useExpenseType";
import ExpenseChart from "./ExpenseChart";
import {
  FiPlus,
  FiX,
  FiSearch,
  FiRefreshCw,
  FiEdit2,
  FiTrash2,
  FiDollarSign,
  FiTag,
  FiCalendar,
  FiFileText,
  FiAlertCircle,
  FiCheck,
  FiHash,
  FiGrid,
  FiList,
} from "react-icons/fi";

const AllExpense = () => {
  const {
    expenses,
    summary,
    loading: expensesLoading,
    loadExpenses,
    loadSummary,
    createExpense,
    updateExpense,
    deleteExpense,
  } = useExpense();

  const { expenseTypes, loadExpenseTypes } = useExpenseType();

  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    expense_type_id: "",
    date_from: "",
    date_to: "",
  });
  const [formData, setFormData] = useState({
    expense_type_id: "",
    name: "",
    amount: "",
    remark: "",
    expense_date: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    const filter = {};
    if (filters.search) filter.search = filters.search;
    if (filters.expense_type_id)
      filter.expense_type_id = filters.expense_type_id;
    if (filters.date_from) filter.date_from = filters.date_from;
    if (filters.date_to) filter.date_to = filters.date_to;

    await Promise.all([
      loadExpenses(filter),
      loadSummary(filter),
      loadExpenseTypes(),
    ]);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadAllData();
    }, 500);
    return () => clearTimeout(timer);
  }, [filters]);

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

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
    if (!formData.name.trim()) errors.name = "Expense name is required";
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      errors.amount = "Amount must be greater than 0";
    }
    if (!formData.expense_type_id) errors.expense_type_id = "Category is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitError("");
    setSuccessMessage("");

    try {
      const expenseData = {
        expense_type_id: parseInt(formData.expense_type_id),
        name: formData.name.trim(),
        amount: parseFloat(formData.amount),
        remark: formData.remark || "",
        expense_date: formData.expense_date || new Date().toISOString().split("T")[0],
      };

      let result;
      if (editingExpense) {
        result = await updateExpense(editingExpense.id, expenseData);
        if (result) setSuccessMessage("Expense updated successfully!");
      } else {
        result = await createExpense(expenseData);
        if (result) setSuccessMessage("Expense created successfully!");
      }

      if (result) {
        setFormData({
          expense_type_id: "",
          name: "",
          amount: "",
          remark: "",
          expense_date: "",
        });
        await loadAllData();
        setTimeout(() => {
          setShowModal(false);
          setEditingExpense(null);
          setSuccessMessage("");
        }, 1500);
      }
    } catch (error) {
      console.error("Error saving expense:", error);
      setSubmitError(error.message || "An error occurred");
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await deleteExpense(id);
      await loadAllData();
      setSuccessMessage("Expense deleted successfully!");
      setTimeout(() => setSuccessMessage(""), 2000);
    } catch (error) {
      console.error("Error deleting expense:", error);
      setSubmitError(error.message || "Failed to delete expense");
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setFormData({
      expense_type_id: expense.expense_type_id?.toString() || "",
      name: expense.name || "",
      amount: expense.amount?.toString() || "",
      remark: expense.remark || "",
      expense_date: expense.expense_date || "",
    });
    setShowModal(true);
    setFormErrors({});
    setSubmitError("");
    setSuccessMessage("");
  };

  const openCreateModal = () => {
    setEditingExpense(null);
    setFormData({
      expense_type_id: "",
      name: "",
      amount: "",
      remark: "",
      expense_date: "",
    });
    setShowModal(true);
    setFormErrors({});
    setSubmitError("");
    setSuccessMessage("");
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingExpense(null);
    setFormData({
      expense_type_id: "",
      name: "",
      amount: "",
      remark: "",
      expense_date: "",
    });
    setFormErrors({});
    setSubmitError("");
    setSuccessMessage("");
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      expense_type_id: "",
      date_from: "",
      date_to: "",
    });
  };

  const getTypeName = (typeId) => {
    const type = expenseTypes.find((t) => t.id === typeId);
    return type ? type.name : "Uncategorized";
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getTypeColor = (typeId) => {
    const colors = [
      "bg-gray-100 text-gray-700",
      "bg-blue-50 text-blue-700",
      "bg-emerald-50 text-emerald-700",
      "bg-purple-50 text-purple-700",
      "bg-rose-50 text-rose-700",
      "bg-amber-50 text-amber-700",
      "bg-cyan-50 text-cyan-700",
      "bg-indigo-50 text-indigo-700",
    ];
    const index = typeId ? typeId % colors.length : 0;
    return colors[index];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 tracking-tight">
              Expense Management
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Track and manage your expenses
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-black hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-all shadow-sm"
          >
            <FiPlus className="w-4 h-4" />
            Add Expense
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Transactions</p>
                <p className="text-2xl font-semibold text-gray-800 mt-1">
                  {summary.total_transaction || 0}
                </p>
              </div>
              <div className="w-11 h-11 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700">
                <FiList className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Amount</p>
                <p className="text-2xl font-semibold text-gray-800 mt-1">
                  {formatCurrency(summary.total_amount || 0)}
                </p>
              </div>
              <div className="w-11 h-11 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <FiDollarSign className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Categories Used</p>
                <p className="text-2xl font-semibold text-gray-800 mt-1">
                  {summary.total_expense_type || 0}
                </p>
              </div>
              <div className="w-11 h-11 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                <FiGrid className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <ExpenseChart />

        {/* Main Card */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          {/* Filters */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  name="search"
                  placeholder="Search expenses..."
                  value={filters.search}
                  onChange={handleFilterChange}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white"
                />
              </div>
              <select
                name="expense_type_id"
                value={filters.expense_type_id}
                onChange={handleFilterChange}
                className="px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none bg-white min-w-[150px]"
              >
                <option value="">All Categories</option>
                {expenseTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
              <input
                type="date"
                name="date_from"
                value={filters.date_from}
                onChange={handleFilterChange}
                className="px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none bg-white"
              />
              <input
                type="date"
                name="date_to"
                value={filters.date_to}
                onChange={handleFilterChange}
                className="px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none bg-white"
              />
              <button
                onClick={resetFilters}
                className="px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Reset
              </button>
              <button
                onClick={() => loadAllData()}
                className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiRefreshCw className={`w-4 h-4 ${expensesLoading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* Success/Error Messages */}
          {successMessage && (
            <div className="mx-6 mt-4 bg-emerald-50 border border-emerald-200 rounded-lg p-3.5 flex items-start gap-3">
              <FiCheck className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-emerald-700">{successMessage}</p>
            </div>
          )}

          {submitError && (
            <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-3.5 flex items-start gap-3">
              <FiAlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{submitError}</p>
            </div>
          )}

          {/* Expenses Table */}
          {expensesLoading ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent"></div>
              <p className="text-sm text-gray-400 mt-3">Loading expenses...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ref No
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Remark
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {expenses.map((expense) => (
                    <tr
                      key={expense.id}
                      className="hover:bg-gray-50/80 transition-colors duration-150"
                    >
                      <td className="py-3 px-4">
                        <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md">
                          {expense.ref_no}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm font-medium text-gray-800">
                          {expense.name}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${getTypeColor(expense.expense_type_id)}`}>
                          {expense.expense_type_name || getTypeName(expense.expense_type_id)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCurrency(expense.amount)}
                        </span>
                      </td>
                      <td className="py-3 px-4 hidden md:table-cell">
                        <span className="text-sm text-gray-500 line-clamp-1">
                          {expense.remark || "—"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <FiCalendar className="w-3 h-3 text-gray-400" />
                          {expense.expense_date
                            ? new Date(expense.expense_date).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )
                            : "-"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => handleEdit(expense)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(expense.id, expense.name)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {expenses.length === 0 && (
                    <tr>
                      <td colSpan="7" className="py-16 text-center">
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <FiFileText className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-gray-500 font-medium">No expenses found</p>
                          <p className="text-sm text-gray-400 mt-1">
                            {filters.search || filters.expense_type_id || filters.date_from || filters.date_to
                              ? "Try adjusting your filters"
                              : "Start by adding your first expense"}
                          </p>
                          {!filters.search && !filters.expense_type_id && !filters.date_from && !filters.date_to && (
                            <button
                              onClick={openCreateModal}
                              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-black hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-all"
                            >
                              <FiPlus className="w-4 h-4" />
                              Add Expense
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer */}
          {!expensesLoading && expenses.length > 0 && (
            <div className="px-6 py-3 border-t border-gray-200 bg-gray-50/50 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing <span className="font-medium text-gray-700">{expenses.length}</span> expenses
              </p>
              <span className="text-xs text-gray-400">
                Total: {formatCurrency(expenses.reduce((sum, e) => sum + e.amount, 0))}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {editingExpense ? "Edit Expense" : "Add Expense"}
                </h3>
                <p className="text-sm text-gray-500">
                  {editingExpense ? "Update expense details" : "Record a new expense"}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Expense Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiTag className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white ${
                        formErrors.name ? "border-red-400" : "border-gray-200"
                      }`}
                      placeholder="Enter expense name"
                    />
                  </div>
                  {formErrors.name && (
                    <p className="mt-1.5 text-xs text-red-500">{formErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Amount <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiDollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className={`w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white ${
                        formErrors.amount ? "border-red-400" : "border-gray-200"
                      }`}
                      placeholder="0.00"
                    />
                  </div>
                  {formErrors.amount && (
                    <p className="mt-1.5 text-xs text-red-500">{formErrors.amount}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="expense_type_id"
                    value={formData.expense_type_id}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white ${
                      formErrors.expense_type_id ? "border-red-400" : "border-gray-200"
                    }`}
                  >
                    <option value="">Select category</option>
                    {expenseTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name} ({type.code})
                      </option>
                    ))}
                  </select>
                  {formErrors.expense_type_id && (
                    <p className="mt-1.5 text-xs text-red-500">{formErrors.expense_type_id}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Date
                  </label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="date"
                      name="expense_date"
                      value={formData.expense_date}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Remark
                  </label>
                  <div className="relative">
                    <FiFileText className="absolute left-3.5 top-3 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      name="remark"
                      value={formData.remark}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white"
                      placeholder="Additional notes (optional)"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-black hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-all shadow-sm"
                >
                  {editingExpense ? "Update Expense" : "Create Expense"}
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

export default AllExpense;