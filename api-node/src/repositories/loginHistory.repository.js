
const { db } = require("../util/helper");
exports.create = async (data) => {
  const sql = `
    INSERT INTO login_history (
      user_id,
      action,
      status,
      ip_address,
      user_agent,
      message
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  const [result] = await db.query(sql, [
    data.user_id,
    data.action,
    data.status,
    data.ip_address,
    data.user_agent,
    data.message,
  ]);

  return result.insertId;
};
exports.getRecent = async (limit = 10) => {
  const sql = `
    SELECT
      lh.id,
      lh.user_id,
      u.username,
      lh.action,
      lh.status,
      lh.ip_address,
      lh.user_agent,
      lh.message,
      lh.create_at
    FROM login_history lh
    LEFT JOIN user u
      ON u.id = lh.user_id
    ORDER BY lh.create_at DESC
    LIMIT ?
  `;

  const [rows] = await db.query(sql, [Number(limit)]);

  return rows;
};