const { validate_token } = require("../controller/auth.controller");

const {
  getAll,
  getById,
  create,
  update,
  remove,
  getSummary,
  getChart,
} = require("../controller/expense.controller");

module.exports = (app) => {
  // Get all expenses
  app.get("/api/expense", validate_token(), getAll);
  app.get("/api/expense/chart", validate_token(), getChart);
  app.get("/api/expense/summary", validate_token(), getSummary);
  app.get("/api/expense/:id", validate_token(), getById);
  // Get expense by id
  app.get("/api/expense/:id", validate_token(), getById);
  // Create expense
  app.post("/api/expense", validate_token(), create);
  // Update expense
  app.put("/api/expense/:id", validate_token(), update);
  // Delete expense
  app.delete("/api/expense/:id", validate_token(), remove);
};
