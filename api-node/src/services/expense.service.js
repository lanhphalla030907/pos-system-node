const expenseRepository = require("../repositories/expense.repository");
const notificationService = require("./notification.service");

exports.getAll = async (query) => {
  return await expenseRepository.getAll(query);
};
exports.getById = async (id) => {
  return await expenseRepository.getById(id);
};
exports.create = async (data) => {
  const result = await expenseRepository.create(data);

  try {
    await notificationService.notifyExpenseCreated({
      id: result,
      amount: data.amount,
    });
  } catch (error) {
    console.error("Expense notification failed:", error.message);
  }

  return result;
};
exports.update = async (id, data) => {
  return await expenseRepository.update(id, data);
};
exports.remove = async (id) => {
  return await expenseRepository.remove(id);
};
exports.getSummary = async (query) => {
    return await expenseRepository.getSummary(query);
};
exports.getChart = async (query) => {
  return await expenseRepository.getChart(query);
};