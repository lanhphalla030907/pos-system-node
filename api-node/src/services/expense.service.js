const expenseRepository = require("../repositories/expense.repository");
exports.getAll = async (query) => {
  return await expenseRepository.getAll(query);
};
exports.getById = async (id) => {
  return await expenseRepository.getById(id);
};
exports.create = async (data) => {
  return await expenseRepository.create(data);
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