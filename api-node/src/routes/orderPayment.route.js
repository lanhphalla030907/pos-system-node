const { validate_token } = require("../controller/auth.controller");

const {
  getByOrderId,
  getById,
  create,
} = require("../controller/orderPayment.controller");

module.exports = (app) => {
  // Get all payments of an order
  app.get(
    "/api/order-payment/order/:orderId",
    validate_token(),
    getByOrderId
  );

  // Get payment by ID
  app.get(
    "/api/order-payment/:id",
    validate_token(),
    getById
  );

  // Create order payment
  app.post(
    "/api/order-payment",
    validate_token(),
    create
  );
};