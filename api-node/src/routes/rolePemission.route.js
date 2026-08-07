const { validate_token } = require("../controller/auth.controller");
const {
  getPermissionsByRole,
  assignPermissions,
  removePermission,
} = require("../controller/rolePermission.controller");
module.exports = (app) => {
  // Get permissions of role
  app.get("/api/role/:id/permissions", validate_token(), getPermissionsByRole);
  // Assign permissions to role
  app.post("/api/role/:id/permissions", validate_token(), assignPermissions);
  // Remove permission from role
  app.delete(
    "/api/role/:id/permissions/:permission_id",
    validate_token(),
    removePermission,
  );
};
