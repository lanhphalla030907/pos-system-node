// api/paymentMethodApi.js
import { request } from "../util/helper";

// Get all payment methods
export const getPaymentMethods = async () => {
  return await request("payment-method", "get");
};

// Get payment method by ID
export const getPaymentMethodById = async (id) => {
  return await request(`payment-method/${id}`, "get");
};

// Create payment method
export const createPaymentMethod = async (data) => {
  return await request("payment-method", "post", data);
};

// Update payment method
export const updatePaymentMethod = async (id, data) => {
  return await request(`payment-method/${id}`, "put", data);
};

// Update payment method status
export const updatePaymentMethodStatus = async (id, is_active) => {
  return await request(`payment-method/${id}/status`, "put", { is_active });
};