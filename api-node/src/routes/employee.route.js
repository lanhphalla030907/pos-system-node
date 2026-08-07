const { validate_token } = require("../controller/auth.controller");

const {
  getAll,
  getById,
  create,
  update,
  updateStatus,
  remove,
  createAccount,
} = require("../controller/employee.controller");
const upload = require("../middleware/upload.middleware");

module.exports = (app) => {
  // Get all employees
  app.get("/api/employee", validate_token(), getAll);

  // Get employee by id
  app.get("/api/employee/:id", validate_token(), getById);

  // Create employee
  app.post(
    "/api/employee",
    validate_token(),
    upload("employee").single("image"),
    create,
  );

  // Update employee
  app.put(
    "/api/employee/:id",
    validate_token(),
    upload("employee").single("image"),
    update,
  );
  app.post("/api/employee/:id/create-account", validate_token(), createAccount);
  // Update employee status
  app.put("/api/employee/:id/status", validate_token(), updateStatus);

  // Delete employee
  app.delete("/api/employee/:id", validate_token(), remove);
};
