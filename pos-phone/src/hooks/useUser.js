import { useState, useCallback } from "react";
import { getUsers, createUser, updateUserStatus } from "../api/userApi";
const useUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Get All Users
  const loadUsers = useCallback(async (filter = {}) => {
    try {
      setLoading(true);
      setError("");

      const res = await getUsers(filter);

      if (res.success) {
        setUsers(res.data || []);
      } else {
        setUsers([]);
        setError(res.message);
      }
    } catch (err) {
      setUsers([]);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, []);
  // Create User (Register)
  const addUser = useCallback(async (data) => {
    try {
      setLoading(true);
      setError("");
      const res = await createUser(data);
      if (res && res.error) {
        setError(res.error);
        return null;
      }
      if (res && res.message) {
        return res;
      }
      setError(res?.message || "Failed to create user");
      return null;
    } catch (err) {
      setError(err.message || "An error occurred while creating user");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);
  // Update User Status
  const toggleUserStatus = useCallback(async (id, is_active) => {
    try {
      setLoading(true);
      setError("");
      const res = await updateUserStatus(id, is_active);
      if (res && res.success) {
        return true;
      }
      setError(res?.message || "Failed to update user status");
      return false;
    } catch (err) {
      setError(err.message || "An error occurred while updating user status");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear Error
  const clearError = useCallback(() => {
    setError("");
  }, []);

  return {
    users,
    loading,
    error,
    loadUsers,
    addUser,
    toggleUserStatus,
    clearError,
  };
};

export default useUser;
