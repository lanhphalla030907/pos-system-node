const { db } = require("../util/helper");
const AppError = require("../util/AppError");
const getAllSuppliers = async (query) => {
  const { search } = query;
  let sql = ` SELECT * FROM suppiler`;
  const params = {};
  if (search?.trim()) {
    sql += `
      WHERE
        name LIKE :search
        OR code LIKE :search
        OR tel LIKE :search
        OR email LIKE :search
    `;
    params.search = `%${search.trim()}%`;
  }
  sql += ` ORDER BY id DESC`;
  const [list] = await db.query(sql, params);
  return list;
};

const createSupplier = async (data, user) => {
  const { name, code, tel, email, address, website, note } = data; //desturcturing when write this it equal const name=name.data, ......
  const [exist] = await db.query("SELECT id FROM suppiler WHERE code=?", [
    code,
  ]);
  if (exist.length > 0) {
    throw new AppError("Supplier code already exists", 409);
  }
  const sql = `
        INSERT INTO suppiler
        (
            name,
            code,
            tel,
            email,
            address,
            website,
            note,
            create_by
        )
        VALUES
        (
            :name,
            :code,
            :tel,
            :email,
            :address,
            :website,
            :note,
            :create_by
        )
    `;
  const [result] = await db.query(sql, {   //Object Property Shorthand
    name,
    code,
    tel,
    email,
    address,
    website,
    note,
    create_by: user,
  });

  return result.insertId;
};
const updateSupplier = async (id, data) => {
  const { name, code, tel, email, address, website, note } = data;

  // Check supplier exists
  const [supplier] = await db.query("SELECT id FROM suppiler WHERE id=?",[id]);

  if (supplier.length === 0) {
    throw new AppError("Supplier not found", 404);
  }

  // Check duplicate code (except current supplier)
  const [exist] = await db.query(
    `
    SELECT id
    FROM suppiler
    WHERE code = ?
      AND id <> ?
    `,
    [code, id],
  );
  if (exist.length > 0) {
    throw new AppError("Supplier code already exists", 409);
  }
  const sql = `
    UPDATE suppiler
    SET
      name = :name,
      code = :code,
      tel = :tel,
      email = :email,
      address = :address,
      website = :website,
      note = :note
    WHERE id = :id
  `;

  await db.query(sql, {
    id,
    name,
    code,
    tel,
    email,
    address,
    website,
    note,
  });
};
const deleteSupplier = async (id) => {
  const [supplier] = await db.query("SELECT id FROM suppiler WHERE id=?",[id]);

  if (supplier.length === 0) {
    throw new AppError("Supplier not found", 404);
  }

  await db.query("DELETE FROM suppiler WHERE id=?", [id]);
};
module.exports = {
  getAllSuppliers,
  deleteSupplier,
  updateSupplier,
  createSupplier,
};
