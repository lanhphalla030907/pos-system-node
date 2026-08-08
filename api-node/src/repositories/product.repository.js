const { db } = require("../util/helper");
exports.getAll = async (filter) => {
  const {
    search = "",
    page = 1,
    limit = 10,
    category_id,
    status,
    stock_status,
  } = filter;
  const offset = (page - 1) * limit;
  let whereClause = "WHERE 1=1";
  const queryParams = [];
  // search by name, brand, barcode
  if (search && search.trim() !== "") {
    whereClause += `
      AND (
        p.name LIKE ?
        OR p.brand LIKE ?
        OR p.barcode LIKE ?
      )
    `;
    const searchWildcard = `%${search}%`;
    queryParams.push(searchWildcard, searchWildcard, searchWildcard);
  }
  // filter by category
  if (category_id) {
    whereClause += ` AND p.category_id = ?`;
    queryParams.push(category_id);
  }

  // filter by product status
  if (status !== undefined && status !== "") {
    whereClause += ` AND p.status = ?`;
    queryParams.push(status);
  }

  // Filter by stock status
  if (stock_status) {
    if (stock_status === "out_of_stock") {
      whereClause += ` AND p.qty = 0`;
    } else if (stock_status === "low_stock") {
      whereClause += ` AND p.qty > 0 AND p.qty <= 5`;
    } else if (stock_status === "in_stock") {
      whereClause += ` AND p.qty > 5`;
    }
  }

  //  Get total count for pagination
  const countSql = `
    SELECT COUNT(*) as total
    FROM product p
    INNER JOIN category c ON p.category_id = c.id
    ${whereClause}
  `;

  const [countResult] = await db.query(countSql, queryParams);
  const total = countResult[0]?.total || 0;
  const totalPages = Math.ceil(total / limit);

  //  Get paginated data
  const dataSql = `
    SELECT 
      p.*,
      c.name AS category_name
    FROM product p
    INNER JOIN category c ON p.category_id = c.id
    ${whereClause}
    ORDER BY p.id DESC
    LIMIT ? OFFSET ?
  `;

  // Add limit and offset to query params
  const dataParams = [...queryParams, Number(limit), Number(offset)];
  const [rows] = await db.query(dataSql, dataParams);

  return {
    data: rows,
    pagination: {
      total,
      totalPages,
      currentPage: Number(page),
      limit: Number(limit),
    },
  };
};

// Get Product By ID
exports.getById = async (id) => {
  const [rows] = await db.query(
    `
        SELECT *
        FROM product
        WHERE id = ?
        `,
    [id],
  );
  return rows[0];
};
// Create Product
exports.create = async (data, user) => {
  const {
    category_id,
    barcode,
    name,
    brand,
    description,
    qty,
    price,
    cost_price,
    discount,
    status,
    image,
    create_by,
  } = data;
  const sql = `
    INSERT INTO product
    (
      category_id,
      barcode,
      name,
      brand,
      description,
      qty,
      price,
      cost_price,
      discount,
      status,
      image,
      create_by
    )
    VALUES
    (
      :category_id,
      :barcode,
      :name,
      :brand,
      :description,
      :qty,
      :price,
      :cost_price,
      :discount,
      :status,
      :image,
      :create_by
    )
  `;

  const [result] = await db.query(sql, {
    category_id,
    barcode,
    name,
    brand,
    description,
    qty,
    price,
    cost_price,
    discount,
    status,
    image,
    create_by: user,
  });

  return result.insertId;
};
// Update Product
exports.update = async (id, data) => {
  const sql = `
    UPDATE product SET
    category_id=?,
    barcode=?,
    name=?,
    brand=?,
    description=?,
    qty=?,
    price=?,
    cost_price=?,
    discount=?,
    status=?,
    image=?
    WHERE id=?
    `;
  const [result] = await db.query(sql, [
    data.category_id,
    data.barcode,
    data.name,
    data.brand,
    data.description,
    data.qty,
    data.price,
    data.cost_price,
    data.discount,
    data.status,
    data.image,
    id,
  ]);
  return result.affectedRows;
};
// Generate next barcode number
exports.getLastBarcodeNumber = async () => {
  const [rows] = await db.query(`
    SELECT barcode
    FROM product
    WHERE barcode IS NOT NULL
    ORDER BY id DESC
    LIMIT 1
  `);
  if (rows.length === 0) {
    return 0;
  }
  const lastBarcode = rows[0].barcode;
  // BAR-000001 => 1
  const number = parseInt(lastBarcode.replace("BAR-", ""));
  return number || 0;
};
// Delete
exports.remove = async (id) => {
  const [result] = await db.query(
    `
        DELETE FROM product
        WHERE id=?
        `,
    [id],
  );
  return result.affectedRows;
};
exports.getTopSale = async (query) => {
  const { limit = 5, date_from, date_to } = query;

  let sql = `
    SELECT
      p.id AS product_id,
      p.name AS product_name,
      p.barcode as product_code,
      SUM(od.qty) AS total_qty,
      SUM(od.total) AS total_sales
    FROM order_detail od
    INNER JOIN product p
      ON od.product_id = p.id
    INNER JOIN orders o
      ON od.order_id = o.id
    WHERE 1=1
  `;
  const params = [];
  if (date_from) {
    sql += `
      AND DATE(o.create_at) >= ?
    `;

    prams.push(date_from);
  }
  if (date_to) {
    sql += `
      AND DATE(o.create_at) <= ?
    `;
    params.push(date_to);
  }
  sql += `
    GROUP BY
      p.id,
      p.name

    ORDER BY
      total_qty DESC

    LIMIT ?
  `;
  params.push(Number(limit));
  const [rows] = await db.query(sql, params);
  return rows;
};
exports.getSummary = async () => {
  const sql = `
        SELECT
            COUNT(*) AS total,

            SUM(CASE
                WHEN qty > min_stock THEN 1
                ELSE 0
            END) AS in_stock,

            SUM(CASE
                WHEN qty > 0 AND qty <= min_stock THEN 1
                ELSE 0
            END) AS low_stock,

            SUM(CASE
                WHEN qty = 0 THEN 1
                ELSE 0
            END) AS out_of_stock

        FROM product
    `;

  const [rows] = await db.query(sql);

  return {
    total: Number(rows[0].total),
    in_stock: Number(rows[0].in_stock),
    low_stock: Number(rows[0].low_stock),
    out_of_stock: Number(rows[0].out_of_stock),
  };
};
