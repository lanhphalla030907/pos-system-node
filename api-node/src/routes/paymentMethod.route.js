const { validate_token } = require("../controller/auth.controller");
const { getAll, create, getById, update, updateStatus } = require("../controller/paymentMethod.controller");

module.exports = (app) => {
  app.get("/api/payment-method", validate_token(), getAll);
  app.post("/api/payment-method", validate_token(), create);
  app.get("/api/payment-method/:id", validate_token(), getById);
  app.put("/api/payment-method/:id", validate_token(), update);
    app.put("/api/payment-method/:id/status", validate_token(), updateStatus);
};
