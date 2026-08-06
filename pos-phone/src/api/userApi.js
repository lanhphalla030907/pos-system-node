import { request } from "../util/helper";
export const getUsers = async (filter = {}) => {
  const params = new URLSearchParams();  
  Object.keys(filter).forEach((key) => {
    if (filter[key] !== "" && filter[key] !== undefined && filter[key] !== null) {
      params.append(key, filter[key]);
    }
  });
  return await request(`auth/getlist?${params.toString()}`, "get");
};
export const updateUserStatus = async (id, is_active) => {
  return await request(`user/${id}/status`, "put", { is_active });
};
export const createUser = async (data) => {
  return await request("auth/register", "post", data);
};