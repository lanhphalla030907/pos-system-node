const { db } = require("../util/helper");
exports.getAll = async (query) => {
  const { search = "", page = 1, limit = 10 } = query;
  const offset = (Number(page) - 1) * Number(limit);
  let whereClause = "WHERE 1=1";
  const params = [];
  if (search && search.trim() !== "") {
    whereClause += `
      AND (
        name LIKE ?
        OR code LIKE ?
      )
    `;
    const keyword = `%${search.trim()}%`;
    params.push(keyword, keyword);
  }
  // count total records
  const [countResult] = await db.query(
    `
    SELECT COUNT(*) AS total
    FROM role
    ${whereClause}
    `,
    params,
  );

  // Get data
  const sql = `
   SELECT
    r.id,
    r.name,
    r.code,
    r.description,
    r.create_at,
    r.update_at,
    u.name AS create_by_name
    FROM role r
    LEFT JOIN user u
    ON r.create_by = u.id
    ${whereClause}
    ORDER BY id DESC
    LIMIT ? OFFSET ?
  `;

  const [rows] = await db.query(sql, [...params, Number(limit), offset]);

  return {
    data: rows,
    pagination: {
      total: countResult[0].total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(countResult[0].total / Number(limit)),
    },
  };
};

/**
 * Get role by id
 */
exports.getById = async (id) => {
  const [rows] = await db.query(
    `
    SELECT
      id,
      name,
      code,
      description,
      create_by,
      create_at,
      update_at
    FROM role
    WHERE id = ?
    `,
    [id],
  );

  return rows[0];
};

/**
 * Check duplicate name
 */
exports.existsByName = async (name, excludeId = null) => {
  let sql = `
    SELECT id
    FROM role
    WHERE name = ?
  `;

  const params = [name];

  if (excludeId) {
    sql += ` AND id <> ?`;
    params.push(excludeId);
  }

  const [rows] = await db.query(sql, params);

  return rows.length > 0;
};

/**
 * Check duplicate code
 */
exports.existsByCode = async (code, excludeId = null) => {
  let sql = `
    SELECT id
    FROM role
    WHERE code = ?
  `;

  const params = [code];

  if (excludeId) {
    sql += ` AND id <> ?`;
    params.push(excludeId);
  }

  const [rows] = await db.query(sql, params);

  return rows.length > 0;
};

/**
 * Create role
 */
exports.create = async (data) => {
  const [result] = await db.query(
    `
    INSERT INTO role
    (
      name,
      code,
      description,
      create_by
    )
    VALUES
    (
      ?, ?, ?, ?
    )
    `,
    [data.name, data.code, data.description || null, data.create_by],
  );

  return result.insertId;
};

/**
 * Update role
 */
exports.update = async (id, data) => {
  const [result] = await db.query(
    `
    UPDATE role
    SET
      name = ?,
      code = ?,
      description = ?
    WHERE id = ?
    `,
    [data.name, data.code, data.description || null, id],
  );

  return result.affectedRows;
};
/**
 * Check whether the role is assigned to any user
 */
exports.isRoleInUse = async (id) => {
  const [rows] = await db.query(
    `
    SELECT COUNT(*) AS total
    FROM user
    WHERE role_id = ?
    `,
    [id],
  );
  return rows[0].total > 0;
};
/**
 * Delete role
 */
exports.remove = async (id) => {
  const [result] = await db.query(
    `
    DELETE FROM role
    WHERE id = ?
    `,
    [id],
  );
  return result.affectedRows;
};
