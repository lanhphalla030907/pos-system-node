const orderRepository = require("../repositories/order.repository");
const notificationService = require("./notification.service");

exports.create = async (data, user) => {
  const result = await orderRepository.create(data, user);

  try {
    await notificationService.notifyOrderCreated({
      id: result.id,
      order_no: result.order_no,
      total_amount: result.total_amount,
    });
  } catch (error) {
    console.error("Order notification failed:", error.message);
  }

  return result;
};
exports.getAll = async (filter) => {
  return await orderRepository.getAll(filter);
};
exports.getById = async (id) => {
  return await orderRepository.getById(id);
};
exports.getSalesChart = async (query) => {
  return await orderRepository.getSalesChart(query);
};
exports.getTodaySummary = async () => {
  return await orderRepository.getTodaySummary();
};
exports.getTodayOrders = async () => {
  return await orderRepository.getTodayOrders();
};