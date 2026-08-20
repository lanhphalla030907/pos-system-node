const { db } = require("../util/helper");
const AppError = require("../util/AppError");

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

exports.create = async (data, user) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();
    // BASIC VALIDATION
    if (!Array.isArray(data.items) || data.items.length === 0) {
      throw new AppError("Order items are required", 400);
    }

    if (!Array.isArray(data.payments) || data.payments.length === 0) {
      throw new AppError("At least one payment is required", 400);
    }

    let memberDiscount = 0;
    let customerType = "regular";
    // TAX RATE (from settings, 0-100)
    const taxRate = Math.max(0, Math.min(100, Number(data.tax_rate) || 0));
    // VALIDATE CUSTOMER
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
        throw new AppError("Customer not found", 400);
      }

      memberDiscount = Number(customerRows[0].discount || 0);
      customerType = customerRows[0].type || "regular";

      // Validate customer discount
      if (memberDiscount < 0 || memberDiscount > 100) {
        throw new AppError("Customer discount must be between 0 and 100", 400);
      }
    }
    // CREATE TEMP ORDER
    const tempOrderNo = `TMP-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 10)}`;

    const [orderResult] = await connection.query(
      `
      INSERT INTO orders
      (
        order_no,
        customer_id,
        user_id,
        total_amount,
        tax_rate,
        tax_amount,
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
        0,
        :tax_rate,
        0,
        0,
        "",
        :remark,
        :create_by
      )
      `,
      {
        order_no: tempOrderNo,
        customer_id: data.customer_id || null,
        user_id: user.data.id,
        tax_rate: taxRate,
        remark: data.remark || "",
        create_by: user.data.id,
      },
    );

    const orderId = orderResult.insertId;
    // SAFE ORDER NUMBER
    const orderNo = `ORD-${String(orderId).padStart(6, "0")}`;

    await connection.query(
      `
      UPDATE orders
      SET order_no = ?
      WHERE id = ?
      `,
      [orderNo, orderId],
    );
    // CALCULATE ORDER
    let totalAmount = 0;
    let totalProductDiscount = 0;
    let totalMemberDiscount = 0;
    let subtotal = 0;

    for (const item of data.items) {
      const productId = Number(item.product_id);
      const qty = Number(item.qty);

      if (!Number.isInteger(productId) || productId <= 0) {
        throw new AppError("Invalid product ID", 400);
      }

      if (!Number.isInteger(qty) || qty <= 0) {
        throw new AppError(
          `Product ${productId} quantity must be greater than 0`,
          400,
        );
      }

      // LOCK PRODUCT ROW

      const [productRows] = await connection.query(
        `
        SELECT id, qty, price
        FROM product
        WHERE id = ?
        FOR UPDATE
        `,
        [productId],
      );

      if (productRows.length === 0) {
        throw new AppError(`Product ${productId} not found`, 400);
      }

      const product = productRows[0];

      const stockQty = Number(product.qty);

      // STOCK VALIDATION

      if (stockQty < qty) {
        throw new AppError(`Product ${productId} out of stock`, 400);
      }

      // USE DATABASE PRICE
      // NEVER TRUST CLIENT PRICE

      const price = Number(product.price) || 0;

      if (price < 0) {
        throw new AppError(`Product ${productId} has invalid price`, 400);
      }

      // PRODUCT DISCOUNT

      const productDiscount = Number(item.discount) || 0;

      if (productDiscount < 0 || productDiscount > 100) {
        throw new AppError(
          `Product ${productId} discount must be between 0 and 100`,
          400,
        );
      }

      // CALCULATE DISCOUNTS

      const subtotalItem = round2(qty * price);

      const productDiscountAmount = round2(
        (subtotalItem * productDiscount) / 100,
      );

      const afterProductDiscount = subtotalItem - productDiscountAmount;

      const memberDiscountAmount = round2(
        (afterProductDiscount * memberDiscount) / 100,
      );

      const finalTotal = round2(
        subtotalItem - productDiscountAmount - memberDiscountAmount,
      );

      subtotal += subtotalItem;

      totalAmount += finalTotal;

      totalProductDiscount += productDiscountAmount;

      totalMemberDiscount += memberDiscountAmount;

      // CREATE ORDER DETAIL

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
          product_id: productId,
          qty: qty,
          price: price,
          discount: productDiscount,
          member_discount: memberDiscount,
          discount_amount: round2(productDiscountAmount + memberDiscountAmount),
          total: finalTotal,
        },
      );

      // UPDATE STOCK

      await connection.query(
        `
        UPDATE product
        SET qty = qty - ?
        WHERE id = ?
        `,
        [qty, productId],
      );
    }
    // FINAL ROUNDING
    totalAmount = round2(totalAmount);
    totalProductDiscount = round2(totalProductDiscount);
    totalMemberDiscount = round2(totalMemberDiscount);
    subtotal = round2(subtotal);
    // APPLY TAX
    const taxAmount = round2(totalAmount * (taxRate / 100));
    const finalTotal = round2(totalAmount + taxAmount);
    // UPDATE ORDER TOTAL
    await connection.query(
      `
      UPDATE orders
      SET total_amount = ?,
          tax_amount = ?
      WHERE id = ?
      `,
      [finalTotal, taxAmount, orderId],
    );
    // VALIDATE PAYMENTS
    const paymentRows = [];

    let totalPaid = 0;

    for (const payment of data.payments) {
      const paymentMethodId = Number(payment.payment_method_id);

      if (!Number.isInteger(paymentMethodId) || paymentMethodId <= 0) {
        throw new AppError("Invalid payment method", 400);
      }

      const amount = Number(payment.amount);

      if (!Number.isFinite(amount) || amount <= 0) {
        throw new AppError("Payment amount must be greater than 0", 400);
      }

      const [methodRows] = await connection.query(
        `
        SELECT
          id,
          name,
          type,
          is_active
        FROM payment_method
        WHERE id = ?
        `,
        [paymentMethodId],
      );

      if (methodRows.length === 0) {
        throw new AppError("Payment method not found", 400);
      }

      const method = methodRows[0];

      if (!Number(method.is_active)) {
        throw new AppError(`Payment method "${method.name}" is inactive`, 400);
      }

      const roundedAmount = round2(amount);

      totalPaid = round2(totalPaid + roundedAmount);

      paymentRows.push({
        payment_method_id: paymentMethodId,
        amount: roundedAmount,
        reference_no: payment.reference_no || null,
        remark: payment.remark || null,
        method_name: method.name,
        method_type: method.type,
      });
    }
    // PAYMENT TOTAL MUST MATCH ORDER TOTAL
    totalPaid = round2(totalPaid);

    if (totalPaid < finalTotal) {
      throw new AppError("Payment amount is not enough", 400);
    }
    // CREATE ORDER PAYMENTS
    for (const payment of paymentRows) {
      await connection.query(
        `
        INSERT INTO order_payment
        (
          order_id,
          payment_method_id,
          amount,
          reference_no,
          remark,
          create_by
        )
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          orderId,
          payment.payment_method_id,
          payment.amount,
          payment.reference_no,
          payment.remark,
          user.data.id,
        ],
      );
    }
    const paymentMethodSummary = paymentRows
      .map((payment) => payment.method_name)
      .join(", ");

    await connection.query(
      `
      UPDATE orders
      SET
        paid = ?,
        payment_method = ?
      WHERE id = ?
      `,
      [totalPaid, paymentMethodSummary, orderId],
    );
    // UPDATE CUSTOMER
    if (data.customer_id) {
      await connection.query(
        `
        UPDATE customer
        SET total_spent = total_spent + ?
        WHERE id = ?
        `,
        [totalAmount, data.customer_id],
      );

      const [customerRows] = await connection.query(
        `
          SELECT total_spent
          FROM customer
          WHERE id = ?
          `,
        [data.customer_id],
      );

      let newType = "regular";

      const totalSpent = Number(customerRows[0]?.total_spent || 0);

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
    // COMMIT
    await connection.commit();
    // RESPONSE
    return {
      id: orderId,
      order_no: orderNo,

      subtotal,

      tax_rate: taxRate,

      tax_amount: taxAmount,

      total_amount: finalTotal,

      paid: totalPaid,

      remaining: round2(finalTotal - totalPaid),

      total_product_discount: totalProductDiscount,

      total_member_discount: totalMemberDiscount,

      total_discount: round2(totalProductDiscount + totalMemberDiscount),

      customer_id: data.customer_id || null,

      discount_applied: memberDiscount,

      cashier: user.data.name || null,

      create_at: new Date(),

      payments: paymentRows.map((payment) => ({
        payment_method_id: payment.payment_method_id,

        payment_method: payment.method_name,

        type: payment.method_type,

        amount: payment.amount,

        reference_no: payment.reference_no,

        remark: payment.remark,
      })),
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
      o.tax_rate,
      o.tax_amount,
      o.paid,
      COALESCE(NULLIF((
        SELECT GROUP_CONCAT(pm.name ORDER BY op.id SEPARATOR ', ')
        FROM order_payment op
        INNER JOIN payment_method pm ON pm.id = op.payment_method_id
        WHERE op.order_id = o.id
      ), ''), o.payment_method) AS payment_method,
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
      o.tax_rate,
      o.tax_amount,
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

  const [payments] = await db.query(
    `
    SELECT
      op.id,
      op.payment_method_id,
      pm.name AS payment_method,
      pm.type,
      op.amount,
      op.reference_no,
      op.remark
    FROM order_payment op
    INNER JOIN payment_method pm
      ON pm.id = op.payment_method_id
    WHERE op.order_id = ?
    ORDER BY op.id ASC
    `,
    [id],
  );

  // Calculate subtotal
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);

  const totalProductDiscount = items.reduce((sum, item) => {
    const productDiscount = parseFloat(item.product_discount) || 0;
    const subtotalItem = parseFloat(item.subtotal) || 0;
    return sum + (subtotalItem * productDiscount) / 100;
  }, 0);
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
  const paid = Number(orderData.paid) || 0;
  const totalAmount = Number(orderData.total_amount) || 0;
  return {
    ...orderData,
    subtotal: subtotal,
    total_product_discount: totalProductDiscount,
    total_member_discount: totalMemberDiscount,
    total_discount: totalDiscount,
    remaining: totalAmount - paid,
    items: items,
    payments: payments,
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

  const allowedGroupBy = {
    day: {
      groupSelect: `DAY(o.create_at) AS label, DATE(o.create_at) AS full_date`,
      groupBy: `DATE(o.create_at)`,
      orderBy: `DATE(o.create_at)`,
    },
    year: {
      groupSelect: `YEAR(o.create_at) AS label`,
      groupBy: `YEAR(o.create_at)`,
      orderBy: `YEAR(o.create_at)`,
    },
    month: {
      groupSelect: `MONTH(o.create_at) AS month, DATE_FORMAT(o.create_at,'%b') AS label`,
      groupBy: `MONTH(o.create_at)`,
      orderBy: `MONTH(o.create_at)`,
    },
  };

  const config = allowedGroupBy[group_by] || allowedGroupBy.month;
  const { groupSelect, groupBy, orderBy } = config;

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
      o.tax_rate,
      o.tax_amount,
      o.paid,
      COALESCE(NULLIF((
        SELECT GROUP_CONCAT(pm.name ORDER BY op.id SEPARATOR ', ')
        FROM order_payment op
        INNER JOIN payment_method pm ON pm.id = op.payment_method_id
        WHERE op.order_id = o.id
      ), ''), o.payment_method) AS payment_method,
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
