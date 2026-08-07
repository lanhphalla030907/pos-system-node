const { db } = require("../util/helper");

exports.getAll = async (filter = {}) => {
  const { search = "", type = "", page = 1, limit = 10 } = filter;

  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  const offset = (pageNumber - 1) * limitNumber;

  let whereClause = "WHERE 1=1";
  const queryParams = [];

  // Search
  if (search && search.trim() !== "") {
    whereClause += `
            AND (
                name LIKE ?
                OR tel LIKE ?
                OR email LIKE ?
                OR address LIKE ?
            )
        `;

    const keyword = `%${search}%`;
    queryParams.push(keyword, keyword, keyword, keyword);
  }

  // Filter by Type
  if (type) {
    whereClause += " AND type = ?";
    queryParams.push(type);
  }

  // Get Customer List
  const sql = `
        SELECT *
        FROM customer
        ${whereClause}
        ORDER BY id DESC
        LIMIT ? OFFSET ?
    `;

  const [rows] = await db.query(sql, [...queryParams, limitNumber, offset]);

  // Count Total (for Pagination)
  const countSql = `
        SELECT COUNT(*) AS total
        FROM customer
        ${whereClause}
    `;

  const [countRows] = await db.query(countSql, queryParams);
  const total = countRows[0].total;

  // Summary
  const summarySql = `
        SELECT
            COUNT(*) AS total,
            COUNT(CASE WHEN type = 'vip' THEN 1 END) AS vip,
            COUNT(CASE WHEN type = 'member' THEN 1 END) AS member,
            COUNT(CASE WHEN type = 'regular' THEN 1 END) AS regular
        FROM customer
    `;

  const [summaryRows] = await db.query(summarySql);

  return {
    list: rows,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages: Math.ceil(total / limitNumber),
    },
    summary: summaryRows[0],
  };
};
exports.create = async (data, user) => {
  // Check if phone number already exists
  if (data.tel && data.tel.trim() !== "") {
    const [existing] = await db.query(
      `
      SELECT id FROM customer WHERE tel = ?
      `,
      [data.tel],
    );

    if (existing.length > 0) {
      throw new Error(`Phone number "${data.tel}" already exists`);
    }
  }

  // Check if email already exists
  if (data.email && data.email.trim() !== "") {
    const [existing] = await db.query(
      `
      SELECT id FROM customer WHERE email = ?
      `,
      [data.email],
    );

    if (existing.length > 0) {
      throw new Error(`Email "${data.email}" already exists`);
    }
  }

  const sql = `
    INSERT INTO customer
    (
      name,
      tel,
      email,
      address,
      type,
      total_spent,
      discount,
      create_by
    )
    VALUES
    (
      :name,
      :tel,
      :email,
      :address,
      :type,
      0,
      :discount,
      :create_by
    )
  `;
  const [result] = await db.query(sql, {
    name: data.name,
    tel: data.tel || null,
    email: data.email || null,
    address: data.address || null,
    type: data.type || "regular",
    discount: data.discount || 0,
    create_by: user.id,
  });
  // Get created customer
  const [rows] = await db.query(
    `
      SELECT *
      FROM customer
      WHERE id = ?
    `,
    [result.insertId],
  );
  return rows[0];
};

// Get customer by id
exports.getById = async (id) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM customer
      WHERE id = ?
    `,
    [id],
  );

  return rows[0];
};

// Update total spent
exports.updateTotalSpent = async (id, amount) => {
  await db.query(
    `
      UPDATE customer
      SET total_spent = total_spent + ?
      WHERE id = ?
    `,
    [amount, id],
  );
};

// Update membership type
exports.updateType = async (id, type) => {
  await db.query(
    `
      UPDATE customer
      SET type = ?
      WHERE id = ?
    `,
    [type, id],
  );
};

exports.updateDiscount = async (id, discount) => {
  await db.query(
    `
    UPDATE customer
    SET discount = ?
    WHERE id = ?
    `,
    [discount, id],
  );
};

// ✅ NEW: Update customer with duplicate check
exports.update = async (id, data) => {
  // Check if phone number already exists for another customer
  if (data.tel && data.tel.trim() !== "") {
    const [existing] = await db.query(
      `
      SELECT id FROM customer WHERE tel = ? AND id != ?
      `,
      [data.tel, id],
    );

    if (existing.length > 0) {
      throw new Error(
        `Phone number "${data.tel}" already exists for another customer`,
      );
    }
  }

  // Check if email already exists for another customer
  if (data.email && data.email.trim() !== "") {
    const [existing] = await db.query(
      `
      SELECT id FROM customer WHERE email = ? AND id != ?
      `,
      [data.email, id],
    );

    if (existing.length > 0) {
      throw new Error(
        `Email "${data.email}" already exists for another customer`,
      );
    }
  }

  const sql = `
    UPDATE customer
    SET
      name = :name,
      tel = :tel,
      email = :email,
      address = :address,
      type = :type,
      discount = :discount
    WHERE id = :id
  `;

  await db.query(sql, {
    id: id,
    name: data.name,
    tel: data.tel || null,
    email: data.email || null,
    address: data.address || null,
    type: data.type || "regular",
    discount: data.discount || 0,
  });

  // Get updated customer
  return await exports.getById(id);
};

// Delete customer
exports.delete = async (id) => {
  await db.query(
    `
      DELETE FROM customer
      WHERE id = ?
    `,
    [id],
  );
};
