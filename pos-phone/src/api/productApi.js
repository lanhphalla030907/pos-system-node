import { request } from "../util/helper";

//  (Get Products)
export const getProducts = async (filter = {}) => {
  const params = new URLSearchParams();
  Object.keys(filter).forEach((key) => {
    if (filter[key] !== "" && filter[key] !== undefined) {
      params.append(key, filter[key]);
    }
  });
  return await request(`product?${params.toString()}`, "get");
};

// (Create Product - get data like FormData)
export const createProduct = async (formData) => {
  return await request("product", "post", formData);
};

//  (Update Product - get data like FormData)
export const updateProduct = async (id, formData) => {
  return await request(`product/${id}`, "put", formData);
};
export const generateBarcode = async () => {
  return await request("product/generate-barcode", "get");
};
//  (Delete Product)
export const deleteProduct = async (id) => {
  return await request(`product/${id}`, "delete");
};
export const getTopSaleProducts = async (filter = {}) => {
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
  return await request(`product/top-sale?${params.toString()}`, "get");
};
