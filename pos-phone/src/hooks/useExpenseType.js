// hooks/useExpenseType.js
import { useState, useCallback } from "react";
import {
  getExpenseTypes,
  createExpenseType,
  updateExpenseType,
  deleteExpenseType,
} from "../api/expenseTypeApi";

const useExpenseType = () => {
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
  });

  // Load expense types with filters
  const loadExpenseTypes = useCallback(async (filter = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response = await getExpenseTypes(filter);

      if (response && response.data) {
        setExpenseTypes(response.data || []);
        // If pagination info is in response
        if (response.pagination) {
          setPagination(response.pagination);
        }
      } else {
        setExpenseTypes([]);
      }
    } catch (err) {
      setError(err.message || "Failed to load expense types");
      console.error("Load Expense Types Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new expense type
  const handleCreateExpenseType = useCallback(async (data) => {
    try {
      setLoading(true);
      setError(null);

      const response = await createExpenseType(data);

      if (response && response.data) {
        // Refresh the list after creation
        await loadExpenseTypes();
        return response.data;
      }
      return null;
    } catch (err) {
      setError(err.message || "Failed to create expense type");
      console.error("Create Expense Type Error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadExpenseTypes]);

  // Update expense type
  const handleUpdateExpenseType = useCallback(async (id, data) => {
    try {
      setLoading(true);
      setError(null);

      const response = await updateExpenseType(id, data);

      if (response && response.data) {
        // Refresh the list after update
        await loadExpenseTypes();
        return response.data;
      }
      return null;
    } catch (err) {
      setError(err.message || "Failed to update expense type");
      console.error("Update Expense Type Error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadExpenseTypes]);

  // Delete expense type
  const handleDeleteExpenseType = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);

      const response = await deleteExpenseType(id);

      if (response) {
        // Refresh the list after deletion
        await loadExpenseTypes();
        return true;
      }
      return false;
    } catch (err) {
      setError(err.message || "Failed to delete expense type");
      console.error("Delete Expense Type Error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadExpenseTypes]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    expenseTypes,
    setExpenseTypes,
    loading,
    error,
    pagination,
    loadExpenseTypes,
    createExpenseType: handleCreateExpenseType,
    updateExpenseType: handleUpdateExpenseType,
    deleteExpenseType: handleDeleteExpenseType,
    clearError,
  };
};

export default useExpenseType;