const { db } = require("../util/helper");
exports.getAll = async (query) => {
  const { search = "", module = "", page = 1, limit = 10 } = query;
  const offset = (Number(page) - 1) * Number(limit);
  let whereClause = "WHERE 1=1";
  const params = [];

  // Search
  if (search && search.trim() !== "") {
    whereClause += `
      AND (
        p.name LIKE ?
        OR p.code LIKE ?
      )
    `;

    const keyword = `%${search.trim()}%`;

    params.push(keyword, keyword);
  }

  // Filter module
  if (module && module.trim() !== "") {
    whereClause += `
      AND p.module = ?
    `;

    params.push(module);
  }

  // Count
  const [countResult] = await db.query(
    `
    SELECT COUNT(*) AS total
    FROM permissions p
    ${whereClause}
    `,
    params,
  );

  // Data
  const sql = `
    SELECT
      p.id,
      p.name,
      p.code,
      p.module,
      p.description,
      p.create_by,
      p.create_at,
      p.update_at,
      u.name AS create_by_name
    FROM permissions p
    LEFT JOIN user u
      ON p.create_by = u.id
    ${whereClause}
    ORDER BY p.id DESC
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

exports.getById = async (id) => {
  const [rows] = await db.query(
    `
    SELECT
      p.id,
      p.name,
      p.code,
      p.module,
      p.description,
      p.create_by,
      p.create_at,
      p.update_at,
      u.name AS create_by_name

    FROM permissions p

    LEFT JOIN user u
      ON p.create_by = u.id

    WHERE p.id = ?
    `,
    [id],
  );

  return rows[0];
};
exports.existsByCode = async (code, excludeId = null) => {
  let sql = `
    SELECT id
    FROM permissions
    WHERE code = ?
  `;

  const params = [code];

  if (excludeId) {
    sql += `
      AND id <> ?
    `;

    params.push(excludeId);
  }

  const [rows] = await db.query(sql, params);

  return rows.length > 0;
};
exports.existsByName = async (name, excludeId = null) => {
  let sql = `
    SELECT id
    FROM permissions
    WHERE name = ?
  `;

  const params = [name];

  if (excludeId) {
    sql += `
      AND id <> ?
    `;

    params.push(excludeId);
  }

  const [rows] = await db.query(sql, params);

  return rows.length > 0;
};

exports.create = async (data) => {
  const [result] = await db.query(
    `
    INSERT INTO permissions
    (
      name,
      code,
      module,
      description,
      create_by
    )
    VALUES
    (
      ?, ?, ?, ?, ?
    )
    `,
    [
      data.name,
      data.code,
      data.module,
      data.description || null,
      data.create_by,
    ],
  );

  return result.insertId;
};


exports.update = async (id, data) => {
  const [result] = await db.query(
    `
    UPDATE permissions

    SET
      name = ?,
      code = ?,
      module = ?,
      description = ?

    WHERE id = ?

    `,
    [data.name, data.code, data.module, data.description || null, id],
  );

  return result.affectedRows;
};


exports.isPermissionInUse = async (id) => {
  const [rows] = await db.query(
    `
    SELECT COUNT(*) AS total
    FROM role_permission
    WHERE permission_id = ?

    `,
    [id],
  );

  return rows[0].total > 0;
};


exports.remove = async (id) => {
  const [result] = await db.query(
    `
    DELETE FROM permissions
    WHERE id = ?
    `,
    [id],
  );
  return result.affectedRows;
};
