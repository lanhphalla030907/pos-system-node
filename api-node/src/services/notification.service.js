const notificationRepository = require("../repositories/notification.repository");
const { db } = require("../util/helper");

exports.getNotifications = async (userId, filters) => {
  return await notificationRepository.getAll(userId, filters);
};

exports.getUnreadCount = async (userId) => {
  const count = await notificationRepository.getUnreadCount(userId);
  return { count };
};

exports.createNotification = async (data) => {
  if (!data.user_id || !data.title || !data.message || !data.type) {
    throw new Error("user_id, title, message, and type are required");
  }
  const id = await notificationRepository.create(data);
  return id;
};

exports.markAsRead = async (id, userId) => {
  const affected = await notificationRepository.markAsRead(id, userId);
  if (affected === 0) {
    throw new Error("Notification not found");
  }
  return true;
};

exports.markAllAsRead = async (userId) => {
  const affected = await notificationRepository.markAllAsRead(userId);
  return { updated: affected };
};

exports.deleteNotification = async (id, userId) => {
  const affected = await notificationRepository.remove(id, userId);
  if (affected === 0) {
    throw new Error("Notification not found");
  }
  return true;
};

exports.deleteAllNotifications = async (userId) => {
  const affected = await notificationRepository.removeAll(userId);
  return { deleted: affected };
};

const getAllUserIds = async () => {
  const sql = `SELECT id FROM user WHERE is_active = 1`;
  const [rows] = await db.query(sql);
  return rows.map((r) => r.id);
};

exports.notifyOrderCreated = async (order) => {
  try {
    const userIds = await getAllUserIds();
    if (userIds.length === 0) return;

    const notifications = userIds.map((userId) => ({
      user_id: userId,
      title: "New Order Created",
      message: `Order #${order.order_no} has been created. Total: $${Number(order.total_amount).toFixed(2)}`,
      type: "order",
      reference_id: order.id,
      reference_type: "orders",
    }));

    await notificationRepository.createBulk(notifications);
  } catch (error) {
    console.error("Order notification failed:", error.message);
  }
};

exports.notifyPurchaseCreated = async (purchase) => {
  try {
    const userIds = await getAllUserIds();
    if (userIds.length === 0) return;

    const notifications = userIds.map((userId) => ({
      user_id: userId,
      title: "New Purchase Recorded",
      message: `Purchase #${purchase.purchase_no} has been recorded. Total: $${Number(purchase.total_amount).toFixed(2)}`,
      type: "purchase",
      reference_id: purchase.id,
      reference_type: "purchase",
    }));

    await notificationRepository.createBulk(notifications);
  } catch (error) {
    console.error("Purchase notification failed:", error.message);
  }
};

exports.notifyExpenseCreated = async (expense) => {
  try {
    const userIds = await getAllUserIds();
    if (userIds.length === 0) return;

    const notifications = userIds.map((userId) => ({
      user_id: userId,
      title: "New Expense Added",
      message: `An expense of $${Number(expense.amount).toFixed(2)} has been recorded.`,
      type: "expense",
      reference_id: expense.id,
      reference_type: "expense",
    }));

    await notificationRepository.createBulk(notifications);
  } catch (error) {
    console.error("Expense notification failed:", error.message);
  }
};

exports.notifyLowStock = async (products) => {
  try {
    if (!products || products.length === 0) return;

    const userIds = await getAllUserIds();
    if (userIds.length === 0) return;

    const productList = products
      .slice(0, 5)
      .map((p) => `"${p.name}" (qty: ${p.qty})`)
      .join(", ");

    const suffix = products.length > 5
      ? ` and ${products.length - 5} more`
      : "";

    const notifications = userIds.map((userId) => ({
      user_id: userId,
      title: "Low Stock Alert",
      message: `${products.length} product(s) are running low: ${productList}${suffix}`,
      type: "stock",
      reference_id: null,
      reference_type: "product",
    }));

    await notificationRepository.createBulk(notifications);
  } catch (error) {
    console.error("Stock notification failed:", error.message);
  }
};

exports.notifyLoginEvent = async (data) => {
  try {
    if (!data.user_id || data.status !== "success") return;

    const notifications = await notificationRepository.create({
      user_id: data.user_id,
      title: "Login Alert",
      message: `Successful login from ${data.ip_address || "unknown IP"}`,
      type: "auth",
      reference_id: data.user_id,
      reference_type: "user",
    });
  } catch (error) {
    console.error("Login notification failed:", error.message);
  }
};
