const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  createNotification,
} = require("../controller/notification.controller");
const { validate_token } = require("../controller/auth.controller");

module.exports = (app) => {
  app.get("/api/notifications/unread-count", validate_token(), getUnreadCount);
  app.get("/api/notifications", validate_token(), getNotifications);
  app.post("/api/notifications", validate_token(), createNotification);
  app.put("/api/notifications/read-all", validate_token(), markAllAsRead);
  app.put("/api/notifications/:id/read", validate_token(), markAsRead);
  app.delete("/api/notifications/all", validate_token(), deleteAllNotifications);
  app.delete("/api/notifications/:id", validate_token(), deleteNotification);
};
