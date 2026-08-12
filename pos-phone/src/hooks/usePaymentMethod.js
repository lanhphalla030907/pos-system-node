// hooks/usePaymentMethod.js
import { useState, useCallback } from 'react';
import {
  getPaymentMethods,
  getPaymentMethodById,
  createPaymentMethod,
  updatePaymentMethod,
  updatePaymentMethodStatus,
} from '../api/paymentMethodApi';

export const usePaymentMethod = () => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load all payment methods
  const loadPaymentMethods = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getPaymentMethods();
      if (res?.success) {
        setPaymentMethods(res.data || []);
      } else {
        setPaymentMethods([]);
      }
      return res;
    } catch (error) {
      console.error('Error loading payment methods:', error);
      setError(error.message);
      setPaymentMethods([]);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get payment method by ID
  const loadPaymentMethodById = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getPaymentMethodById(id);
      return res;
    } catch (error) {
      console.error('Error loading payment method:', error);
      setError(error.message);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Create payment method
  const addPaymentMethod = useCallback(async (data) => {
    try {
      setLoading(true);
      setError(null);
      const res = await createPaymentMethod(data);
      if (res?.success) {
        await loadPaymentMethods();
      }
      return res;
    } catch (error) {
      console.error('Error creating payment method:', error);
      setError(error.message);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  }, [loadPaymentMethods]);

  // Update payment method
  const editPaymentMethod = useCallback(async (id, data) => {
    try {
      setLoading(true);
      setError(null);
      const res = await updatePaymentMethod(id, data);
      if (res?.success) {
        await loadPaymentMethods();
      }
      return res;
    } catch (error) {
      console.error('Error updating payment method:', error);
      setError(error.message);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  }, [loadPaymentMethods]);

  // Update payment method status
  const togglePaymentMethodStatus = useCallback(async (id, is_active) => {
    try {
      setLoading(true);
      setError(null);
      const res = await updatePaymentMethodStatus(id, is_active);
      if (res?.success) {
        await loadPaymentMethods();
      }
      return res;
    } catch (error) {
      console.error('Error updating payment method status:', error);
      setError(error.message);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  }, [loadPaymentMethods]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    paymentMethods,
    loading,
    error,
    loadPaymentMethods,
    loadPaymentMethodById,
    addPaymentMethod,
    editPaymentMethod,
    togglePaymentMethodStatus,
    clearError,
  };
};