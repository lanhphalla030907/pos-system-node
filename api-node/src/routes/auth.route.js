const {
  register,
  login,
  getProfile,
  validate_token,
  getList,
  updateStatus,
} = require("../../src/controller/auth.controller");

module.exports = (app) => {
  // register
  app.get("/api/auth/getlist", getList);
  app.post("/api/auth/register", register);
  app.put("/api/user/:id/status", validate_token(), updateStatus);
  // login
  app.post("/api/auth/login", login);

  // profile
  app.get("/api/auth/profile", validate_token(), getProfile);
};
