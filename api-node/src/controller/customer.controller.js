const asyncHandler = require("../middleware/asyncHandler");
const customerService = require("../services/customer.service");
exports.getCustomer = asyncHandler(async (req, res) => {
  const filter = {
    search: req.query.search || "",
    type: req.query.type || "",
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 10,
  };
  const customer = await customerService.getCustomer(filter);
  res.json({
    success: true,
    message: "Get customers successfully",
    data: customer,
  });
});
exports.create = asyncHandler(async (req, res) => {
  const customer = await customerService.create(req.body, {
    id: req.current_id,
  });
  res.json({
    success: true,
    message: "Customer created successfully",
    data: customer,
  });
});
exports.update = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const customer = await customerService.update(id, req.body);
  res.json({
    success: true,
    message: "Customer updated successfully",
    data: customer,
  });
});
exports.updateMembership = asyncHandler(async (req, res) => {
  const result = await customerService.updateMembership(
    req.params.id,
    req.body.amount,
  );
  res.json({
    success: true,
    message: "Membership updated",
    data: result,
  });
});
exports.delete = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await customerService.delete(id);
  res.json({
    success: true,
    message: "Customer deleted successfully",
  });
});
exports.updateDiscount = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { discount } = req.body;
  await customerService.updateDiscount(id, discount);
  res.json({
    success: true,
    message: "Customer discount updated",
  });
});
