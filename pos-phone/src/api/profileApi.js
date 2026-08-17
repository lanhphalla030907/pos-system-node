import { request } from "../util/helper";

export const getProfile = async () => {
  return await request("auth/profile", "get");
};

export const changePassword = async (data) => {
  return await request("auth/change-password", "put", data);
};
