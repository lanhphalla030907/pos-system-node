const fs = require("fs");
const path = require("path");
const productRepository = require("../repositories/product.repository");
const AppError = require("../util/AppError");

exports.getProducts = async (filter) => {
  return await productRepository.getAll(filter);
};

exports.getProductById = async (id) => {
  const product = await productRepository.getById(id);
  if (!product) {
    throw new AppError("Product not found", 404);
  }
  return product;
};

exports.createProduct = async (data, user) => {
  const {
    category_id,
    barcode,
    name,
    brand,
    description,
    qty,
    min_stock,
    price,
    cost_price,
    discount,
    status,
    image,
  } = data;
  // RQUIRED
  if (!name || !name.trim()) {
    throw new AppError("Product name is required", 400);
  }
  if (!category_id) {
    throw new AppError("Category is required", 400);
  }
  // NUMBER VALIDATION
  const productQty = Number(qty);
  const minimumStock = Number(min_stock);
  const productPrice = Number(price);
  const productCostPrice = Number(cost_price);
  const productDiscount = Number(discount || 0);
  if (!Number.isFinite(productQty) || productQty < 0) {
    throw new AppError("Quantity cannot be less than 0", 400);
  }
  if (!Number.isFinite(minimumStock) || minimumStock < 0) {
    throw new AppError("Minimum stock cannot be less than 0", 400);
  }
  if (!Number.isFinite(productPrice) || productPrice < 0) {
    throw new AppError("Price cannot be less than 0", 400);
  }
  if (!Number.isFinite(productCostPrice) || productCostPrice < 0) {
    throw new AppError("Cost price cannot be less than 0", 400);
  }
  if (
    !Number.isFinite(productDiscount) ||
    productDiscount < 0 ||
    productDiscount > 100
  ) {
    throw new AppError("Discount must be between 0 and 100", 400);
  }
  // BUSINESS RULE
  if (productCostPrice > productPrice) {
    throw new AppError("Cost price cannot be greater than selling price", 400);
  }
  // CREATE
  return await productRepository.create(
    {
      ...data,
      qty: productQty,
      min_stock: minimumStock,
      price: productPrice,
      cost_price: productCostPrice,
      discount: productDiscount,
    },
    user,
  );
};

exports.updateProduct = async (id, data) => {
  const existProduct = await productRepository.getById(id);
  if (!existProduct) {
    throw new AppError("Product not found", 404);
  }

  // if have new upload it will delete the old photo
  if (data.image && existProduct.image) {
    const oldImagePath = path.join(
      __dirname,
      `../../uploads/products/${existProduct.image}`,
    );
    if (fs.existsSync(oldImagePath)) {
      fs.unlinkSync(oldImagePath);
    }
  } else if (!data.image) {
    // if no upload it will use the old photo
    data.image = existProduct.image;
  }

  return await productRepository.update(id, data);
};
exports.generateBarcode = async () => {
  const lastNumber = await productRepository.getLastBarcodeNumber();
  const nextNumber = lastNumber + 1;
  const barcode = "BAR-" + String(nextNumber).padStart(6, "0");
  return barcode;
};
exports.deleteProduct = async (id) => {
  const product = await productRepository.getById(id);
  if (!product) {
    throw new AppError("Product not found", 404);
  }

  // delete the photo after the product has delete
  if (product.image) {
    const imagePath = path.join(
      __dirname,
      `../../uploads/products/${product.image}`,
    );
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  }
  await productRepository.remove(id);
  return true;
};
exports.getTopSale = async (query) => {
  return await productRepository.getTopSale(query);
};
exports.getSummary = async () => {
  return await productRepository.getSummary();
};
