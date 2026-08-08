const { db } = require("../util/helper");

// CREATE PURCHASE
exports.create = async (connection, data, userId) => {
  const sql = `
        INSERT INTO purchase (
            purchase_no,
            supplier_id,
            total_amount,
            paid_amount,
            payment_method,
            shipping_cost,
            shipping_company,
            paid_date,
            remark,
            status,
            create_by
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

  const [result] = await connection.query(sql, [
    data.purchase_no,
    data.supplier_id,
    data.total_amount,
    data.paid_amount,
    data.payment_method,
    data.shipping_cost,
    data.shipping_company,
    data.paid_date,
    data.remark,
    data.status,
    userId,
  ]);

  return result.insertId;
};

// CREATE PURCHASE DETAIL
exports.createDetail = async (connection, data) => {
  const sql = `
        INSERT INTO purchase_detail (
            purchase_id,
            product_id,
            qty,
            cost,
            retail_price,
            discount,
            amount
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

  const [result] = await connection.query(sql, [
    data.purchase_id,
    data.product_id,
    data.qty,
    data.cost,
    data.retail_price,
    data.discount,
    data.amount,
  ]);

  return result.insertId;
};

// FIND SUPPLIER
exports.findSupplier = async (connection, supplierId) => {
  const [rows] = await connection.query(
    `
        SELECT id
        FROM suppiler
        WHERE id = ?
        LIMIT 1
        `,
    [supplierId],
  );

  return rows[0] || null;
};

// FIND PRODUCT
// FOR UPDATE prevents stock race condition
exports.findProduct = async (connection, productId) => {
  const [rows] = await connection.query(
    `
        SELECT id, name, qty, price
        FROM product
        WHERE id = ?
        LIMIT 1
        FOR UPDATE
        `,
    [productId],
  );

  return rows[0] || null;
};

// UPDATE STOCK
exports.updateStock = async (connection, productId, qty) => {
  const [result] = await connection.query(
    `
        UPDATE product
        SET qty = qty + ?
        WHERE id = ?
        `,
    [qty, productId],
  );

  return result.affectedRows;
};
// GET PURCHASES
exports.getAll = async (connection, filters) => {
  const { search, supplier_id, status, payment_method, page, limit } = filters;

  const offset = (page - 1) * limit;

  let where = "WHERE 1=1";
  const params = [];

  // Search purchase number
  if (search) {
    where += ` AND p.purchase_no LIKE ?`;
    params.push(`%${search}%`);
  }

  // Supplier filter
  if (supplier_id) {
    where += ` AND p.supplier_id = ?`;
    params.push(supplier_id);
  }

  // Status filter
  if (status) {
    where += ` AND p.status = ?`;
    params.push(status);
  }

  // Payment method filter
  if (payment_method) {
    where += ` AND p.payment_method = ?`;
    params.push(payment_method);
  }

  // Get total
  const countSql = `
        SELECT COUNT(*) AS total
        FROM purchase p
        ${where}
    `;

  const [countRows] = await connection.query(countSql, params);

  const total = countRows[0].total;

  // Get data
  const sql = `
        SELECT
            p.id,
            p.purchase_no,
            p.supplier_id,
            s.name AS supplier_name,
            p.total_amount,
            p.paid_amount,
            (p.total_amount - p.paid_amount) AS remaining,
            p.payment_method,
            p.shipping_cost,
            p.shipping_company,
            p.paid_date,
            p.remark,
            p.status,
            p.create_by,
            p.create_at
        FROM purchase p
        LEFT JOIN suppiler s
            ON s.id = p.supplier_id
        ${where}
        ORDER BY p.id DESC
        LIMIT ? OFFSET ?
    `;

  const [rows] = await connection.query(sql, [
    ...params,
    Number(limit),
    Number(offset),
  ]);

  return {
    rows,
    total,
  };
};
// GET PURCHASE BY ID
exports.findById = async (connection, purchaseId) => {
  const [rows] = await connection.query(
    `
        SELECT
            p.id,
            p.purchase_no,
            p.supplier_id,
            s.name AS supplier_name,
            p.total_amount,
            p.paid_amount,
            (p.total_amount - p.paid_amount) AS remaining,
            p.payment_method,
            p.shipping_cost,
            p.shipping_company,
            p.paid_date,
            p.remark,
            p.status,
            p.create_by,
            p.create_at
        FROM purchase p
        LEFT JOIN suppiler s
            ON s.id = p.supplier_id
        WHERE p.id = ?
        LIMIT 1
        `,
    [purchaseId],
  );

  return rows[0] || null;
};

// GET PURCHASE ITEMS
exports.findDetails = async (connection, purchaseId) => {
  const [rows] = await connection.query(
    `
        SELECT
            pd.id,
            pd.product_id,
            p.name AS product_name,
            p.barcode,
            pd.qty,
            pd.cost,
            pd.retail_price,
            pd.discount,
            pd.amount
        FROM purchase_detail pd
        INNER JOIN product p
            ON p.id = pd.product_id
        WHERE pd.purchase_id = ?
        ORDER BY pd.id ASC
        `,
    [purchaseId],
  );

  return rows;
};
// FIND PURCHASE FOR UPDATE
exports.findByIdForUpdate = async (connection, purchaseId) => {
  const [rows] = await connection.query(
    `
        SELECT *
        FROM purchase
        WHERE id = ?
        LIMIT 1
        FOR UPDATE
        `,
    [purchaseId],
  );

  return rows[0] || null;
};

// FIND PURCHASE DETAILS
exports.findDetails = async (connection, purchaseId) => {
  const [rows] = await connection.query(
    `
        SELECT
            id,
            purchase_id,
            product_id,
            qty,
            cost,
            retail_price,
            discount,
            amount
        FROM purchase_detail
        WHERE purchase_id = ?
        ORDER BY id ASC
        `,
    [purchaseId],
  );

  return rows;
};

// UPDATE PURCHASE
exports.update = async (connection, purchaseId, data) => {
  const sql = `
        UPDATE purchase
        SET
            supplier_id = ?,
            total_amount = ?,
            paid_amount = ?,
            payment_method = ?,
            shipping_cost = ?,
            shipping_company = ?,
            paid_date = ?,
            remark = ?,
            status = ?
        WHERE id = ?
    `;

  const [result] = await connection.query(sql, [
    data.supplier_id,
    data.total_amount,
    data.paid_amount,
    data.payment_method,
    data.shipping_cost,
    data.shipping_company,
    data.paid_date,
    data.remark,
    data.status,
    purchaseId,
  ]);

  return result.affectedRows;
};

// DELETE PURCHASE DETAILS
exports.deleteDetails = async (connection, purchaseId) => {
  const [result] = await connection.query(
    `
        DELETE FROM purchase_detail
        WHERE purchase_id = ?
        `,
    [purchaseId],
  );

  return result.affectedRows;
};
// GET PURCHASE SUMMARY
exports.getSummary = async (connection, filters) => {
  const { from, to } = filters;

  let where = `
        WHERE status != 'cancelled'
    `;

  const params = [];

  // Filter from date
  if (from) {
    where += ` AND create_at >= ?`;
    params.push(`${from} 00:00:00`);
  }

  // Filter to date
  if (to) {
    where += ` AND create_at <= ?`;
    params.push(`${to} 23:59:59`);
  }

  const sql = `
        SELECT
            COUNT(*) AS total_purchase,
            COALESCE(SUM(total_amount), 0) AS total_amount,
            COALESCE(SUM(paid_amount), 0) AS total_paid,
            COALESCE(
                SUM(total_amount - paid_amount),
                0
            ) AS total_remaining
        FROM purchase
        ${where}
    `;

  const [rows] = await connection.query(sql, params);

  return rows[0];
};
exports.getReport = async (connection, filters) => {
  const { type, from, to } = filters;
  const params = [];
  let where = `
        WHERE status != 'cancelled'
    `;
  if (from) {
    where += ` AND create_at >= ?`;
    params.push(`${from} 00:00:00`);
  }
  if (to) {
    where += ` AND create_at <= ?`;
    params.push(`${to} 23:59:59`);
  }
  let groupBy;
  let selectDate;
  if (type === "daily") {
    selectDate = `
            DATE(create_at) AS date
        `;
    groupBy = `
            DATE(create_at)
        `;
  }
  else if (type === "monthly") {
    selectDate = `
            DATE_FORMAT(create_at, '%Y-%m') AS month
        `;

    groupBy = `
            DATE_FORMAT(create_at, '%Y-%m')
        `;
  } else {
    throw new Error("Report type must be daily or monthly");
  }
  const sql = `
        SELECT
            ${selectDate},
            COUNT(*) AS total_purchase,
            COALESCE(
                SUM(total_amount),
                0
            ) AS total_amount,

            COALESCE(
                SUM(paid_amount),
                0
            ) AS total_paid,
            COALESCE(
                SUM(total_amount - paid_amount),
                0
            ) AS total_remaining
        FROM purchase
        ${where}
        GROUP BY ${groupBy}
        ORDER BY ${groupBy} ASC
    `;
  const [rows] = await connection.query(sql, params);
  return rows;
};
