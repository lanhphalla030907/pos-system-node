const asyncHandler = require("../middleware/asyncHandler");
const notificationService = require("../services/notification.service");

exports.getNotifications = asyncHandler(async (req, res) => {
  const filters = {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 10,
    is_read: req.query.is_read,
    type: req.query.type,
  };
  const result = await notificationService.getNotifications(req.current_id, filters);
  res.json({
    success: true,
    message: "Get notifications successfully",
    data: result.data,
    pagination: result.pagination,
  });
});

exports.getUnreadCount = asyncHandler(async (req, res) => {
  const result = await notificationService.getUnreadCount(req.current_id);
  res.json({
    success: true,
    message: "Get unread count successfully",
    data: result,
  });
});

exports.markAsRead = asyncHandler(async (req, res) => {
  await notificationService.markAsRead(req.params.id, req.current_id);
  res.json({
    success: true,
    message: "Notification marked as read",
  });
});

exports.markAllAsRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markAllAsRead(req.current_id);
  res.json({
    success: true,
    message: "All notifications marked as read",
    data: result,
  });
});

exports.deleteNotification = asyncHandler(async (req, res) => {
  await notificationService.deleteNotification(req.params.id, req.current_id);
  res.json({
    success: true,
    message: "Notification deleted",
  });
});

exports.deleteAllNotifications = asyncHandler(async (req, res) => {
  const result = await notificationService.deleteAllNotifications(req.current_id);
  res.json({
    success: true,
    message: "All notifications deleted",
    data: result,
  });
});

exports.createNotification = asyncHandler(async (req, res) => {
  const { title, message, type } = req.body;
  const id = await notificationService.createNotification({
    user_id: req.current_id,
    title,
    message,
    type: type || "system",
  });
  res.status(201).json({
    success: true,
    message: "Notification created successfully",
    data: { id },
  });
});
