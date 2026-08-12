const { db } = require("../util/helper");


// GET ALL
exports.getAll = async () => {
  const sql = `
    SELECT
      id,
      name,
      type,
      is_active,
      create_by,
      create_at,
      update_at
    FROM payment_method
    ORDER BY id DESC
  `;

  const [rows] = await db.query(sql);
  return rows;
};

// GET BY ID
exports.getById = async (id) => {
  const sql = `
    SELECT
      id,
      name,
      type,
      is_active,
      create_by,
      create_at,
      update_at
    FROM payment_method
    WHERE id = ?
  `;

  const [rows] = await db.query(sql, [id]);
  return rows[0];
};

// CREATE
exports.create = async (data) => {
  const sql = `
    INSERT INTO payment_method
    (name, type, is_active, create_by)
    VALUES (?, ?, ?, ?)
  `;

  const [result] = await db.query(sql, [
    data.name,
    data.type,
    data.is_active ?? 1,
    data.create_by || null,
  ]);

  return result.insertId;
};

// UPDATE
exports.update = async (id, data) => {
  const sql = `
    UPDATE payment_method
    SET
      name = ?,
      type = ?,
      update_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  const [result] = await db.query(sql, [
    data.name,
    data.type,
    id,
  ]);

  return result.affectedRows;
};

// UPDATE STATUS
exports.updateStatus = async (id, is_active) => {
  const sql = `
    UPDATE payment_method
    SET
      is_active = ?,
      update_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  const [result] = await db.query(sql, [
    is_active,
    id,
  ]);

  return result.affectedRows;
};