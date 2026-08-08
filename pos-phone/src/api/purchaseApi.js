// api/purchaseApi.js
import { request } from "../util/helper";

// Get all purchases with filters
export const getPurchases = async (filter = {}) => {
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
  const url = queryString ? `purchase?${queryString}` : "purchase";

  return await request(url, "get");
};

// Get purchase by ID
export const getPurchaseById = async (id) => {
  return await request(`purchase/${id}`, "get");
};

// Create purchase
export const createPurchase = async (data) => {
  return await request("purchase", "post", data);
};

// Update purchase
export const updatePurchase = async (id, data) => {
  return await request(`purchase/${id}`, "put", data);
};

// Get purchase summary
export const getPurchaseSummary = async (filter = {}) => {
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
  const url = queryString ? `purchase/summary?${queryString}` : "purchase/summary";

  return await request(url, "get");
};

// Get purchase report
export const getPurchaseReport = async (filter = {}) => {
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
  const url = queryString ? `purchase/report?${queryString}` : "purchase/report";

  return await request(url, "get");
};