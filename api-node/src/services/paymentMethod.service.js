const paymentMethodRepository = require("../repositories/paymentMethod.repository");

exports.getAll = async () => {
  return await paymentMethodRepository.getAll();
};

exports.getById = async (id) => {
  const data = await paymentMethodRepository.getById(id);

  if (!data) {
    throw new Error("Payment method not found");
  }

  return data;
};

exports.create = async (data) => {
  if (!data.name) {
    throw new Error("Payment method name is required");
  }

  if (!data.type) {
    throw new Error("Payment method type is required");
  }

  const id = await paymentMethodRepository.create(data);

  return await paymentMethodRepository.getById(id);
};

exports.update = async (id, data) => {
  const existing = await paymentMethodRepository.getById(id);

  if (!existing) {
    throw new Error("Payment method not found");
  }

  if (!data.name) {
    throw new Error("Payment method name is required");
  }

  if (!data.type) {
    throw new Error("Payment method type is required");
  }

  await paymentMethodRepository.update(id, data);

  return await paymentMethodRepository.getById(id);
};

exports.updateStatus = async (id, is_active) => {
  const existing = await paymentMethodRepository.getById(id);

  if (!existing) {
    throw new Error("Payment method not found");
  }

  await paymentMethodRepository.updateStatus(id, is_active);

  return await paymentMethodRepository.getById(id);
};