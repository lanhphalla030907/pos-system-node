// api/expenseApi.js
import { request } from "../util/helper";

// Get Expenses
export const getExpenses = async (filter = {}) => {
  const params = new URLSearchParams();

  Object.keys(filter).forEach((key) => {
    if (filter[key] !== "" && filter[key] !== undefined) {
      params.append(key, filter[key]);
    }
  });

  return await request(`expense?${params.toString()}`, "get");
};

// Get Expense Summary
export const getExpenseSummary = async (filter = {}) => {
  const params = new URLSearchParams();

  Object.keys(filter).forEach((key) => {
    if (filter[key] !== "" && filter[key] !== undefined) {
      params.append(key, filter[key]);
    }
  });

  return await request(`expense/summary?${params.toString()}`, "get");
};

// Get Expense Chart Data
export const getExpenseChart = async (filter = {}) => {
  const params = new URLSearchParams();

  Object.keys(filter).forEach((key) => {
    if (filter[key] !== "" && filter[key] !== undefined) {
      params.append(key, filter[key]);
    }
  });

  return await request(`expense/chart?${params.toString()}`, "get");
};

// Create Expense
export const createExpense = async (data) => {
  return await request("expense", "post", data);
};

// Update Expense
export const updateExpense = async (id, data) => {
  return await request(`expense/${id}`, "put", data);
};

// Delete Expense
export const deleteExpense = async (id) => {
  return await request(`expense/${id}`, "delete");
};
