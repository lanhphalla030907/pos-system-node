
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