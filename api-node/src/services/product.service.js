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
  return await productRepository.create(data, user);
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
