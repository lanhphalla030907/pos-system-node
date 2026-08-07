const expenseService = require("../services/expense.service");
const asyncHandler = require("../middleware/asyncHandler");
// Get all
exports.getAll = asyncHandler(async (req, res) => {
  const data = await expenseService.getAll(req.query);
  res.json({
    success: true,
    message: "Get expenses successfully",
    data,
  });
});
// Get by id
exports.getById = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const data = await expenseService.getById(id);
  if (!data) {
    return res.status(404).json({
      success: false,
      message: "Expense not found",
    });
  }
  res.json({
    success: true,
    message: "Get expense successfully",
    data,
  });
});
// Create
exports.create = asyncHandler(async (req, res) => {
  const data = {
    ...req.body,
    create_by: req.user.id,
  };
  const result = await expenseService.create(data);
  res.status(201).json({
    success: true,
    message: "Create expense successfully",
    data: result,
  });
});
// Update
exports.update = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const result = await expenseService.update(id, req.body);
  if (!result) {
    return res.status(404).json({
      success: false,
      message: "Expense not found",
    });
  }
  res.json({
    success: true,
    message: "Update expense successfully",
  });
});
// Delete
exports.remove = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const result = await expenseService.remove(id);
  if (!result) {
    return res.status(404).json({
      success: false,
      message: "Expense not found",
    });
  }
  res.json({
    success: true,
    message: "Delete expense successfully",
  });
});
exports.getSummary = asyncHandler(async (req, res) => {
    const data = await expenseService.getSummary(req.query);
    res.json({
        success: true,
        message: "Get expense summary successfully",
        data
    });
});
exports.getChart = asyncHandler(async (req, res) => {
  const data = await expenseService.getChart(req.query);
  res.json({
    success: true,
    message: "Get expense chart successfully",
    data,
  });

});