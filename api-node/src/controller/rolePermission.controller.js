const rolePermissionService = require("../services/rolePermission.service");
const asyncHandler = require("../middleware/asyncHandler");

exports.getPermissionsByRole = asyncHandler(async (req, res) => {
  const data = await rolePermissionService.getPermissionsByRole(req.params.id);

  res.json({
    success: true,

    message: "Get role permissions successfully",

    data,
  });
});


exports.assignPermissions = asyncHandler(async (req, res) => {
  const data = await rolePermissionService.assignPermissions(
    req.params.id,
    req.body.permissions,
    req.user,
  );

  res.json({
    success: true,

    message: "Assign permissions successfully",

    data,
  });
});


exports.removePermission = asyncHandler(async (req, res) => {
  await rolePermissionService.removePermission(
    req.params.id,
    req.params.permission_id,
  );

  res.json({
    success: true,

    message: "Remove permission successfully",
  });
});
