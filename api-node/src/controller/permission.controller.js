const permissionService = require("../services/permission.service");
const asyncHandler = require("../middleware/asyncHandler");

exports.getAll = asyncHandler(async (req, res) => {
  const data = await permissionService.getAll(req.query);
  res.json({
    success: true,
    message: "Get permissions successfully",
    data,
  });
});
exports.getById = asyncHandler(async (req, res) => {
  const data = await permissionService.getById(req.params.id);
  res.json({
    success: true,
    message: "Get permission successfully",
    data,
  });
});

exports.create = asyncHandler(async (req, res) => {
  const data = await permissionService.create(req.body, req.user);
  res.status(201).json({
    success: true,
    message: "Permission created successfully",
    data,
  });
});

exports.update = asyncHandler(async (req, res) => {
  const data = await permissionService.update(req.params.id, req.body);
  res.json({
    success: true,
    message: "Permission updated successfully",
    data,
  });
});

exports.remove = asyncHandler(async (req, res) => {
  await permissionService.remove(req.params.id);
  res.json({
    success: true,
    message: "Permission deleted successfully",
  });
});
