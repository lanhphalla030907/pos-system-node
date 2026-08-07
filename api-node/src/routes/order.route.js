const { validate_token } = require("../controller/auth.controller");
const {
  create,
  getAll,
  getById,
  getSalesChart,
  getTodaySummary,
  getTodayOrders,
} = require("../controller/order.controller");
module.exports = (app) => {
  app.post("/api/order", validate_token(), create);
  app.get("/api/order/today-summary", validate_token(), getTodaySummary);
  app.get("/api/order/today", validate_token(), getTodayOrders);
  app.get("/api/order/chart", validate_token(), getSalesChart);
  app.get("/api/order", validate_token(), getAll);
  app.get("/api/order/:id", validate_token(), getById);
};
