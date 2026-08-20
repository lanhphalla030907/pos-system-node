const { validate_token } = require("../controller/auth.controller");
const { checkPermission } = require("../middleware/checkPermission");
const {
  getAll,
  getById,
  create,
  update,
  remove,
} = require("../controller/permission.controller");
module.exports = (app) => {
  // Get all permissions
  app.get("/api/permission", validate_token(), getAll);
  // Get permission by id
  app.get("/api/permission/:id", validate_token(), getById);
  // Create permission
  app.post("/api/permission", validate_token(), checkPermission("permission.create"), create);
  // Update permission
  app.put("/api/permission/:id", validate_token(), checkPermission("permission.update"), update);
  // Delete permission
  app.delete("/api/permission/:id", validate_token(), checkPermission("permission.delete"), remove);
};
