import { request } from "../util/helper";

export const createOrder = async (data) => {
  return await request("order", "post", data);
};

export const getOrderById = async (id) => {
  return await request(`order/${id}`, "get");
};
export const getOrders = async (filter = {}) => {
  const params = new URLSearchParams();
  if (filter.search && filter.search.trim() !== "") {
    params.append("search", filter.search.trim());
  }
  if (filter.page) {
    params.append("page", filter.page);
  }
  if (filter.limit) {
    params.append("limit", filter.limit);
  }
  const queryString = params.toString();
  const url = queryString ? `order?${queryString}` : "order";

  return await request(url, "get");
};
export const getSalesChart = async (filter = {}) => {
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
  return await request(`order/chart?${params.toString()}`, "get");
};
export const getTodaySummary = async () => {
  return await request(
    "order/today-summary",
    "get"
  );
};
export const getTodayOrders = async () => {
  return await request(
    "order/today",
    "get"
  );
};