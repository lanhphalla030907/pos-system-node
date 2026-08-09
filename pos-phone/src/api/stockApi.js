// api/stockApi.js
import { request } from "../util/helper";

// Get low stock products
export const getLowStockProducts = async () => {
  return await request("low-stock", "get");
};

// Get stock movement
export const getStockMovement = async (filter = {}) => {
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

  const queryString = params.toString();
  const url = queryString ? `stock-movement?${queryString}` : "stock-movement";

  return await request(url, "get");
};

// Get stock history
export const getStockHistory = async (filter = {}) => {
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

  const queryString = params.toString();
  const url = queryString ? `stock/history?${queryString}` : "stock/history";

  return await request(url, "get");
};

// Get inventory value
export const getInventoryValue = async () => {
  return await request("stock/value", "get");
};

// Test alert
export const testStockAlert = async () => {
  return await request("test-alert", "get");
};