import { request } from "../util/helper";
// Get Expense Types
export const getExpenseTypes = async (filter = {}) => {
  const params = new URLSearchParams();
  Object.keys(filter).forEach((key) => {
    if (filter[key] !== "" && filter[key] !== undefined) {
      params.append(key, filter[key]);
    }
  });
  return await request(`expense-type?${params.toString()}`, "get");
};
// Create Expense Type
export const createExpenseType = async (data) => {
  return await request("expense-type", "post", data);
};
// Update Expense Type
export const updateExpenseType = async (id, data) => {
  return await request(`expense-type/${id}`, "put", data);
};
// Delete Expense Type
export const deleteExpenseType = async (id) => {
  return await request(`expense-type/${id}`, "delete");
};
