const orderPaymentRepository = require("../repositories/orderPayment.repository");
const paymentMethodRepository = require("../repositories/paymentMethod.repository");
const orderRepository = require("../repositories/order.repository");

exports.getByOrderId = async (orderId) => {
  const order = await orderRepository.getById(orderId);

  if (!order) {
    throw new Error("Order not found");
  }

  return await orderPaymentRepository.getByOrderId(orderId);
};

exports.getById = async (id) => {
  const payment = await orderPaymentRepository.getById(id);

  if (!payment) {
    throw new Error("Order payment not found");
  }

  return payment;
};

exports.create = async (data) => {
  if (!data.order_id) {
    throw new Error("Order ID is required");
  }

  if (!data.payment_method_id) {
    throw new Error("Payment method is required");
  }

  if (!data.amount || Number(data.amount) <= 0) {
    throw new Error("Payment amount must be greater than 0");
  }

  // Check order
  const order = await orderRepository.getById(data.order_id);

  if (!order) {
    throw new Error("Order not found");
  }

  // Check payment method
  const paymentMethod = await paymentMethodRepository.getById(
    data.payment_method_id
  );

  if (!paymentMethod) {
    throw new Error("Payment method not found");
  }

  // Don't allow inactive payment method
  if (!paymentMethod.is_active) {
    throw new Error("Payment method is inactive");
  }

  const id = await orderPaymentRepository.create(data);

  return await orderPaymentRepository.getById(id);
};