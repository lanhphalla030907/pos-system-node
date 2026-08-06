// hooks/useRole.js
import { useState } from "react";
import {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
} from "../api/roleAPi";

const useRole = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  // Get All Roles
  const loadRoles = async (filter = {}) => {
    try {
      setLoading(true);
      const res = await getRoles(filter);

      let rolesData = [];
      let paginationData = {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };

      // Handle different response structures
      if (res?.data?.data?.data && Array.isArray(res.data.data.data)) {
        rolesData = res.data.data.data;
        if (res.data.data.pagination) {
          paginationData = res.data.data.pagination;
        }
      } else if (res?.data?.data && Array.isArray(res.data.data)) {
        rolesData = res.data.data;
        if (res.data.pagination) {
          paginationData = res.data.pagination;
        }
      } else if (res?.data && Array.isArray(res.data)) {
        rolesData = res.data;
      } else if (res && Array.isArray(res)) {
        rolesData = res;
      } else if (res?.data?.success && res?.data?.data) {
        const responseData = res.data.data;
        if (responseData.data && Array.isArray(responseData.data)) {
          rolesData = responseData.data;
          if (responseData.pagination) {
            paginationData = responseData.pagination;
          }
        } else if (Array.isArray(responseData)) {
          rolesData = responseData;
        }
      }

      setRoles(rolesData);
      setPagination(paginationData);

      return res;
    } catch (error) {
      console.error("Get roles error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get Role Detail
  const loadRoleById = async (id) => {
    try {
      const res = await getRoleById(id);

      if (res?.data?.data) {
        return res.data.data;
      } else if (res?.data) {
        return res.data;
      }
      return res;
    } catch (error) {
      console.error("Get role detail error:", error);
      throw error;
    }
  };

  // Create Role
  const addRole = async (data) => {
    try {
      setLoading(true);
      const res = await createRole(data);
      return res;
    } catch (error) {
      console.error("Create role error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update Role
  const editRole = async (id, data) => {
    try {
      setLoading(true);
      const res = await updateRole(id, data);
      return res;
    } catch (error) {
      console.error("Update role error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Delete Role
  const removeRole = async (id) => {
    try {
      setLoading(true);
      const res = await deleteRole(id);
      return res;
    } catch (error) {
      console.error("Delete role error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    roles,
    loading,
    pagination,
    loadRoles,
    loadRoleById,
    addRole,
    editRole,
    removeRole,
  };
};

export default useRole;
