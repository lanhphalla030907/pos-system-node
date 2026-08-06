// hooks/useSales.js
import { useState, useCallback } from "react";
import {
  getSalesChart,
  getTodaySummary,
  getTodayOrders,
} from "../api/orderAPi";
import { getTopSaleProducts } from "../api/productApi";

const useSales = () => {
  const [salesData, setSalesData] = useState([]);
  const [todaySummary, setTodaySummary] = useState(null);
  const [todayOrders, setTodayOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [todayLoading, setTodayLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load sales chart data
  const loadSalesChart = useCallback(async (filter = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getSalesChart(filter);
      if (response && response.data) {
        setSalesData(response.data || []);
      } else {
        setSalesData([]);
      }
    } catch (err) {
      setError(err.message || "Failed to load sales chart data");
      console.error("Load Sales Chart Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load today's summary
  const loadTodaySummary = useCallback(async () => {
    try {
      setTodayLoading(true);
      setError(null);
      const response = await getTodaySummary();
      if (response && response.data) {
        setTodaySummary(response.data);
      } else {
        setTodaySummary(null);
      }
    } catch (err) {
      setError(err.message || "Failed to load today's summary");
      console.error("Load Today Summary Error:", err);
    } finally {
      setTodayLoading(false);
    }
  }, []);

  // Load today's orders
  const loadTodayOrders = useCallback(async () => {
    try {
      setTodayLoading(true);
      setError(null);
      const response = await getTodayOrders();
      if (response && response.data) {
        setTodayOrders(response.data || []);
      } else {
        setTodayOrders([]);
      }
    } catch (err) {
      setError(err.message || "Failed to load today's orders");
      console.error("Load Today Orders Error:", err);
    } finally {
      setTodayLoading(false);
    }
  }, []);

  // Load top sale products
  const loadTopSaleProducts = useCallback(async (filter = {}) => {
    try {
      setProductsLoading(true);
      setError(null);
      const response = await getTopSaleProducts(filter);
      if (response && response.data) {
        setTopProducts(response.data || []);
      } else {
        setTopProducts([]);
      }
    } catch (err) {
      setError(err.message || "Failed to load top sale products");
      console.error("Load Top Sale Products Error:", err);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    salesData,
    todaySummary,
    todayOrders,
    topProducts,
    loading,
    todayLoading,
    productsLoading,
    error,
    loadSalesChart,
    loadTodaySummary,
    loadTodayOrders,
    loadTopSaleProducts,
    clearError,
  };
};

export default useSales;
