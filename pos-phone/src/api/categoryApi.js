import { request } from "../util/helper";

export const getActiveCategories = async () => {
  return await request("category?status=1", "get");
};