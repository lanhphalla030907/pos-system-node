const asyncHandler = require("../middleware/asyncHandler");
const supplierService = require("../services/supplier.service");
exports.getSupplier = asyncHandler(async (req, res) => {
  const suppliers = await supplierService.getAllSuppliers(req.query);
  res.json({
    success: true,
    data: suppliers,
  });
});
exports.createSupplier = asyncHandler(async (req, res) => {
  const id = await supplierService.createSupplier(req.body, req.current_name);
  res.status(201).json({
    success: true,
    message: "Supplier created successfully",
    id,
  });
});
exports.updateSupplier = asyncHandler(async (req, res) => {
  await supplierService.updateSupplier(req.params.id, req.body);
  res.json({
    success: true,
    message: "Supplier updated successfully",
  });
});
exports.deleteSupplier = asyncHandler(async (req, res) => {
  await supplierService.deleteSupplier(
    req.params.id
  );
  res.json({
    success: true,
    message: "Supplier deleted successfully",
  });
});
