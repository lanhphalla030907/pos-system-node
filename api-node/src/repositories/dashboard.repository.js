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
exports.getSalesChart = async () => {
  const sql = `
    SELECT
      DATE_FORMAT(o.create_at, '%Y-%m') AS month,
      SUM(o.total_amount) AS sales,
      SUM(od.qty * p.cost_price) AS cost_of_goods
    FROM orders o
    JOIN order_detail od ON od.order_id = o.id
    JOIN product p ON p.id = od.product_id
    GROUP BY DATE_FORMAT(o.create_at, '%Y-%m')
    ORDER BY month ASC
  `;

  const [rows] = await db.query(sql);

  return rows;
};
exports.getProfitChart = async () => {
  const sql = `
    SELECT
      months.month,

      COALESCE(s.sales, 0) AS sales,
      COALESCE(s.cost_of_goods, 0) AS cost_of_goods,
      COALESCE(e.expense, 0) AS expense

    FROM (
      SELECT DISTINCT DATE_FORMAT(create_at, '%Y-%m') AS month
      FROM orders

      UNION

      SELECT DISTINCT DATE_FORMAT(create_at, '%Y-%m') AS month
      FROM expense
    ) AS months

    LEFT JOIN (
      SELECT
        DATE_FORMAT(o.create_at, '%Y-%m') AS month,
        SUM(o.total_amount) AS sales,
        SUM(od.qty * p.cost_price) AS cost_of_goods
      FROM orders o
      JOIN order_detail od
        ON od.order_id = o.id
      JOIN product p
        ON p.id = od.product_id
      GROUP BY DATE_FORMAT(o.create_at, '%Y-%m')
    ) AS s
      ON s.month = months.month

    LEFT JOIN (
      SELECT
        DATE_FORMAT(create_at, '%Y-%m') AS month,
        SUM(amount) AS expense
      FROM expense
      GROUP BY DATE_FORMAT(create_at, '%Y-%m')
    ) AS e
      ON e.month = months.month

    ORDER BY months.month ASC
  `;

  const [rows] = await db.query(sql);

  return rows;
};