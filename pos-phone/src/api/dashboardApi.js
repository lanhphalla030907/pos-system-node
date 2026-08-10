// api/dashboardApi.js
import { request } from "../util/helper";

// Get dashboard summary
export const getDashboardSummary = async () => {
  return await request("dashboard/summary", "get");
};

// Get sales chart data
export const getSalesChart = async () => {
  return await request("dashboard/sales-chart", "get");
};

// Get profit chart data
export const getProfitChart = async () => {
  return await request("dashboard/profit-chart", "get");
};

// Get recent login activity
export const getRecentLoginActivity = async (limit = 10) => {
  return await request(`dashboard/recent-login?limit=${limit}`, "get");
};