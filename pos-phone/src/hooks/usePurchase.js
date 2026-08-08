// hooks/usePurchase.js
import { useState, useCallback } from 'react';
import {
  getPurchases,
  getPurchaseById,
  createPurchase,
  updatePurchase,
  getPurchaseSummary,
  getPurchaseReport,
} from '../api/purchaseApi';

export const usePurchase = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10,
  });
  const [summary, setSummary] = useState(null);
  const [report, setReport] = useState([]);

  // Load all purchases
  const loadPurchases = useCallback(async (filter = {}) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getPurchases(filter);

      if (res?.success) {
        setPurchases(res.data || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      } else {
        setPurchases([]);
      }
      return res;
    } catch (error) {
      console.error('Error loading purchases:', error);
      setError(error.message);
      setPurchases([]);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get purchase by ID
  const loadPurchaseById = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getPurchaseById(id);
      return res;
    } catch (error) {
      console.error('Error loading purchase:', error);
      setError(error.message);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Create purchase
  const addPurchase = useCallback(async (data) => {
    try {
      setLoading(true);
      setError(null);
      const res = await createPurchase(data);
      if (res?.success) {
        await loadPurchases();
      }
      return res;
    } catch (error) {
      console.error('Error creating purchase:', error);
      setError(error.message);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  }, [loadPurchases]);

  // Update purchase
  const editPurchase = useCallback(async (id, data) => {
    try {
      setLoading(true);
      setError(null);
      const res = await updatePurchase(id, data);
      if (res?.success) {
        await loadPurchases();
      }
      return res;
    } catch (error) {
      console.error('Error updating purchase:', error);
      setError(error.message);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  }, [loadPurchases]);

  // Load summary
  const loadSummary = useCallback(async (filter = {}) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getPurchaseSummary(filter);
      if (res?.success) {
        setSummary(res.data);
      }
      return res;
    } catch (error) {
      console.error('Error loading summary:', error);
      setError(error.message);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Load report
  const loadReport = useCallback(async (filter = {}) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getPurchaseReport(filter);
      if (res?.success) {
        setReport(res.data || []);
      }
      return res;
    } catch (error) {
      console.error('Error loading report:', error);
      setError(error.message);
      setReport([]);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    purchases,
    loading,
    error,
    pagination,
    summary,
    report,
    loadPurchases,
    loadPurchaseById,
    addPurchase,
    editPurchase,
    loadSummary,
    loadReport,
    clearError,
  };
};