const { db } = require("../util/helper");

exports.getAll = async (userId, filters) => {
  const { page = 1, limit = 10, is_read, type } = filters;
  const offset = (page - 1) * limit;

  let whereClause = "WHERE user_id = ?";
  const params = [userId];

  if (is_read !== undefined && is_read !== "") {
    whereClause += " AND is_read = ?";
    params.push(Number(is_read));
  }

  if (type) {
    whereClause += " AND type = ?";
    params.push(type);
  }

  const countSql = `SELECT COUNT(*) AS total FROM notifications ${whereClause}`;
  const [countResult] = await db.query(countSql, params);
  const total = countResult[0]?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const dataSql = `
    SELECT id, user_id, title, message, type, reference_id, reference_type, is_read, created_at
    FROM notifications
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `;
  const [rows] = await db.query(dataSql, [...params, Number(limit), Number(offset)]);

  return {
    data: rows,
    pagination: {
      total,
      totalPages,
      currentPage: Number(page),
      limit: Number(limit),
    },
  };
};

exports.getUnreadCount = async (userId) => {
  const sql = `SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND is_read = 0`;
  const [rows] = await db.query(sql, [userId]);
  return rows[0]?.count || 0;
};

exports.getById = async (id) => {
  const sql = `SELECT * FROM notifications WHERE id = ?`;
  const [rows] = await db.query(sql, [id]);
  return rows[0] || null;
};

exports.create = async (data) => {
  const sql = `
    INSERT INTO notifications (user_id, title, message, type, reference_id, reference_type)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const [result] = await db.query(sql, [
    data.user_id,
    data.title,
    data.message,
    data.type,
    data.reference_id || null,
    data.reference_type || null,
  ]);
  return result.insertId;
};

exports.createBulk = async (notifications) => {
  if (!notifications || notifications.length === 0) return [];

  const sql = `
    INSERT INTO notifications (user_id, title, message, type, reference_id, reference_type)
    VALUES ?
  `;
  const values = notifications.map((n) => [
    n.user_id,
    n.title,
    n.message,
    n.type,
    n.reference_id || null,
    n.reference_type || null,
  ]);

  const [result] = await db.query(sql, [values]);
  return result;
};

exports.markAsRead = async (id, userId) => {
  const sql = `UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?`;
  const [result] = await db.query(sql, [id, userId]);
  return result.affectedRows;
};

exports.markAllAsRead = async (userId) => {
  const sql = `UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0`;
  const [result] = await db.query(sql, [userId]);
  return result.affectedRows;
};

exports.remove = async (id, userId) => {
  const sql = `DELETE FROM notifications WHERE id = ? AND user_id = ?`;
  const [result] = await db.query(sql, [id, userId]);
  return result.affectedRows;
};

exports.removeAll = async (userId) => {
  const sql = `DELETE FROM notifications WHERE user_id = ?`;
  const [result] = await db.query(sql, [userId]);
  return result.affectedRows;
};
