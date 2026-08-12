const { db } = require("../util/helper");

// ALL-TIME SALES
exports.getSales = async () => {
  const [rows] = await db.query(`
    SELECT COALESCE(SUM(total_amount), 0) AS sales
    FROM orders
    
  `);

  return Number(rows[0].sales);
};

// ALL-TIME COST OF GOODS SOLD
exports.getCostOfGoods = async () => {
  const [rows] = await db.query(`
    SELECT COALESCE(
      SUM(od.qty * p.cost_price),
      0
    ) AS cost_of_goods
    FROM order_detail od
    INNER JOIN product p ON p.id = od.product_id
    INNER JOIN orders o ON o.id = od.order_id
    
  `);

  return Number(rows[0].cost_of_goods);
};

// ALL-TIME EXPENSE
exports.getExpense = async () => {
  const [rows] = await db.query(`
    SELECT COALESCE(SUM(amount), 0) AS expense
    FROM expense
  `);

  return Number(rows[0].expense);
};

// TOTAL ORDERS
exports.getOrders = async () => {
  const [rows] = await db.query(`
    SELECT COUNT(*) AS orders
    FROM orders
   
  `);

  return Number(rows[0].orders);
};

// TOTAL PURCHASES
exports.getPurchase = async () => {
  const [rows] = await db.query(`
    SELECT COALESCE(SUM(total_amount), 0) AS purchase
    FROM purchase
  `);

  return Number(rows[0].purchase);
};

// TOTAL PRODUCTS
exports.getProducts = async () => {
  const [rows] = await db.query(`
    SELECT COUNT(*) AS products
    FROM product
  `);

  return Number(rows[0].products);
};

// LOW STOCK
exports.getLowStock = async () => {
  const [rows] = await db.query(`
    SELECT COUNT(*) AS low_stock
    FROM product
    WHERE qty > 0
      AND qty <= min_stock
  `);

  return Number(rows[0].low_stock);
};

// OUT OF STOCK
exports.getOutOfStock = async () => {
  const [rows] = await db.query(`
    SELECT COUNT(*) AS out_of_stock
    FROM product
    WHERE qty <= 0
  `);

  return Number(rows[0].out_of_stock);
};

// TOTAL CUSTOMERS
exports.getCustomers = async () => {
  const [rows] = await db.query(`
    SELECT COUNT(*) AS customers
    FROM customer
  `);

  return Number(rows[0].customers);
};
exports.getSalesChart = async (period = "daily") => {
  let dateFormat;

  switch (period) {
    case "daily":
      dateFormat = "%Y-%m-%d";
      break;
    case "weekly":
      dateFormat = "%Y-%u";
      break;
    case "monthly":
      dateFormat = "%Y-%m";
      break;
    case "yearly":
      dateFormat = "%Y";
      break;
    default:
      throw new Error("Invalid period. Use daily, weekly, monthly, or yearly");
  }
  const sql = `
    SELECT
      DATE_FORMAT(o.create_at, '${dateFormat}') AS period,
      SUM(o.total_amount) AS sales,
      COALESCE(SUM(cog.cost_of_goods), 0) AS cost_of_goods

    FROM orders o

    LEFT JOIN (
      SELECT
        od.order_id,
        SUM(od.qty * p.cost_price) AS cost_of_goods
      FROM order_detail od
      JOIN product p
        ON p.id = od.product_id
      GROUP BY od.order_id
    ) cog
      ON cog.order_id = o.id

    GROUP BY DATE_FORMAT(o.create_at, '${dateFormat}')
    ORDER BY period ASC
  `;

  const [rows] = await db.query(sql);

  return rows;
};
exports.getProfitChart = async (period = "monthly") => {
  let dateFormat;

  switch (period) {
    case "daily":
      dateFormat = "%Y-%m-%d";
      break;

    case "weekly":
      dateFormat = "%Y-%u";
      break;

    case "monthly":
      dateFormat = "%Y-%m";
      break;

    case "yearly":
      dateFormat = "%Y";
      break;

    default:
      throw new Error("Invalid period. Use daily, weekly, monthly, or yearly");
  }

  const sql = `
    SELECT
      periods.period,
      COALESCE(s.sales, 0) AS sales,
      COALESCE(s.cost_of_goods, 0) AS cost_of_goods,
      COALESCE(e.expense, 0) AS expense

    FROM (
      SELECT DISTINCT
        DATE_FORMAT(create_at, '${dateFormat}') AS period
      FROM orders

      UNION

      SELECT DISTINCT
        DATE_FORMAT(create_at, '${dateFormat}') AS period
      FROM expense
    ) periods

    LEFT JOIN (
      SELECT
        DATE_FORMAT(o.create_at, '${dateFormat}') AS period,
        SUM(o.total_amount) AS sales,
        COALESCE(SUM(cog.cost_of_goods), 0) AS cost_of_goods

      FROM orders o

      LEFT JOIN (
        SELECT
          od.order_id,
          SUM(od.qty * p.cost_price) AS cost_of_goods
        FROM order_detail od
        JOIN product p
          ON p.id = od.product_id
        GROUP BY od.order_id
      ) cog
        ON cog.order_id = o.id

      GROUP BY DATE_FORMAT(o.create_at, '${dateFormat}')
    ) s
      ON s.period = periods.period

    LEFT JOIN (
      SELECT
        DATE_FORMAT(create_at, '${dateFormat}') AS period,
        SUM(amount) AS expense
      FROM expense
      GROUP BY DATE_FORMAT(create_at, '${dateFormat}')
    ) e
      ON e.period = periods.period

    ORDER BY periods.period ASC
  `;

  const [rows] = await db.query(sql);

  return rows;
};
exports.getPaymentSummary = async (query = {}) => {
  const { period = "today", date_from, date_to } = query;

  let where = `
    WHERE 1 = 1
  `;

  const params = [];

  // Today
  if (period === "today") {
    where += `
      AND DATE(op.create_at) = CURDATE()
    `;
  }

  // Yesterday
  else if (period === "yesterday") {
    where += `
      AND DATE(op.create_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
    `;
  }

  // This week
  else if (period === "week") {
    where += `
      AND YEARWEEK(op.create_at, 1) = YEARWEEK(CURDATE(), 1)
    `;
  }

  // This month
  else if (period === "month") {
    where += `
      AND YEAR(op.create_at) = YEAR(CURDATE())
      AND MONTH(op.create_at) = MONTH(CURDATE())
    `;
  }

  // This year
  else if (period === "year") {
    where += `
      AND YEAR(op.create_at) = YEAR(CURDATE())
    `;
  }

  // Custom date range
  else if (period === "custom") {
    if (date_from) {
      where += `
        AND DATE(op.create_at) >= ?
      `;
      params.push(date_from);
    }
    if (date_to) {
      where += `
        AND DATE(op.create_at) <= ?
      `;
      params.push(date_to);
    }
  }
  const [rows] = await db.query(
    `
    SELECT
      pm.id AS payment_method_id,
      pm.name,
      pm.type,
      COALESCE(SUM(op.amount), 0) AS amount
    FROM order_payment op
    INNER JOIN payment_method pm
      ON pm.id = op.payment_method_id
    INNER JOIN orders o
      ON o.id = op.order_id
    ${where}
    GROUP BY
      pm.id,
      pm.name,
      pm.type
    ORDER BY amount DESC
    `,
    params,
  );

  return rows;
};
