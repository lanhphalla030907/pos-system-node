import { request } from "../util/helper";

export const getSuppliers = async (search = "") => {
  return await request(`supplier?search=${encodeURIComponent(search)}`, "get");
};

export const createSupplier = async (data) => {
  return await request("supplier", "post", data);
};
export const updateSupplier = async (id, data) => {
  return await request(
    `supplier/${id}`,
    "put",
    data
  );
};

// Delete Supplier
export const deleteSupplier = async (id) => {
  return await request(
    `supplier/${id}`,
    "delete"
  );
};