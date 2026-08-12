const { validate_token } = require("../controller/auth.controller");
const {
  getSummary,
  getSalesChart,
  getProfitChart,
  getRecentLoginActivity,
  getPaymentSummary,
} = require("../controller/dashboard.controller");

module.exports = (app) => {
  app.get("/api/dashboard/summary", validate_token(), getSummary);
  app.get(
    "/api/dashboard/payment-summary",
    validate_token(),
    getPaymentSummary,
  );
  app.get("/api/dashboard/sales-chart", validate_token(), getSalesChart);
  app.get("/api/dashboard/profit-chart", validate_token(), getProfitChart);
  app.get(
    "/api/dashboard/recent-login",
    validate_token(),
    getRecentLoginActivity,
  );
};
