const roleService = require("../services/role.service");
const asyncHandler = require("../middleware/asyncHandler");


exports.getAll = asyncHandler(async (req, res) => {
  const data = await roleService.getAll(req.query);

  res.json({
    success: true,
    message: "Get roles successfully",
    data,
  });
});


exports.getById = asyncHandler(async (req, res) => {
  const data = await roleService.getById(req.params.id);

  res.json({
    success: true,
    message: "Get role successfully",
    data,
  });
});


exports.create = asyncHandler(async (req, res) => {
  const data = await roleService.create(req.body, req.user);

  res.status(201).json({
    success: true,
    message: "Role created successfully",
    data,
  });
});


exports.update = asyncHandler(async (req, res) => {
  const data = await roleService.update(req.params.id, req.body);

  res.json({
    success: true,
    message: "Role updated successfully",
    data,
  });
});


exports.remove = asyncHandler(async (req, res) => {
  await roleService.remove(req.params.id);

  res.json({
    success: true,
    message: "Role deleted successfully",
  });
});
