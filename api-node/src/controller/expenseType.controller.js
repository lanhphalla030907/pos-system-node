const expenseTypeService = require("../services/expenseType.service");
const asyncHandler = require("../middleware/asyncHandler");

// GET ALL
exports.getAll = asyncHandler(async (req, res) => {
  const data = await expenseTypeService.getAll(req.query);

  res.json({
    success: true,
    message: "Get expense types successfully",
    data,
  });
});

// GET BY ID
exports.getById = asyncHandler(async (req, res) => {
  const id = req.params.id;

  const data = await expenseTypeService.getById(id);

  if (!data) {
    return res.status(404).json({
      success: false,
      message: "Expense type not found",
    });
  }

  res.json({
    success: true,
    message: "Get expense type successfully",
    data,
  });
});

// CREATE
exports.create = asyncHandler(async (req, res) => {
  const data = req.body;

  const id = await expenseTypeService.create(data);

  res.status(201).json({
    success: true,
    message: "Create expense type successfully",
    data: {
      id,
    },
  });
});

// UPDATE
exports.update = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const data = req.body;

  const result = await expenseTypeService.update(id, data);

  if (!result) {
    return res.status(404).json({
      success: false,
      message: "Expense type not found",
    });
  }

  res.json({
    success: true,
    message: "Update expense type successfully",
  });
});

// DELETE
exports.remove = asyncHandler(async (req, res) => {
  const id = req.params.id;

  const result = await expenseTypeService.remove(id);

  if (!result) {
    return res.status(404).json({
      success: false,
      message: "Expense type not found",
    });
  }

  res.json({
    success: true,
    message: "Delete expense type successfully",
  });
});
