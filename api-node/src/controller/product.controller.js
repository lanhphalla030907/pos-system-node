const productService = require("../services/product.service");

const asyncHandler = require("../middleware/asyncHandler");

exports.getProducts = asyncHandler(async (req, res) => {
  const filter = {
    search: req.query.search || "",
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 10,
    category_id: req.query.category_id || "",
    status: req.query.status || "",
    stock_status: req.query.stock_status || "",
  };

  const result = await productService.getProducts(filter);
  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
});

exports.getProduct = asyncHandler(async (req, res) => {
  const data = await productService.getProductById(req.params.id);

  res.json({
    success: true,
    data,
  });
});

exports.createProduct = asyncHandler(async (req, res) => {
  const data = {
    ...req.body,
    image: req.file ? req.file.filename : null,
  };
  const id = await productService.createProduct(data, req.current_name);
  res.status(201).json({
    success: true,
    id,
  });
});

exports.updateProduct = asyncHandler(async (req, res) => {
  const data = {
    ...req.body,
  };
  if (req.file) {
    data.image = req.file.filename;
  }
  await productService.updateProduct(req.params.id, data);
  res.json({
    success: true,
    message: "Product updated successfully",
  });
});

exports.deleteProduct = asyncHandler(async (req, res) => {
  await productService.deleteProduct(req.params.id);

  res.json({
    success: true,
    message: "Product deleted",
  });
});
exports.generateProductBarcode = asyncHandler(async (req, res) => {
  const barcode = await productService.generateBarcode();
  res.json({
    success: true,
    barcode,
  });
});
exports.getTopSale = asyncHandler(async (req, res) => {
  const data = await productService.getTopSale(req.query);
  res.json({
    success: true,
    message: "Get top sale products successfully",
    data,
  });
});
exports.getSummary = asyncHandler(async (req, res) => {

    const data = await productService.getSummary();

    res.json({
        success: true,
        message: "Get product summary successfully",
        data,
    });

});