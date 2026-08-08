const purchaseService = require("../services/purchase.service");
const asyncHandler = require("../middleware/asyncHandler");
// CREATE PURCHASE
exports.create = asyncHandler(async (req, res) => {
  const data = await purchaseService.create(req.body, req.current_id)
  res.status(201).json({
    success: true,
    message: "Purchase created successfully",
    data,
  });
});
// GET PURCHASES
exports.getAll = asyncHandler(async (req, res) => {
    const result = await purchaseService.getAll(
        req.query
    );
    res.json({
        success: true,
        message: "Get purchases successfully",
        ...result,
    });
});
// GET PURCHASE DETAIL
exports.getById = asyncHandler(async (req, res) => {

    const purchaseId = Number(req.params.id);

    const data = await purchaseService.getById(
        purchaseId
    );

    res.json({
        success: true,
        message: "Get purchase detail successfully",
        data,
    });
});
// UPDATE PURCHASE
exports.update = asyncHandler(async (req, res) => {
    const purchaseId =
        Number(req.params.id);
    const data =
        await purchaseService.update(
            purchaseId,
            req.body
        );
    res.json({
        success: true,
        message: "Purchase updated successfully",
        data,
    });
});
// GET PURCHASE SUMMARY
exports.getSummary = asyncHandler(async (req, res) => {
    const data =
        await purchaseService.getSummary(
            req.query
        );
    res.json({
        success: true,
        message: "Get purchase summary successfully",
        data,
    });
});
exports.getReport = asyncHandler(async (req, res) => {
    const data =
        await purchaseService.getReport(
            req.query
        );
    res.json({
        success: true,
        message: "Get purchase report successfully",
        data,
    });
});