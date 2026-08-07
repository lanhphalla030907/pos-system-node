import { useState, useCallback } from "react";
import {
  getCustomer,
  createCustomer,
  updateCustomer,
  updateCustomerDiscount,
  deleteCustomer,
} from "../api/customerApi";

export const useCustomer = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [summary, setSummary] = useState({
    total: 0,
    vip: 0,
    member: 0,
    regular: 0,
  });

  const loadCustomers = useCallback(async (filter = {}) => {
    try {
      setLoading(true);
      setError(null);

      const res = await getCustomer(filter);

      if (res?.success) {
        setCustomers(res.data.list || []);
        setPagination(res.data.pagination || {});
        setSummary(res.data.summary || {});

        return res;
      }

      setCustomers([]);
      setPagination({});
      setSummary({});

      return res;
    } catch (error) {
      console.error("Error loading customers:", error);

      setCustomers([]);
      setPagination({});
      setSummary({});
      setError(error.message);

      return {
        success: false,
        message: error.message,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Create Customer
  const addCustomer = useCallback(async (data) => {
    try {
      setLoading(true);
      setError(null);
      const res = await createCustomer(data);
      if (res?.success) {
        setCustomers((prev) => [res.data, ...prev]);
        setSelectedCustomer(res.data);
        return res;
      } else {
        if (res?.message) {
          setError(res.message);
          return { success: false, message: res.message };
        }
        return res;
      }
    } catch (error) {
      console.error("Error creating customer:", error);
      const errorMessage = error.message || "Failed to create customer";
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  //  Update Customer
  const editCustomer = useCallback(
    async (id, data) => {
      try {
        setLoading(true);
        setError(null);
        const res = await updateCustomer(id, data);
        if (res?.success) {
          setCustomers((prev) => prev.map((c) => (c.id === id ? res.data : c)));
          if (selectedCustomer?.id === id) {
            setSelectedCustomer(res.data);
          }
          return res;
        } else {
          if (res?.message) {
            setError(res.message);
            return { success: false, message: res.message };
          }
          return res;
        }
      } catch (error) {
        console.error("Error updating customer:", error);
        const errorMessage = error.message || "Failed to update customer";
        setError(errorMessage);
        return { success: false, message: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [selectedCustomer],
  );

  //  Update Customer Discount
  const editCustomerDiscount = useCallback(
    async (id, discount) => {
      try {
        setLoading(true);
        setError(null);
        const res = await updateCustomerDiscount(id, discount);
        if (res?.success) {
          // Refresh customer list to get updated data
          await loadCustomers();
          return res;
        } else {
          if (res?.message) {
            setError(res.message);
            return { success: false, message: res.message };
          }
          return res;
        }
      } catch (error) {
        console.error("Error updating customer discount:", error);
        const errorMessage = error.message || "Failed to update discount";
        setError(errorMessage);
        return { success: false, message: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [loadCustomers],
  );

  //  Delete Customer
  const removeCustomer = useCallback(
    async (id) => {
      try {
        setLoading(true);
        setError(null);
        const res = await deleteCustomer(id);
        if (res?.success) {
          setCustomers((prev) => prev.filter((c) => c.id !== id));
          if (selectedCustomer?.id === id) {
            setSelectedCustomer(null);
          }
          return res;
        } else {
          if (res?.message) {
            setError(res.message);
            return { success: false, message: res.message };
          }
          return res;
        }
      } catch (error) {
        console.error("Error deleting customer:", error);
        const errorMessage = error.message || "Failed to delete customer";
        setError(errorMessage);
        return { success: false, message: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [selectedCustomer],
  );

  // Select Customer
  const selectCustomer = useCallback((customer) => {
    setSelectedCustomer(customer);
  }, []);

  // Clear Selected Customer
  const clearSelectedCustomer = useCallback(() => {
    setSelectedCustomer(null);
  }, []);

  // Clear Error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    customers,
    loading,
    error,
    pagination,
    summary,
    selectedCustomer,
    loadCustomers,
    addCustomer,
    editCustomer,
    editCustomerDiscount,
    removeCustomer,
    selectCustomer,
    clearSelectedCustomer,
    clearError,
  };
};
