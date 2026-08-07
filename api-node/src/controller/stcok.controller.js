const asyncHandler = require("../middleware/asyncHandler");
const stockService = require("../services/stock.service");

exports.getLowStock = asyncHandler(async (req, res) => {
  const data = await stockService.getLowStockProducts();

  res.json({
    success: true,
    message: "Get low stock products successfully",
    data,
  });
});
exports.testAlert = asyncHandler(async (req, res) => {
  await stockService.checkLowStock();

  res.json({
    success: true,
    message: "Alert sent",
  });
});
exports.getStockMovement = asyncHandler(async (req, res) => {

    const year = Number(req.query.year) || new Date().getFullYear();

    const data = await stockService.getStockMovement(year);

    res.json({
        success: true,
        message: "Get stock movement successfully",
        data
    });

});
