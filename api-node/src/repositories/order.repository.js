const { db } = require("../util/helper");

exports.create = async (data, user) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    let memberDiscount = 0;
    let customerType = "regular";

    if (data.customer_id) {
      const [customerRows] = await connection.query(
        `
        SELECT discount, type
        FROM customer
        WHERE id = ?
        `,
        [data.customer_id],
      );

      if (customerRows.length === 0) {
        throw new Error("Customer not found");
      }

      memberDiscount = Number(customerRows[0].discount || 0);
      customerType = customerRows[0].type || "regular";
    }

    // Create order number
    const [rows] = await connection.query(`
      SELECT order_no
      FROM orders
      ORDER BY id DESC
      LIMIT 1
    `);

    let orderNo = "ORD-000001";
    if (rows.length > 0) {
      const last = parseInt(rows[0].order_no.replace("ORD-", ""));
      orderNo = `ORD-${String(last + 1).padStart(6, "0")}`;
    }

    // Insert order
    const [orderResult] = await connection.query(
      `
      INSERT INTO orders
      (
        order_no,
        customer_id,
        user_id,
        total_amount,
        paid,
        payment_method,
        remark,
        create_by
      )
      VALUES
      (
        :order_no,
        :customer_id,
        :user_id,
        :total_amount,
        :paid,
        :payment_method,
        :remark,
        :create_by
      )
      `,
      {
        order_no: orderNo,
        customer_id: data.customer_id || null,
        user_id: user.data.id,
        total_amount: 0,
        paid: data.paid,
        payment_method: data.payment_method,
        remark: data.remark || "",
        create_by: user.data.id,
      },
    );
    const orderId = orderResult.insertId;

    let totalAmount = 0;
    let totalProductDiscount = 0;
    let totalMemberDiscount = 0;

    for (const item of data.items) {
      const subtotal = item.qty * item.price;
      const productDiscount = parseFloat(item.discount) || 0;
      const productDiscountAmount = (subtotal * productDiscount) / 100;
      const afterProductDiscount = subtotal - productDiscountAmount;
      const memberDiscountAmount =
        (afterProductDiscount * memberDiscount) / 100;
      const finalTotal =
        subtotal - productDiscountAmount - memberDiscountAmount;

      totalAmount += finalTotal;
      totalProductDiscount += productDiscountAmount;
      totalMemberDiscount += memberDiscountAmount;

      await connection.query(
        `
        INSERT INTO order_detail
        (
          order_id,
          product_id,
          qty,
          price,
          discount,
          member_discount,
          discount_amount,
          total
        )
        VALUES
        (
          :order_id,
          :product_id,
          :qty,
          :price,
          :discount,
          :member_discount,
          :discount_amount,
          :total
        )
        `,
        {
          order_id: orderId,
          product_id: item.product_id,
          qty: item.qty,
          price: item.price,
          discount: productDiscount,
          member_discount: memberDiscount,
          discount_amount: productDiscountAmount + memberDiscountAmount,
          total: finalTotal,
        },
      );

      const [product] = await connection.query(
        `
        SELECT qty
        FROM product
        WHERE id = ?
        `,
        [item.product_id],
      );

      if (product.length === 0) {
        throw new Error(`Product ${item.product_id} not found`);
      }

      if (product[0].qty < item.qty) {
        throw new Error(`Product ${item.product_id} out of stock`);
      }

      await connection.query(
        `
        UPDATE product
        SET qty = qty - ?
        WHERE id = ?
        `,
        [item.qty, item.product_id],
      );
    }

    // Update orders total_amount
    await connection.query(
      `
      UPDATE orders
      SET total_amount = ?
      WHERE id = ?
      `,
      [totalAmount, orderId],
    );

    // Update customer
    if (data.customer_id) {
      await connection.query(
        `
        UPDATE customer
        SET total_spent = total_spent + ?
        WHERE id = ?
        `,
        [totalAmount, data.customer_id],
      );

      const [customer] = await connection.query(
        `
        SELECT total_spent
        FROM customer
        WHERE id = ?
        `,
        [data.customer_id],
      );

      let newType = "regular";
      const totalSpent = Number(customer[0]?.total_spent || 0);

      if (totalSpent >= 1000) {
        newType = "vip";
      } else if (totalSpent >= 200) {
        newType = "member";
      }

      if (newType !== customerType) {
        await connection.query(
          `
          UPDATE customer
          SET type = ?
          WHERE id = ?
          `,
          [newType, data.customer_id],
        );
      }
    }

    await connection.commit();

    return {
      id: orderId,
      order_no: orderNo,
      total_amount: totalAmount,
      total_product_discount: totalProductDiscount,
      total_member_discount: totalMemberDiscount,
      total_discount: totalProductDiscount + totalMemberDiscount,
      customer_id: data.customer_id || null,
      discount_applied: memberDiscount,
    };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

