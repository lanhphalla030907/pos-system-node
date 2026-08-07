const { db } = require("../util/helper");
exports.getPermissionsByRole = async (role_id) => {
  const [rows] = await db.query(
    `
    SELECT
        p.id,
        p.name,
        p.code,
        p.module,
        p.description
    FROM role_permission rp
    INNER JOIN permissions p
        ON rp.permission_id = p.id
    WHERE rp.role_id = ?
    ORDER BY p.module, p.id
    `,
    [role_id],
  );
  return rows;
};

exports.exists = async (role_id, permission_id) => {
  const [rows] = await db.query(
    `
    SELECT id
    FROM role_permission
    WHERE role_id = ?
    AND permission_id = ?

    `,
    [role_id, permission_id],
  );
  return rows.length > 0;
};

exports.assign = async (role_id, permission_id, create_by) => {
  const [result] = await db.query(
    `
    INSERT INTO role_permission
    (
        role_id,
        permission_id,
        create_by
    )
    VALUES
    (
        ?,?,?
    )
    `,
    [role_id, permission_id, create_by],
  );
  return result.insertId;
};

exports.remove = async (role_id, permission_id) => {
  const [result] = await db.query(
    `
    DELETE FROM role_permission
    WHERE role_id = ?
    AND permission_id = ?
    `,
    [role_id, permission_id],
  );
  return result.affectedRows;
};

exports.removeAll = async (role_id) => {
  const [result] = await db.query(
    `
    DELETE FROM role_permission
    WHERE role_id = ?
    `,
    [role_id],
  );
  return result.affectedRows;
};
exports.getUserPermissions = async (user_id) => {
  const [rows] = await db.query(
    `
    SELECT
        p.id,
        p.name,
        p.code,
        p.module
    FROM user u
    INNER JOIN role r
        ON u.role_id = r.id
    INNER JOIN role_permission rp
        ON r.id = rp.role_id
    INNER JOIN permissions p
        ON rp.permission_id = p.id
    WHERE u.id = ?

    `,
    [user_id],
  );
  return rows;
};
