const customerRepository = require("../repositories/customer.repository");
exports.getCustomer = async (filter) => {
  return await customerRepository.getAll(filter);
};
exports.create = async (data, user) => {
  const customer = await customerRepository.create(
    data,
    user
  );
  return customer;
};
exports.updateDiscount = async (id, discount) => {
  if(discount < 0 || discount > 100){
    throw new Error("Discount must be between 0 and 100");
  }
  return await customerRepository.updateDiscount(
    id,
    discount
  );
};
exports.update = async (id, data) => {
  if (data.discount !== undefined) {
    if (data.discount < 0 || data.discount > 100) {
      throw new Error("Discount must be between 0 and 100");
    }
  }
  
  return await customerRepository.update(id, data);
};
exports.updateMembership = async (customerId, orderAmount) => {
  await customerRepository.updateTotalSpent(customerId, orderAmount);
  // Get latest customer
  const customer = await customerRepository.getById(customerId);
  let type = "regular";
  if (customer.total_spent >= 500) {
    type = "vip";
  } else if (customer.total_spent >= 200) {
    type = "member";
  }
  await customerRepository.updateType(customerId, type);
  return customer;
};
