const {
  register,
  login,
  getProfile,
  changePassword,
  validate_token,
  getList,
  updateStatus,
} = require("../../src/controller/auth.controller");
const { loginLimiter } = require("../middleware/rateLimit");

module.exports = (app) => {
  // register
  app.get("/api/auth/getlist",validate_token(), getList);
  app.post("/api/auth/register", register);
  app.put("/api/user/:id/status", validate_token(), updateStatus);
  // login
  app.post("/api/auth/login",loginLimiter, login);

  // profile
  app.get("/api/auth/profile", validate_token(), getProfile);
  app.put("/api/auth/change-password", validate_token(), changePassword);
};
