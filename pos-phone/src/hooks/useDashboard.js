// hooks/useDashboard.js
import { useState, useCallback } from 'react';
import {
  getDashboardSummary,
  getSalesChart,
  getProfitChart,
  getRecentLoginActivity,
} from '../api/dashboardApi';

export const useDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [salesChart, setSalesChart] = useState([]);
  const [profitChart, setProfitChart] = useState([]);
  const [recentLogins, setRecentLogins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chartPeriod, setChartPeriod] = useState('monthly');

  // Load dashboard summary
  const loadSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getDashboardSummary();
      if (res?.success) {
        setSummary(res.data);
      }
      return res;
    } catch (error) {
      console.error('Error loading dashboard summary:', error);
      setError(error.message);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Load sales chart with period
  const loadSalesChart = useCallback(async (period = 'monthly') => {
    try {
      setLoading(true);
      setError(null);
      const res = await getSalesChart(period);
      if (res?.success) {
        setSalesChart(res.data || []);
        setChartPeriod(res.period || period);
      }
      return res;
    } catch (error) {
      console.error('Error loading sales chart:', error);
      setError(error.message);
      setSalesChart([]);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Load profit chart with period
  const loadProfitChart = useCallback(async (period = 'monthly') => {
    try {
      setLoading(true);
      setError(null);
      const res = await getProfitChart(period);
      if (res?.success) {
        setProfitChart(res.data || []);
      }
      return res;
    } catch (error) {
      console.error('Error loading profit chart:', error);
      setError(error.message);
      setProfitChart([]);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Load recent login activity
  const loadRecentLogins = useCallback(async (limit = 10) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getRecentLoginActivity(limit);
      if (res?.success) {
        setRecentLogins(res.data || []);
      }
      return res;
    } catch (error) {
      console.error('Error loading recent logins:', error);
      setError(error.message);
      setRecentLogins([]);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Load all dashboard data with period
  const loadDashboard = useCallback(async (period = 'monthly') => {
    try {
      setLoading(true);
      setError(null);
      await Promise.all([
        loadSummary(),
        loadSalesChart(period),
        loadProfitChart(period),
        loadRecentLogins(10),
      ]);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [loadSummary, loadSalesChart, loadProfitChart, loadRecentLogins]);

  // Change chart period and reload
  const changeChartPeriod = useCallback(async (period) => {
    setChartPeriod(period);
    await Promise.all([
      loadSalesChart(period),
      loadProfitChart(period),
    ]);
  }, [loadSalesChart, loadProfitChart]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    summary,
    salesChart,
    profitChart,
    recentLogins,
    loading,
    error,
    chartPeriod,
    loadSummary,
    loadSalesChart,
    loadProfitChart,
    loadRecentLogins,
    loadDashboard,
    changeChartPeriod,
    clearError,
  };
};