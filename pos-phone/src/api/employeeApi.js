import { request } from "../util/helper";

export const getEmployees = async (filter = {}) => {
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

  return await request(`employee?${params.toString()}`, "get");
};

// Get employee by id
export const getEmployeeById = async (id) => {
  return await request(`employee/${id}`, "get");
};

// Create employee
export const createEmployee = async (data) => {
  return await request("employee", "post", data);
};

// Update employee
export const updateEmployee = async (id, data) => {
  return await request(`employee/${id}`, "put", data);
};

// Update status
export const updateEmployeeStatus = async (id, status) => {
  return await request(`employee/${id}/status`, "put", {
    status,
  });
};

// Delete employee
export const deleteEmployee = async (id) => {
  return await request(`employee/${id}`, "delete");
};
