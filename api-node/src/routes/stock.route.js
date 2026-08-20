const { getLowStock, testAlert, getStockMovement, getHistory, getInventoryValue } = require("../controller/stcok.controller");
const { validate_token } = require("../controller/auth.controller");

module.exports = (app) => {
  app.get("/api/low-stock", validate_token(), getLowStock);
  app.get("/api/test-alert", validate_token(), testAlert);
  app.get("/api/stock-movement", validate_token(), getStockMovement);
  app.get("/api/stock/history", validate_token(), getHistory);
  app.get("/api/stock/value", validate_token(), getInventoryValue);
};
