const { db } = require("../util/helper");

// Get All Employees
exports.getAll = async (query) => {
  let sql = `
    SELECT
    e.id,
    e.code,
    e.name,
    e.gender,
    e.phone,
    e.email,
    e.address,
    r.name AS role_name,
    e.salary,
    e.hire_date,
    e.status,
    e.image,
    u.username,
    e.create_at,
    cb.name AS create_by_name

FROM employee e

LEFT JOIN role r
ON e.role_id = r.id

LEFT JOIN user u
ON e.user_id = u.id

LEFT JOIN user cb
ON e.create_by = cb.id
WHERE 1=1
  `;

  const params = [];

  if (query?.search) {
    sql += `
      AND (
        e.name LIKE ?
        OR e.code LIKE ?
        OR e.phone LIKE ?
      )
    `;

    const keyword = `%${query.search}%`;

    params.push(keyword, keyword, keyword);
  }

  if (query?.status !== undefined && query.status !== "") {
    sql += `
      AND e.status = ?
    `;

    params.push(query.status);
  }

  if (query?.role_id) {
    sql += `
      AND e.role_id = ?
    `;

    params.push(query.role_id);
  }

  sql += `
    ORDER BY e.id DESC
  `;

  const [rows] = await db.query(sql, params);

  return rows;
};

// Get By ID
exports.getById = async (id) => {
  const [rows] = await db.query(
    `
    SELECT
      e.*,
      r.name AS role_name,
      cb.name AS create_by_name,
      u.username  
    FROM employee e
    LEFT JOIN role r ON e.role_id = r.id
    LEFT JOIN user cb ON e.create_by = cb.id
    LEFT JOIN user u ON e.user_id = u.id 
    WHERE e.id = ?
    `,
    [id],
  );

  return rows[0];
};

// Create
exports.create = async (data) => {
  const [result] = await db.query(
    `
    INSERT INTO employee
    (
      code,
      name,
      gender,
      dob,
      phone,
      email,
      address,
      role_id,
      salary,
      hire_date,
      status,
      image,
      user_id,
      create_by
    )
    VALUES
    (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `,
    [
      data.code,
      data.name,
      data.gender,
      data.dob,
      data.phone,
      data.email,
      data.address,
      data.role_id,
      data.salary,
      data.hire_date,
      data.status,
      data.image,
      data.user_id || null,
      data.create_by,
    ],
  );

  return result.insertId;
};

// Update

exports.update = async (id, data) => {
  const [result] = await db.query(
    `
    UPDATE employee
    SET
      name=?,
      gender=?,
      dob=?,
      phone=?,
      email=?,
      address=?,
      role_id=?,
      salary=?,
      hire_date=?,
      status=?,
      image=?,
      user_id=?
    WHERE id=?
    `,
    [
      data.name,
      data.gender,
      data.dob,
      data.phone,
      data.email,
      data.address,
      data.role_id,
      data.salary,
      data.hire_date,
      data.status,
      data.image,
      data.user_id || null,
      id,
    ],
  );

  return result.affectedRows;
};

// Delete

exports.remove = async (id) => {
  const [result] = await db.query(
    `
    DELETE FROM employee
    WHERE id=?
    `,
    [id],
  );

  return result.affectedRows;
};

// Update Status

exports.updateStatus = async (id, status) => {
  const [result] = await db.query(
    `
    UPDATE employee
    SET status=?
    WHERE id=?
    `,
    [status, id],
  );

  return result.affectedRows;
};
exports.checkUserAccount = async (employee_id) => {
  const [rows] = await db.query(
    `
    SELECT
      id,
      user_id,
      role_id,
      name
    FROM employee
    WHERE id = ?
    `,
    [employee_id],
  );

  return rows[0];
};
exports.assignUser = async (employee_id, user_id) => {
  const [result] = await db.query(
    `
    UPDATE employee
    SET user_id = ?
    WHERE id = ?
    `,
    [user_id, employee_id],
  );

  return result.affectedRows;
};