exports.getAll = async (filter) => {
  const { search = "", page = 1, limit = 10 } = filter;
  const offset = (page - 1) * limit;

  let whereClause = "WHERE 1=1";
  const params = [];

  if (search && search.trim() !== "") {
    whereClause += `
      AND (
        o.order_no LIKE ?
        OR c.name LIKE ?
        OR u.name LIKE ?
      )
    `;
    const keyword = `%${search}%`;
    params.push(keyword, keyword, keyword);
  }

  const [countResult] = await db.query(
    `
    SELECT COUNT(*) as total
    FROM orders o
    LEFT JOIN customer c ON o.customer_id = c.id
    LEFT JOIN user u ON o.user_id = u.id
    ${whereClause}
    `,
    params,
  );

  const sql = `
    SELECT
      o.id,
      o.order_no,
      c.id AS customer_id,
      c.name AS customer_name,
      c.type AS customer_type,
      u.name AS user_name,
      o.total_amount,
      o.paid,
      o.payment_method,
      o.create_at
    FROM orders o
    LEFT JOIN customer c ON o.customer_id = c.id
    LEFT JOIN user u ON o.user_id = u.id
    ${whereClause}
    ORDER BY o.id DESC
    LIMIT ? OFFSET ?
  `;

  const [rows] = await db.query(sql, [
    ...params,
    parseInt(limit),
    parseInt(offset),
  ]);

  return {
    data: rows,
    pagination: {
      total: countResult[0].total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(countResult[0].total / limit),
    },
  };
};

