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
const { checkPermission } = require("../middleware/checkPermission");

module.exports = (app) => {
  // register - requires auth and user.create permission
  app.get("/api/auth/getlist", validate_token(), checkPermission("user.view"), getList);
  app.post("/api/auth/register", validate_token(), checkPermission("user.create"), register);
  app.put("/api/user/:id/status", validate_token(), checkPermission("user.update"), updateStatus);
  // login
  app.post("/api/auth/login", loginLimiter, login);

  // profile
  app.get("/api/auth/profile", validate_token(), getProfile);
  app.put("/api/auth/change-password", validate_token(), changePassword);
};
