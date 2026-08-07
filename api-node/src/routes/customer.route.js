const { validate_token } = require("../controller/auth.controller");
const {
  getCustomer,
  create,
  update,        
  updateMembership,
  updateDiscount,
  delete: deleteCustomer,  
} = require("../controller/customer.controller");

module.exports = (app) => {
  app.get("/api/customer", validate_token(), getCustomer);
  app.post("/api/customer", validate_token(), create);
  app.put("/api/customer/:id", validate_token(), update);  
  app.put("/api/customer/:id/membership", validate_token(), updateMembership);
  app.put("/api/customer/:id/discount", validate_token(), updateDiscount);
  app.delete("/api/customer/:id", validate_token(), deleteCustomer);  
};