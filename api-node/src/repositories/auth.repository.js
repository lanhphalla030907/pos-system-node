const { db } = require("../util/helper");

//  GET ALL USERS 
exports.getList = async () => {
  const sql = `
    SELECT
      u.id,
      u.name,
      u.username,
      u.is_active,
      u.update_at,
      r.name AS role_name,
      u.create_at,
      cb.name AS create_by_name
    FROM user u
    INNER JOIN role r
      ON u.role_id = r.id
    LEFT JOIN user cb
      ON u.create_by = cb.id
    ORDER BY u.id DESC
  `;

  const [rows] = await db.query(sql);

  return rows;
};

//  CREATE USER 
exports.create = async (data) => {
  const sql = `
    INSERT INTO user
    (
      role_id,
      name,
      username,
      password,
      is_active,
      create_by
    )
    VALUES
    (
      :role_id,
      :name,
      :username,
      :password,
      :is_active,
      :create_by
    )
  `;

  const [result] = await db.query(sql, data);

  return result.insertId;
};

//  FIND USERNAME 
exports.findByUsername = async (username) => {
  const sql = `
    SELECT *
    FROM user
    WHERE username = :username
  `;

  const [rows] = await db.query(sql, {
    username,
  });

  return rows[0];
};

//  FIND BY ID 
exports.findById = async (id) => {
  const sql = `
    SELECT
      id,
      role_id,
      name,
      username,
      is_active,
      create_by
    FROM user
    WHERE id = :id
  `;

  const [rows] = await db.query(sql, {
    id,
  });

  return rows[0];
};

//  UPDATE STATUS 
exports.updateStatus = async (id, is_active) => {
  const sql = `
    UPDATE user
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