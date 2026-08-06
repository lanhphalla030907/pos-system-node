// hooks/useExpense.js
import { useState, useCallback } from "react";
import {
  getExpenses,
  getExpenseSummary,
  getExpenseChart,
  createExpense,
  updateExpense,
  deleteExpense,
} from "../api/expenseApi";

const useExpense = () => {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({
    total_transaction: 0,
    total_amount: 0,
    total_expense_type: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load expenses with filters
  const loadExpenses = useCallback(async (filter = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response = await getExpenses(filter);

      if (response && response.data) {
        setExpenses(response.data || []);
      } else {
        setExpenses([]);
      }
    } catch (err) {
      setError(err.message || "Failed to load expenses");
      console.error("Load Expenses Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load expense summary with filters
  const loadSummary = useCallback(async (filter = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response = await getExpenseSummary(filter);

      if (response && response.data) {
        setSummary({
          total_transaction: response.data.total_transaction || 0,
          total_amount: response.data.total_amount || 0,
          total_expense_type: response.data.total_expense_type || 0,
        });
      } else {
        setSummary({
          total_transaction: 0,
          total_amount: 0,
          total_expense_type: 0,
        });
      }
    } catch (err) {
      setError(err.message || "Failed to load summary");
      console.error("Load Summary Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load expense chart data
  const loadChart = useCallback(async (filter = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response = await getExpenseChart(filter);

      if (response && response.data) {
        setChartData(response.data || []);
      } else {
        setChartData([]);
      }
    } catch (err) {
      setError(err.message || "Failed to load chart data");
      console.error("Load Chart Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load all data
  const loadAllData = useCallback(async (filter = {}) => {
    await Promise.all([
      loadExpenses(filter),
      loadSummary(filter),
      loadChart({ year: filter.year || new Date().getFullYear() })
    ]);
  }, [loadExpenses, loadSummary, loadChart]);

  // Create new expense
  const handleCreateExpense = useCallback(async (data) => {
    try {
      setLoading(true);
      setError(null);

      const response = await createExpense(data);

      if (response && response.data) {
        await loadAllData();
        return response.data;
      }
      return null;
    } catch (err) {
      setError(err.message || "Failed to create expense");
      console.error("Create Expense Error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadAllData]);

  // Update expense
  const handleUpdateExpense = useCallback(async (id, data) => {
    try {
      setLoading(true);
      setError(null);

      const response = await updateExpense(id, data);

      if (response && response.data) {
        await loadAllData();
        return response.data;
      }
      return null;
    } catch (err) {
      setError(err.message || "Failed to update expense");
      console.error("Update Expense Error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadAllData]);

  // Delete expense
  const handleDeleteExpense = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);

      const response = await deleteExpense(id);

      if (response) {
        await loadAllData();
        return true;
      }
      return false;
    } catch (err) {
      setError(err.message || "Failed to delete expense");
      console.error("Delete Expense Error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadAllData]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    expenses,
    setExpenses,
    summary,
    chartData,
    loading,
    error,
    loadExpenses,
    loadSummary,
    loadChart,
    loadAllData,
    createExpense: handleCreateExpense,
    updateExpense: handleUpdateExpense,
    deleteExpense: handleDeleteExpense,
    clearError,
  };
};

export default useExpense;