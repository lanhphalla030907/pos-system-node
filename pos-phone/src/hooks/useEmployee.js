// hooks/useEmployee.js
import { useState, useCallback } from 'react';
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  updateEmployeeStatus,
  deleteEmployee,
  createEmployeeAccount,
} from '../api/employeeApi';

export const useEmployee = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10,
  });

  // Load all employees
  const loadEmployees = useCallback(async (filter = {}) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getEmployees(filter);
      
      if (res?.success) {
        setEmployees(res.data || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      } else {
        setEmployees([]);
      }
      return res;
    } catch (error) {
      console.error('Error loading employees:', error);
      setError(error.message);
      setEmployees([]);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get employee by ID
  const loadEmployeeById = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getEmployeeById(id);
      return res;
    } catch (error) {
      console.error('Error loading employee:', error);
      setError(error.message);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Create employee
  const addEmployee = useCallback(async (data) => {
    try {
      setLoading(true);
      setError(null);
      const res = await createEmployee(data);
      if (res?.success) {
        await loadEmployees();
      }
      return res;
    } catch (error) {
      console.error('Error creating employee:', error);
      setError(error.message);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  }, [loadEmployees]);

  // Update employee
  const editEmployee = useCallback(async (id, data) => {
    try {
      setLoading(true);
      setError(null);
      const res = await updateEmployee(id, data);
      if (res?.success) {
        await loadEmployees();
      }
      return res;
    } catch (error) {
      console.error('Error updating employee:', error);
      setError(error.message);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  }, [loadEmployees]);

  // Update status
  const changeStatus = useCallback(async (id, status) => {
    try {
      setLoading(true);
      setError(null);
      const res = await updateEmployeeStatus(id, status);
      if (res?.success) {
        await loadEmployees();
      }
      return res;
    } catch (error) {
      console.error('Error updating status:', error);
      setError(error.message);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  }, [loadEmployees]);

  // Delete employee
  const removeEmployee = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const res = await deleteEmployee(id);
      if (res?.success) {
        await loadEmployees();
      }
      return res;
    } catch (error) {
      console.error('Error deleting employee:', error);
      setError(error.message);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  }, [loadEmployees]);
  const addEmployeeAccount = useCallback(async (id, data) => {
    try {
      setLoading(true);
      setError(null);
      const res = await createEmployeeAccount(id, data);
      if (res?.success) {
        await loadEmployees();
      }
      return res;
    } catch (error) {
      console.error('Error creating employee account:', error);
      setError(error.message);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  }, [loadEmployees]);
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    employees,
    loading,
    error,
    pagination,
    loadEmployees,
    loadEmployeeById,
    addEmployee,
    editEmployee,
    changeStatus,
    removeEmployee,
    addEmployeeAccount,
    clearError,
  };
};