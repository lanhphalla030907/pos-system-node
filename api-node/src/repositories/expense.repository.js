const { db } = require("../util/helper");

// Get all expenses
exports.getAll = async (query) => {
  let sql = `
        SELECT 
            e.id,
            e.ref_no,
            e.name,
            e.amount,
            e.remark,
            e.expense_date,
            et.name AS expense_type_name,
            e.create_at
        FROM expense e
        INNER JOIN expense_type et
            ON e.expense_type_id = et.id
        WHERE 1 = 1
    `;

  const params = [];

  // Search
  if (query?.search) {
    sql += `
        AND (
            e.name LIKE ?
            OR e.ref_no LIKE ?
        )
    `;
    params.push(`%${query.search}%`, `%${query.search}%`);
  }

  // Filter by expense type
  if (query?.expense_type_id) {
    sql += `
        AND e.expense_type_id = ?
    `;
    params.push(query.expense_type_id);
  }

  // Filter by date from
  if (query?.date_from) {
    sql += `
        AND e.expense_date >= ?
    `;
    params.push(query.date_from);
  }

  // Filter by date to
  if (query?.date_to) {
    sql += `
        AND e.expense_date <= ?
    `;
    params.push(query.date_to);
  }

  sql += `
        ORDER BY e.id DESC
    `;

  const [rows] = await db.query(sql, params);

  return rows;
};

// Get by id
exports.getById = async (id) => {
  const sql = `
        SELECT
            e.*,
            et.name AS expense_type_name
        FROM expense e
        INNER JOIN expense_type et
            ON e.expense_type_id = et.id
        WHERE e.id = ?
    `;

  const [rows] = await db.query(sql, [id]);

  return rows[0];
};

// Generate ref no
exports.generateRefNo = async () => {
  const sql = `
        SELECT COUNT(id) AS total
        FROM expense
    `;

  const [rows] = await db.query(sql);

  let number = rows[0].total + 1;

  return "EXP-" + String(number).padStart(6, "0");
};

// Create
exports.create = async (data) => {
  const ref_no = await exports.generateRefNo();

  const sql = `
        INSERT INTO expense
        (
            expense_type_id,
            ref_no,
            name,
            amount,
            remark,
            expense_date,
            create_by
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

  const [result] = await db.query(sql, [
    data.expense_type_id,
    ref_no,
    data.name,
    data.amount,
    data.remark,
    data.expense_date,
    data.create_by,
  ]);

  return {
    id: result.insertId,
    ref_no,
  };
};

// Update
exports.update = async (id, data) => {
  const sql = `
        UPDATE expense
        SET
            expense_type_id = ?,
            name = ?,
            amount = ?,
            remark = ?,
            expense_date = ?
        WHERE id = ?
    `;

  const [result] = await db.query(sql, [
    data.expense_type_id,
    data.name,
    data.amount,
    data.remark,
    data.expense_date,
    id,
  ]);

  return result.affectedRows;
};

// Delete
exports.remove = async (id) => {
  const sql = `
        DELETE FROM expense
        WHERE id = ?
    `;

  const [result] = await db.query(sql, [id]);

  return result.affectedRows;
};

// Summary
exports.getSummary = async (query) => {
  let sql = `
        SELECT
            COUNT(*) AS total_transaction,
            IFNULL(SUM(amount), 0) AS total_amount,
            COUNT(DISTINCT expense_type_id) AS total_expense_type
        FROM expense
        WHERE 1 = 1
    `;

  const params = [];

  if (query?.expense_type_id) {
    sql += ` AND expense_type_id = ?`;
    params.push(query.expense_type_id);
  }

  if (query?.search) {
    sql += ` AND (name LIKE ? OR ref_no LIKE ?)`;
    params.push(`%${query.search}%`, `%${query.search}%`);
  }

  if (query?.date_from) {
    sql += ` AND expense_date >= ?`;
    params.push(query.date_from);
  }
  if (query?.date_to) {
    sql += ` AND expense_date <= ?`;
    params.push(query.date_to);
  }
  const [rows] = await db.query(sql, params);
  return rows[0];
};
exports.getChart = async (query) => {
  let sql = `
    SELECT
      MONTH(expense_date) AS month,
      DATE_FORMAT(expense_date, '%b') AS month_name,
      SUM(amount) AS total
    FROM expense
    WHERE YEAR(expense_date) = ?
    GROUP BY MONTH(expense_date)
    ORDER BY MONTH(expense_date)
  `;
  const params = [query.year || new Date().getFullYear()];
  const [rows] = await db.query(sql, params);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return months.map((month, index) => {
    const found = rows.find((item) => item.month === index + 1);
    return {
      month: index + 1,
      month_name: month,
      total: found ? Number(found.total) : 0,
    };
  });
};
