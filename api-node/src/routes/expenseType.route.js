const { validate_token } = require("../controller/auth.controller");
const {
  getAll,
  getById,
  create,
  update,
  remove,
} = require("../controller/expenseType.controller");

module.exports = (app) => {
  app.get("/api/expense-type", validate_token(), getAll);
  app.get("/api/expense-type/:id", validate_token(), getById);
  app.post("/api/expense-type", validate_token(), create);
  app.put("/api/expense-type/:id", validate_token(), update);
  app.delete("/api/expense-type/:id", validate_token(), remove);
};
