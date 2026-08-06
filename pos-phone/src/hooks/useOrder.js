import { useState, useCallback } from 'react';
import { createOrder, getOrderById, getOrders } from '../api/orderApi';
export const useOrder = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastOrder, setLastOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10,
  });
  const saveOrder = useCallback(async (data) => {
    try {
      setLoading(true);
      setError(null);
      const res = await createOrder(data);
      if (res?.success) {
        setLastOrder(res.data);
      }
      return res;
    } catch (error) {
      const errorMessage = error.message || 'Failed to create order';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const loadOrders = useCallback(async (filter = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const apiFilter = {
        search: filter.search || '',
        page: filter.page || 1,
        limit: filter.limit || 10,
      };
      
      const res = await getOrders(apiFilter);  
      if (res?.success) {
        const responseData = res.data;
        // Get orders array from nested structure
        const ordersData = responseData?.data || [];
        setOrders(ordersData);
        const paginationData = responseData?.pagination;
        if (paginationData) {
          setPagination({
            total: paginationData.total || 0,
            totalPages: paginationData.totalPages || 1,
            currentPage: paginationData.page || 1,
            limit: paginationData.limit || 10,
          });
        } else {
          setPagination({
            total: ordersData.length,
            totalPages: Math.ceil(ordersData.length / (filter.limit || 10)),
            currentPage: filter.page || 1,
            limit: filter.limit || 10,
          });
        }
        
        return res;
      } else {
        setOrders([]);
        return res;
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      setError(error.message);
      setOrders([]);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const loadOrderById = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getOrderById(id);
      return res;
    } catch (error) {
      console.error('Error loading order by id:', error);
      setError(error.message);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearLastOrder = useCallback(() => {
    setLastOrder(null);
  }, []);

  return {
    loading,
    error,
    lastOrder,
    orders,
    pagination,
    saveOrder,
    loadOrders,
    loadOrderById,
    clearError,
    clearLastOrder,
  };
};