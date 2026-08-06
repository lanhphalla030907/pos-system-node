import { request } from "../util/helper";

// Get all permissions
export const getPermissions = async (filter = {}) => {
  const params = new URLSearchParams();

  Object.keys(filter).forEach((key) => {
    if (
      filter[key] !== "" &&
      filter[key] !== undefined &&
      filter[key] !== null
    ) {
      params.append(key, filter[key]);
    }
  });

  return await request(`permission?${params.toString()}`, "get");
};

// Get permission by id
export const getPermissionById = async (id) => {
  return await request(`permission/${id}`, "get");
};

// Create permission
export const createPermission = async (data) => {
  return await request("permission", "post", data);
};

// Update permission
export const updatePermission = async (id, data) => {
  return await request(`permission/${id}`, "put", data);
};

// Delete permission
export const deletePermission = async (id) => {
  return await request(`permission/${id}`, "delete");
};
// Get permissions of a role
export const getRolePermissions = async (roleId) => {
  return await request(`role/${roleId}/permissions`, "get");
};

// Assign permissions to role
export const assignRolePermissions = async (roleId, permissions) => {
  return await request(`role/${roleId}/permissions`, "post", {
    permissions,
  });
};

// Remove permission from role
export const removeRolePermission = async (roleId, permissionId) => {
  return await request(`role/${roleId}/permissions/${permissionId}`, "delete");
};
