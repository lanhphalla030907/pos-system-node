const rolePermissionRepository = require("../repositories/rolePermission.repository");
exports.checkPermission = (permissionCode) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }
      const userId = user.data.id;
      const permissions =
        await rolePermissionRepository.getUserPermissions(userId);
      const hasPermission = permissions.some(
        (item) => item.code === permissionCode,
      );
      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: "You don't have permission",
        });
      }
      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
};
