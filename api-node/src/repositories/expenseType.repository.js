const {db} = require("../util/helper");
// Get all expense types
exports.getAll = async (query) => {
  let sql = `
        SELECT
            id,
            name,
            code
        FROM expense_type
        WHERE 1=1
    `;
  const params = [];
  if (query?.search) {
    sql += ` AND (name LIKE ? OR code LIKE ?)`;
    params.push(`%${query.search}%`, `%${query.search}%`);
  }
  sql += ` ORDER BY id DESC`;
  const [rows] = await db.query(sql, params);
  return rows;
};
// Get expense type by id
exports.getById = async (id) => {
  const sql = `
        SELECT
            id,
            name,
            code
        FROM expense_type
        WHERE id = ?
    `;
  const [rows] = await db.query(sql, [id]);
  return rows[0];
};
// Create
exports.create = async (data) => {
  const sql = `
        INSERT INTO expense_type
        (
            name,
            code
        )
        VALUES
        (
            ?,
            ?
        )
    `;
  const [result] = await db.query(sql, [data.name, data.code]);
  return result.insertId;
};
// Update
exports.update = async (id, data) => {
  const sql = `
        UPDATE expense_type
        SET
            name = ?,
            code = ?
        WHERE id = ?
    `;

  const [result] = await db.query(sql, [data.name, data.code, id]);

  return result.affectedRows;
};
// Delete
exports.remove = async (id) => {
  const sql = `
        DELETE FROM expense_type
        WHERE id = ?
    `;

  const [result] = await db.query(sql, [id]);

  return result.affectedRows;
};
