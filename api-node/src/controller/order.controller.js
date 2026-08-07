const asyncHandler = require("../middleware/asyncHandler");
const orderService = require("../services/order.service");
exports.create = asyncHandler(async (req, res) => {
  const result = await orderService.create(req.body, req.user);
  res.json({
    success: true,
    message: "Order created successfully",
    data: result,
  });
});
exports.getAll = asyncHandler(async (req, res) => {
  const filter = {
    search: req.query.search || "",
    page: parseInt(req.query.page) || 1,   
    limit: parseInt(req.query.limit) || 10,
  };
  const data = await orderService.getAll(filter);
  res.json({
    success: true,
    data,
  });
});
exports.getById = asyncHandler(async (req, res) => {
  const data = await orderService.getById(req.params.id);
  if (!data) {
    return res.status(404).json({
      success: false,
      message: "Order not found",
    });
  }
  res.json({
    success: true,
    data,
  });
});
exports.getSalesChart = asyncHandler(async (req, res) => {
  const data = await orderService.getSalesChart(req.query);
  res.json({
    success: true,
    message: "Get sales chart successfully",
    data,
  });
});
exports.getTodaySummary = asyncHandler(async (req, res) => {
  const data = await orderService.getTodaySummary();
  res.json({
    success: true,
    message: "Get today's sales summary successfully",
    data,
  });
});
exports.getTodayOrders = asyncHandler(async (req, res) => {
  const data = await orderService.getTodayOrders();
  res.json({
    success: true,
    message: "Get today's orders successfully",
    data
  });

});