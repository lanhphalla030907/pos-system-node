const { getLowStock, testAlert, getStockMovement } = require("../controller/stcok.controller");
module.exports = (app) => {
  // register
  app.get("/api/low-stock", getLowStock);
 app.get("/api/test-alert", testAlert);
  app.get("/api/stock-movement", getStockMovement);
};
