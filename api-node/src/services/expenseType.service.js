const repository = require("../repositories/expenseType.repository");

exports.getAll = async (query) => {
  return await repository.getAll(query);
};

exports.getById = async (id) => {
  return await repository.getById(id);
};

exports.create = async (data) => {
  return await repository.create(data);
};

exports.update = async (id, data) => {
  return await repository.update(id, data);
};

exports.remove = async (id) => {
  return await repository.remove(id);
};