exports.getById = async (id) => {
  const [order] = await db.query(
    `
    SELECT
      o.id,
      o.order_no,
      o.total_amount,
      o.paid,
      o.payment_method,
      o.remark,
      o.create_at,
      c.id AS customer_id,
      c.name AS customer_name,
      c.tel AS customer_tel,
      c.type AS customer_type,
      c.total_spent AS customer_total_spent,
      c.discount AS customer_discount,
      u.name AS cashier_name
    FROM orders o
    LEFT JOIN customer c
      ON o.customer_id = c.id
    LEFT JOIN user u
      ON o.user_id = u.id
    WHERE o.id = ?
    `,
    [id],
  );

  if (order.length === 0) {
    return null;
  }

  const [details] = await db.query(
    `
    SELECT
      od.id,
      od.product_id,
      p.name AS product_name,
      p.image AS product_image,
      od.qty,
      od.price,
      od.discount AS product_discount,
      od.member_discount,
      od.discount_amount,
      od.total,
      (od.qty * od.price) AS subtotal
    FROM order_detail od
    INNER JOIN product p
      ON od.product_id = p.id
    WHERE od.order_id = ?
    `,
    [id],
  );

  const orderData = order[0];
  const items = details;

  // Calculate subtotal
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);

  // Calculate product discount
  const totalProductDiscount = items.reduce((sum, item) => {
    const productDiscount = parseFloat(item.product_discount) || 0;
    const subtotalItem = parseFloat(item.subtotal) || 0;
    return sum + (subtotalItem * productDiscount) / 100;
  }, 0);

  // Calculate member discount
  const totalMemberDiscount = items.reduce((sum, item) => {
    const memberDiscount = parseFloat(item.member_discount) || 0;
    const price = parseFloat(item.price) || 0;
    const qty = item.qty || 0;
    const productDiscount = parseFloat(item.product_discount) || 0;
    const subtotalItem = price * qty;
    const productDiscountAmount = (subtotalItem * productDiscount) / 100;
    const afterProductDiscount = subtotalItem - productDiscountAmount;
    return sum + (afterProductDiscount * memberDiscount) / 100;
  }, 0);
  const totalDiscount = totalProductDiscount + totalMemberDiscount;
  return {
    ...orderData,
    subtotal: subtotal,
    total_product_discount: totalProductDiscount,
    total_member_discount: totalMemberDiscount,
    total_discount: totalDiscount,
    items: items,
  };
};
exports.getSalesChart = async (query) => {
  const {
    group_by = "month",
    year = new Date().getFullYear(),
    month,
    date_from,
    date_to,
  } = query;
  let groupSelect = "";
  let groupBy = "";
  let orderBy = "";
  switch (group_by) {
    case "day":
      groupSelect = `
        DAY(o.create_at) AS label,
        DATE(o.create_at) AS full_date
      `;
      groupBy = `DATE(o.create_at)`;
      orderBy = `DATE(o.create_at)`;
      break;
    case "year":
      groupSelect = `
        YEAR(o.create_at) AS label
      `;
      groupBy = `YEAR(o.create_at)`;
      orderBy = `YEAR(o.create_at)`;
      break;
    default: // month
      groupSelect = `
        MONTH(o.create_at) AS month,
        DATE_FORMAT(o.create_at,'%b') AS label
      `;
      groupBy = `MONTH(o.create_at)`;
      orderBy = `MONTH(o.create_at)`;
      break;
  }
  let sql = `
    SELECT
      ${groupSelect},
      COUNT(*) AS total_orders,
      SUM(o.total_amount) AS total_sales
    FROM orders o
    WHERE 1 = 1
  `;
  const params = [];
  if (year) {
    sql += ` AND YEAR(o.create_at) = ?`;
    params.push(year);
  }
  if (month) {
    sql += ` AND MONTH(o.create_at) = ?`;
    params.push(month);
  }
  if (date_from) {
    sql += ` AND DATE(o.create_at) >= ?`;
    params.push(date_from);
  }
  if (date_to) {
    sql += ` AND DATE(o.create_at) <= ?`;
    params.push(date_to);
  }
  sql += `
    GROUP BY ${groupBy}
    ORDER BY ${orderBy}
  `;
  const [rows] = await db.query(sql, params);
  return rows;
};
exports.getTodaySummary = async () => {
  const sql = `
    SELECT
    COUNT(*) AS total_orders,
    IFNULL(SUM(total_amount),0) AS total_sales,
    IFNULL(SUM(paid),0) AS total_paid,
    IFNULL(SUM(total_amount - paid),0) AS total_due,
    IFNULL(AVG(total_amount),0) AS average_order
    FROM orders
    WHERE DATE(create_at)=CURDATE();
  `;
  const [rows] = await db.query(sql);
  return rows[0];
};
exports.getTodayOrders = async () => {
  const sql = `
    SELECT
      o.id,
      o.order_no,
      c.name AS customer_name,
      u.name AS cashier_name,
      o.total_amount,
      o.paid,
      o.payment_method,
      o.create_at
    FROM orders o
    LEFT JOIN customer c
      ON o.customer_id = c.id
    LEFT JOIN user u
      ON o.user_id = u.id
    WHERE DATE(o.create_at) = CURDATE()
    ORDER BY o.create_at DESC
  `;
  const [rows] = await db.query(sql);
  return rows;
};
