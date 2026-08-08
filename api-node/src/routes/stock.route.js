const { getLowStock, testAlert, getStockMovement, getHistory, getInventoryValue } = require("../controller/stcok.controller");
module.exports = (app) => {
  // register
  app.get("/api/low-stock", getLowStock);
 app.get("/api/test-alert", testAlert);
  app.get("/api/stock-movement", getStockMovement);
   app.get("/api/stock/history", getHistory);
    app.get("/api/stock/value", getInventoryValue);
};
