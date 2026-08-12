const { db } = require("../util/helper");
// GET BY ORDER ID
exports.getByOrderId = async (orderId) => {
  const sql = `
    SELECT
      op.id,
      op.order_id,
      op.payment_method_id,
      pm.name AS payment_method,
      pm.type,
      op.amount,
      op.reference_no,
      op.remark,
      op.create_by,
      op.create_at
    FROM order_payment op
    JOIN payment_method pm
      ON pm.id = op.payment_method_id
    WHERE op.order_id = ?
    ORDER BY op.id ASC
  `;

  const [rows] = await db.query(sql, [orderId]);

  return rows;
};

// GET BY ID
exports.getById = async (id) => {
  const sql = `
    SELECT
      op.id,
      op.order_id,
      op.payment_method_id,
      pm.name AS payment_method,
      pm.type,
      op.amount,
      op.reference_no,
      op.remark,
      op.create_by,
      op.create_at
    FROM order_payment op
    JOIN payment_method pm
      ON pm.id = op.payment_method_id
    WHERE op.id = ?
  `;

  const [rows] = await db.query(sql, [id]);

  return rows[0];
};

// CREATE
exports.create = async (data) => {
  const sql = `
    INSERT INTO order_payment
    (
      order_id,
      payment_method_id,
      amount,
      reference_no,
      remark,
      create_by
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  const [result] = await db.query(sql, [
    data.order_id,
    data.payment_method_id,
    data.amount,
    data.reference_no || null,
    data.remark || null,
    data.create_by || null,
  ]);

  return result.insertId;
};