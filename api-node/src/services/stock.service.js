const stockRepository = require("../repositories/stock.repository");
const telegramService = require("./telegram.service");
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
};
exports.getStockMovement = async (year) => {
    return await stockRepository.getStockMovement(year);
};