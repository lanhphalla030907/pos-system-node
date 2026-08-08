const { db } = require("../util/helper");
const purchaseRepository = require("../repositories/purchase.repository");
exports.create = async (data, userId) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    // SUPPLIE
    const supplier = await purchaseRepository.findSupplier(
      connection,
      data.supplier_id,
    );
    if (!supplier) {
      throw new Error("Supplier not found");
    }
    // iTEM
    if (!Array.isArray(data.items) || data.items.length === 0) {
      throw new Error("Purchase items are required");
    }
    // CALCULATE ITEM
    let subtotal = 0;
    const items = [];
    for (const item of data.items) {
      const product = await purchaseRepository.findProduct(
        connection,
        item.product_id,
      );
      if (!product) {
        throw new Error(`Product ${item.product_id} not found`);
      }
      const qty = Number(item.qty);
      const cost = Number(item.cost);
      const retailPrice = Number(item.retail_price);
      const discount = Number(item.discount || 0);

      if (qty <= 0) {
        throw new Error("Quantity must be greater than 0");
      }

      if (cost < 0) {
        throw new Error("Cost cannot be negative");
      }

      if (retailPrice < 0) {
        throw new Error("Retail price cannot be negative");
      }

      if (discount < 0) {
        throw new Error("Discount cannot be negative");
      }

      const amount = qty * cost - discount;

      if (amount < 0) {
        throw new Error("Discount cannot exceed item total");
      }

      subtotal += amount;

      items.push({
        product_id: product.id,
        qty,
        cost,
        retail_price: retailPrice,
        discount,
        amount,
      });
    }
    // TOTA

    const shippingCost = Number(data.shipping_cost || 0);

    if (shippingCost < 0) {
      throw new Error("Shipping cost cannot be negative");
    }

    const totalAmount = subtotal + shippingCost;
    // PAYMEN

    const paidAmount = Number(data.paid_amount || 0);

    if (paidAmount < 0) {
      throw new Error("Paid amount cannot be negative");
    }

    if (paidAmount > totalAmount) {
      throw new Error("Paid amount cannot exceed total amount");
    }
    // PURCHASE NUMBE

    const purchaseNo = `PUR-${Date.now()}`;
    // CREATE PURCHAS

    const purchaseId = await purchaseRepository.create(
      connection,
      {
        purchase_no: purchaseNo,
        supplier_id: data.supplier_id,
        total_amount: totalAmount,
        paid_amount: paidAmount,
        payment_method: data.payment_method || null,
        shipping_cost: shippingCost,
        shipping_company: data.shipping_company || null,
        paid_date: paidAmount > 0 ? new Date() : null,
        remark: data.remark || null,
        status: "completed",
      },
      userId,
    );
    // DETAILS + STOC

    for (const item of items) {
      await purchaseRepository.createDetail(connection, {
        purchase_id: purchaseId,
        product_id: item.product_id,
        qty: item.qty,
        cost: item.cost,
        retail_price: item.retail_price,
        discount: item.discount,
        amount: item.amount,
      });

      const affectedRows = await purchaseRepository.updateStock(
        connection,
        item.product_id,
        item.qty,
      );

      if (affectedRows !== 1) {
        throw new Error(
          `Failed to update stock for product ${item.product_id}`,
        );
      }
    }
    // COMMI

    await connection.commit();

    return {
      id: purchaseId,
      purchase_no: purchaseNo,
      subtotal,
      shipping_cost: shippingCost,
      total_amount: totalAmount,
      paid_amount: paidAmount,
      remaining: totalAmount - paidAmount,
    };
  } catch (error) {
    await connection.rollback();

    throw error;
  } finally {
    connection.release();
  }
};
// GET PURCHASES
exports.getAll = async (filters) => {
  const connection = await db.getConnection();
  try {
    const page = Math.max(Number(filters.page) || 1, 1);
    const limit = Math.min(Number(filters.limit) || 10, 100);
    const result = await purchaseRepository.getAll(connection, {
      ...filters,
      page,
      limit,
    });

    return {
      data: result.rows,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  } finally {
    connection.release();
  }
};
// GET PURCHASE DETAIL
exports.getById = async (purchaseId) => {
  const connection = await db.getConnection();
  try {
    const purchase = await purchaseRepository.findById(connection, purchaseId);
    if (!purchase) {
      throw new Error("Purchase not found");
    }

    const items = await purchaseRepository.findDetails(connection, purchaseId);

    return {
      id: purchase.id,
      purchase_no: purchase.purchase_no,

      supplier: {
        id: purchase.supplier_id,
        name: purchase.supplier_name,
      },

      total_amount: purchase.total_amount,
      paid_amount: purchase.paid_amount,
      remaining: purchase.remaining,

      payment_method: purchase.payment_method,

      shipping_cost: purchase.shipping_cost,
      shipping_company: purchase.shipping_company,

      paid_date: purchase.paid_date,
      remark: purchase.remark,
      status: purchase.status,

      create_by: purchase.create_by,
      create_at: purchase.create_at,

      items,
    };
  } finally {
    connection.release();
  }
};
exports.update = async (purchaseId, data) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();
    // FIND OLD PURCHAS

    const oldPurchase = await purchaseRepository.findByIdForUpdate(
      connection,
      purchaseId,
    );

    if (!oldPurchase) {
      throw new Error("Purchase not found");
    }
    // CHECK STATU

    if (oldPurchase.status === "cancelled") {
      throw new Error("Cancelled purchase cannot be updated");
    }
    // CHECK SUPPLIE

    const supplier = await purchaseRepository.findSupplier(
      connection,
      data.supplier_id,
    );

    if (!supplier) {
      throw new Error("Supplier not found");
    }
    // CHECK ITEM

    if (!Array.isArray(data.items) || data.items.length === 0) {
      throw new Error("Purchase items are required");
    }
    // RESTORE OLD STOC

    const oldItems = await purchaseRepository.findDetails(
      connection,
      purchaseId,
    );

    for (const item of oldItems) {
      await purchaseRepository.updateStock(
        connection,
        item.product_id,
        -Number(item.qty),
      );
    }
    // CALCULATE NEW ITEM

    let subtotal = 0;
    const items = [];

    for (const item of data.items) {
      const product = await purchaseRepository.findProduct(
        connection,
        item.product_id,
      );

      if (!product) {
        throw new Error(`Product ${item.product_id} not found`);
      }

      const qty = Number(item.qty);
      const cost = Number(item.cost);
      const retailPrice = Number(item.retail_price);
      const discount = Number(item.discount || 0);

      if (qty <= 0) {
        throw new Error("Quantity must be greater than 0");
      }

      if (cost < 0) {
        throw new Error("Cost cannot be negative");
      }

      if (retailPrice < 0) {
        throw new Error("Retail price cannot be negative");
      }

      if (discount < 0) {
        throw new Error("Discount cannot be negative");
      }

      const amount = qty * cost - discount;

      if (amount < 0) {
        throw new Error("Discount cannot exceed item total");
      }

      subtotal += amount;

      items.push({
        product_id: product.id,
        qty,
        cost,
        retail_price: retailPrice,
        discount,
        amount,
      });
    }
    // TOTA

    const shippingCost = Number(data.shipping_cost || 0);

    if (shippingCost < 0) {
      throw new Error("Shipping cost cannot be negative");
    }

    const totalAmount = subtotal + shippingCost;
    // PAYMEN

    const paidAmount = Number(data.paid_amount || 0);

    if (paidAmount < 0) {
      throw new Error("Paid amount cannot be negative");
    }

    if (paidAmount > totalAmount) {
      throw new Error("Paid amount cannot exceed total amount");
    }
    // DELETE OLD DETAIL

    await purchaseRepository.deleteDetails(connection, purchaseId);
    // UPDATE PURCHAS

    await purchaseRepository.update(connection, purchaseId, {
      supplier_id: data.supplier_id,
      total_amount: totalAmount,
      paid_amount: paidAmount,
      payment_method: data.payment_method || null,
      shipping_cost: shippingCost,
      shipping_company: data.shipping_company || null,
      paid_date: paidAmount > 0 ? new Date() : null,
      remark: data.remark || null,
      status: data.status || "completed",
    });
    // CREATE NEW DETAILS + STOC

    for (const item of items) {
      await purchaseRepository.createDetail(connection, {
        purchase_id: purchaseId,
        product_id: item.product_id,
        qty: item.qty,
        cost: item.cost,
        retail_price: item.retail_price,
        discount: item.discount,
        amount: item.amount,
      });

      await purchaseRepository.updateStock(
        connection,
        item.product_id,
        item.qty,
      );
    }
    // COMMI

    await connection.commit();

    return {
      id: purchaseId,
      purchase_no: oldPurchase.purchase_no,
      subtotal,
      shipping_cost: shippingCost,
      total_amount: totalAmount,
      paid_amount: paidAmount,
      remaining: totalAmount - paidAmount,
    };
  } catch (error) {
    await connection.rollback();

    throw error;
  } finally {
    connection.release();
  }
};
// GET PURCHASE SUMMARY
exports.getSummary = async (filters) => {
  const connection = await db.getConnection();

  try {
    const summary = await purchaseRepository.getSummary(connection, filters);

    return {
      total_purchase: Number(summary.total_purchase),

      total_amount: Number(summary.total_amount),

      total_paid: Number(summary.total_paid),

      total_remaining: Number(summary.total_remaining),
    };
  } finally {
    connection.release();
  }
};
exports.getReport = async (filters) => {
  const connection = await db.getConnection();

  try {
    const type = filters.type || "daily";

    if (type !== "daily" && type !== "monthly") {
      throw new Error("Report type must be daily or monthly");
    }

    const rows = await purchaseRepository.getReport(connection, {
      ...filters,
      type,
    });

    return rows.map((row) => ({
      ...row,

      total_purchase: Number(row.total_purchase),

      total_amount: Number(row.total_amount),

      total_paid: Number(row.total_paid),

      total_remaining: Number(row.total_remaining),
    }));
  } finally {
    connection.release();
  }
};
