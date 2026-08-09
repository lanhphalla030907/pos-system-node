// hooks/useStock.js
import { useState, useCallback } from 'react';
import {
  getLowStockProducts,
  getStockMovement,
  getStockHistory,
  getInventoryValue,
  testStockAlert,
} from '../api/stockApi';

export const useStock = () => {
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [stockMovement, setStockMovement] = useState([]);
  const [stockHistory, setStockHistory] = useState([]);
  const [inventoryValue, setInventoryValue] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10,
  });

  // Load low stock products
  const loadLowStockProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getLowStockProducts();
      if (res?.success) {
        setLowStockProducts(res.data || []);
      } else {
        setLowStockProducts([]);
      }
      return res;
    } catch (error) {
      console.error('Error loading low stock products:', error);
      setError(error.message);
      setLowStockProducts([]);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Load stock movement
  const loadStockMovement = useCallback(async (filter = {}) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getStockMovement(filter);
      if (res?.success) {
        setStockMovement(res.data || []);
      } else {
        setStockMovement([]);
      }
      return res;
    } catch (error) {
      console.error('Error loading stock movement:', error);
      setError(error.message);
      setStockMovement([]);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Load stock history
  const loadStockHistory = useCallback(async (filter = {}) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getStockHistory(filter);
      if (res?.success) {
        setStockHistory(res.data || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      } else {
        setStockHistory([]);
      }
      return res;
    } catch (error) {
      console.error('Error loading stock history:', error);
      setError(error.message);
      setStockHistory([]);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Load inventory value
  const loadInventoryValue = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getInventoryValue();
      if (res?.success) {
        setInventoryValue(res.data);
      } else {
        setInventoryValue(null);
      }
      return res;
    } catch (error) {
      console.error('Error loading inventory value:', error);
      setError(error.message);
      setInventoryValue(null);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Send test alert
  const sendTestAlert = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await testStockAlert();
      return res;
    } catch (error) {
      console.error('Error sending test alert:', error);
      setError(error.message);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    lowStockProducts,
    stockMovement,
    stockHistory,
    inventoryValue,
    loading,
    error,
    pagination,
    loadLowStockProducts,
    loadStockMovement,
    loadStockHistory,
    loadInventoryValue,
    sendTestAlert,
    clearError,
  };
};