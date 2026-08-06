import { request } from "../util/helper";

// Get Customer
export const getCustomer = async (filter = {}) => {
  const params = new URLSearchParams();

  Object.keys(filter).forEach((key) => {
    if (filter[key] !== "" && filter[key] !== undefined) {
      params.append(key, filter[key]);
    }
  });
  return await request(`customer?${params.toString()}`, "get");
};

// Create Customer
export const createCustomer = async (data) => {
  return await request("customer", "post", data);
};

// Update Customer
export const updateCustomer = async (id, data) => {
  return await request(`customer/${id}`, "put", data);
};

// Update Customer Discount
export const updateCustomerDiscount = async (id, discount) => {
  return await request(`customer/${id}/discount`, "put", { discount });
};

// Update Customer Membership
export const updateCustomerMembership = async (id, amount) => {
  return await request(`customer/${id}/membership`, "put", { amount });
};

// Delete Customer
export const deleteCustomer = async (id) => {
  return await request(`customer/${id}`, "delete");
};