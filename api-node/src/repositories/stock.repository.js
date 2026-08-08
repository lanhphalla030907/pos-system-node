const { db } = require("../util/helper");
exports.getLowStockProducts = async () => {
  const sql = `
        SELECT
            id,
            name,
            barcode,
            qty,
            min_stock
        FROM product
        WHERE qty <= min_stock
        ORDER BY qty ASC
    `;

  const [rows] = await db.query(sql);
  return rows;
};
exports.getStockMovement = async (year) => {
  const sql = `
        SELECT
            month,
            SUM(stock_in) AS stock_in,
            SUM(stock_out) AS stock_out
        FROM (
            SELECT
                MONTH(p.create_at) AS month,
                SUM(pd.qty) AS stock_in,
                0 AS stock_out
            FROM purchase p
            INNER JOIN purchase_detail pd
                ON p.id = pd.purchase_id
            WHERE YEAR(p.create_at) = ?
                AND p.status != 'cancelled'
            GROUP BY MONTH(p.create_at)
            UNION ALL
            SELECT
                MONTH(o.create_at) AS month,
                0 AS stock_in,
                SUM(od.qty) AS stock_out
            FROM orders o
            INNER JOIN order_detail od
                ON o.id = od.order_id
            WHERE YEAR(o.create_at) = ?
            GROUP BY MONTH(o.create_at)
        ) AS movement
        GROUP BY month
        ORDER BY month
    `;
  const [rows] = await db.query(sql, [year, year]);
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
  return months.map((monthName, index) => {
    const found = rows.find((row) => Number(row.month) === index + 1);
    return {
      month: monthName,
      stock_in: found ? Number(found.stock_in) : 0,
      stock_out: found ? Number(found.stock_out) : 0,
    };
  });
};
exports.getHistory = async (filters) => {
  const { product_id, type, from, to, page = 1, limit = 10 } = filters;
  const offset = (page - 1) * limit;
  let conditions = [];
  let params = [];
  if (product_id) {
    conditions.push("product_id = ?");
    params.push(product_id);
  }
  if (type) {
    conditions.push("movement_type = ?");
    params.push(type);
  }
  if (from) {
    conditions.push("movement_date >= ?");
    params.push(`${from} 00:00:00`);
  }
  if (to) {
    conditions.push("movement_date <= ?");
    params.push(`${to} 23:59:59`);
  }
  const where =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const sql = `
        SELECT *
        FROM (
            SELECT
                pd.id AS detail_id,
                p.id AS product_id,
                p.name AS product_name,
                p.barcode,
                'in' AS movement_type,
                pd.qty,
                pd.cost AS unit_cost,
                pd.amount,
                pu.id AS reference_id,
                pu.purchase_no AS reference_no,
                pu.create_at AS movement_date
            FROM purchase_detail pd
            INNER JOIN purchase pu
                ON pu.id = pd.purchase_id
            INNER JOIN product p
                ON p.id = pd.product_id
            WHERE pu.status != 'cancelled'
            UNION ALL
            SELECT
                od.id AS detail_id,
                p.id AS product_id,
                p.name AS product_name,
                p.barcode,
                'out' AS movement_type,
                od.qty,
                od.price AS unit_cost,
                od.total AS amount,
                o.id AS reference_id,
                o.order_no AS reference_no,
                o.create_at AS movement_date
            FROM order_detail od
            INNER JOIN orders o
                ON o.id = od.order_id
            INNER JOIN product p
                ON p.id = od.product_id
        ) AS history
        ${where}
        ORDER BY movement_date DESC, detail_id DESC
        LIMIT ? OFFSET ?
    `;
  const [rows] = await db.query(sql, [
    ...params,
    Number(limit),
    Number(offset),
  ]);
  const countSql = `
        SELECT COUNT(*) AS total
        FROM (
            SELECT
                pd.id AS detail_id,
                pd.product_id,
                'in' AS movement_type,
                pu.create_at AS movement_date
            FROM purchase_detail pd
            INNER JOIN purchase pu
                ON pu.id = pd.purchase_id
            WHERE pu.status != 'cancelled'
            UNION ALL
            SELECT
                od.id AS detail_id,
                od.product_id,
                'out' AS movement_type,
                o.create_at AS movement_date
            FROM order_detail od
            INNER JOIN orders o
                ON o.id = od.order_id
        ) AS history
        ${where}
    `;
  const [countRows] = await db.query(countSql, params);
  return {
    rows,
    total: Number(countRows[0].total),
  };
};
exports.getInventoryValue = async () => {
  const sql = `
        SELECT
            id,
            name,
            barcode,
            qty,
            cost_price,
            price,
            (qty * cost_price) AS inventory_value
        FROM product
        WHERE qty > 0
        ORDER BY inventory_value DESC
    `;

  const [rows] = await db.query(sql);

  const products = rows.map((row) => ({
    id: row.id,
    name: row.name,
    barcode: row.barcode,
    qty: Number(row.qty),
    cost_price: Number(row.cost_price),
    price: Number(row.price),
    inventory_value: Number(row.inventory_value),
  }));

  const totalQty = products.reduce((sum, product) => sum + product.qty, 0);

  const totalValue = products.reduce(
    (sum, product) => sum + product.inventory_value,
    0,
  );
  return {
    total_qty: totalQty,
    total_value: totalValue,
    products,
  };
};
