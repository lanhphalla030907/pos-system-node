const { validate_token } = require("../controller/auth.controller");

const {
  getAll,
  getById,
  create,
  update,
  remove,
} = require("../controller/role.controller");

module.exports = (app) => {
  // Get all roles
  app.get("/api/role", validate_token(), getAll);

  // Get role by id
  app.get("/api/role/:id", validate_token(), getById);

  // Create role
  app.post("/api/role", validate_token(), create);

  // Update role
  app.put("/api/role/:id", validate_token(), update);

  // Delete role
  app.delete("/api/role/:id", validate_token(), remove);
};
