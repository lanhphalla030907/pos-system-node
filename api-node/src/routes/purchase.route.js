const { validate_token } = require("../controller/auth.controller");
const { create, getAll, getById, update, getSummary, getReport } = require("../controller/purchase.controller");


module.exports = (app) => {
  app.post("/api/purchase", validate_token(), create);
  app.get("/api/purchase", validate_token(), getAll);
   app.get("/api/purchase/report", validate_token(), getReport);
    app.get("/api/purchase/summary", validate_token(), getSummary);
   app.get("/api/purchase/:id", validate_token(), getById);
   app.put("/api/purchase/:id", validate_token(), update);
};
