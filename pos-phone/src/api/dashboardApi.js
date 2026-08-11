// api/dashboardApi.js
import { request } from "../util/helper";

// Get dashboard summary
export const getDashboardSummary = async () => {
  return await request("dashboard/summary", "get");
};

// Get sales chart data with period filter
export const getSalesChart = async (period = "monthly") => {
  return await request(`dashboard/sales-chart?period=${period}`, "get");
};

// Get profit chart data with period filter
export const getProfitChart = async (period = "monthly") => {
  return await request(`dashboard/profit-chart?period=${period}`, "get");
};

// Get recent login activity
export const getRecentLoginActivity = async (limit = 10) => {
  return await request(`dashboard/recent-login?limit=${limit}`, "get");
};