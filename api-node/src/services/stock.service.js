const stockRepository = require("../repositories/stock.repository");
const { db } = require("../util/helper");
const telegramService = require("./telegram.service");
const notificationService = require("./notification.service");

exports.getLowStockProducts = async () => {
  const products = await stockRepository.getLowStockProducts();
  return products;
};
exports.checkLowStock = async () => {
  const products = await stockRepository.getLowStockProducts();
  if (products.length === 0) {
    return;
  }
  await telegramService.sendLowStockAlert(products);

  try {
    await notificationService.notifyLowStock(products);
  } catch (error) {
    console.error("Stock notification failed:", error.message);
  }
};
exports.getStockMovement = async (year) => {
  return await stockRepository.getStockMovement(year);
};
exports.getHistory = async (filters) => {
  const page = Math.max(Number(filters.page) || 1, 1);
  const limit = Math.min(Number(filters.limit) || 10, 100);
  const connection = await db.getConnection();
  try {
    const result = await stockRepository.getHistory({
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
exports.getInventoryValue = async () => {
    const result = await stockRepository.getInventoryValue();
    return result;
};