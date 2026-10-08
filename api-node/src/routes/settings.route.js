const { validate_token } = require("../controller/auth.controller");
const { checkPermission } = require("../middleware/checkPermission");
const {
  getAll,
  update,
  uploadLogo,
} = require("../controller/settings.controller");
const upload = require("../middleware/upload.middleware");

module.exports = (app) => {
  app.get("/api/settings", validate_token(), getAll);
  app.put("/api/settings", validate_token(),update);
  app.post(
    "/api/settings/upload-logo",
    validate_token(),
   
    upload("settings").single("image"),
    uploadLogo,
  );
};
