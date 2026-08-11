// hooks/usePermission.js
import { useState, useCallback } from "react";
import {
  getPermissions,
  getPermissionById,
  createPermission,
  updatePermission,
  deletePermission,
  getRolePermissions,
  assignRolePermissions,
  removeRolePermission,
} from "../api/permissionApi";

const usePermission = () => {
  const [permissions, setPermissions] = useState([]);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  // Load all permissions
  const loadPermissions = useCallback(async (filter = {}) => {
    try {
      setLoading(true);
      const res = await getPermissions(filter);
      if (res && res.data) {
        if (res.data.data && Array.isArray(res.data.data)) {
          setPermissions(res.data.data);
          if (res.data.pagination) {
            setPagination({
              total: res.data.pagination.total || 0,
              page: res.data.pagination.page || 1,
              limit: res.data.pagination.limit || 10,
              totalPages: res.data.pagination.totalPages || 1,
            });
          }
        } else if (Array.isArray(res.data)) {
          setPermissions(res.data);
        } else {
          setPermissions([]);
        }
      } else {
        setPermissions([]);
      }
    } catch (error) {
      console.error("Load permissions error:", error);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get permission by id
  const loadPermissionById = useCallback(async (id) => {
    try {
      setLoading(true);
      const res = await getPermissionById(id);
      return res?.data || null;
    } catch (error) {
      console.error("Load permission by id error:", error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create permission
  const create = useCallback(async (data) => {
    try {
      setLoading(true);
      const res = await createPermission(data);
      return res;
    } catch (error) {
      console.error("Create permission error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update permission
  const update = useCallback(async (id, data) => {
    try {
      setLoading(true);
      const res = await updatePermission(id, data);
      return res;
    } catch (error) {
      console.error("Update permission error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete permission
  const remove = useCallback(async (id) => {
    try {
      setLoading(true);
      const res = await deletePermission(id);
      return res;
    } catch (error) {
      console.error("Delete permission error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Load permissions by role
  const loadRolePermissions = useCallback(async (roleId) => {
    try {
      setLoading(true);
      const res = await getRolePermissions(roleId);
      setRolePermissions(res?.data || []);
      return res;
    } catch (error) {
      console.error("Load role permissions error:", error);
      setRolePermissions([]);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Assign permissions to role
  const assignPermissions = useCallback(async (roleId, permissionIds) => {
    try {
      setLoading(true);
      const res = await assignRolePermissions(roleId, permissionIds);
      return res;
    } catch (error) {
      console.error("Assign permissions error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Remove permission from role
  const removePermission = useCallback(async (roleId, permissionId) => {
    try {
      setLoading(true);
      const res = await removeRolePermission(roleId, permissionId);
      return res;
    } catch (error) {
      console.error("Remove permission error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    permissions,
    rolePermissions,
    loading,
    pagination,
    loadPermissions,
    loadPermissionById,
    create,
    update,
    remove,
    loadRolePermissions,
    assignPermissions,
    removePermission,
  };
};

export default usePermission;