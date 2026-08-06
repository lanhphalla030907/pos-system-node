import { request } from "../util/helper";

// Get All Roles
export const getRoles = async (filter = {}) => {
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

  return await request(`role?${params.toString()}`, "get");
};

// Get Role By Id
export const getRoleById = async (id) => {
  return await request(`role/${id}`, "get");
};

// Create Role
export const createRole = async (data) => {
  return await request("role", "post", data);
};

// Update Role
export const updateRole = async (id, data) => {
  return await request(`role/${id}`, "put", data);
};

// Delete Role
export const deleteRole = async (id) => {
  return await request(`role/${id}`, "delete");
};
