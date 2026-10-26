const productRepository = require("../repositories/product.repository");
const imageStorage = require("./storage/image-storage.service");
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

exports.createProduct = async (data, user, file) => {
  const {
    category_id,
    name,
    qty,
    min_stock,
    price,
    cost_price,
    discount,
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
  let uploadedImage = null;
  if (file) {
    uploadedImage = await imageStorage.uploadImage(file, "products");
  }

  try {
    return await productRepository.create(
      {
        ...data,
        image: uploadedImage ? uploadedImage.image : null,
        image_public_id: uploadedImage ? uploadedImage.publicId : null,
        qty: productQty,
        min_stock: minimumStock,
        price: productPrice,
        cost_price: productCostPrice,
        discount: productDiscount,
      },
      user,
    );
  } catch (error) {
    if (uploadedImage) {
      await imageStorage.safeDeleteImage(
        {
          image: uploadedImage.image,
          publicId: uploadedImage.publicId,
          folderKey: "products",
        },
        "product create rollback",
      );
    }
    throw error;
  }
};

exports.updateProduct = async (id, data, file) => {
  const existProduct = await productRepository.getById(id);
  if (!existProduct) {
    throw new AppError("Product not found", 404);
  }

  let uploadedImage = null;
  if (file) {
    uploadedImage = await imageStorage.uploadImage(file, "products");
    data.image = uploadedImage.image;
    data.image_public_id = uploadedImage.publicId;
  } else {
    // No new upload: keep the existing image reference untouched.
    data.image = existProduct.image;
    data.image_public_id = existProduct.image_public_id || null;
  }

  let affectedRows;
  try {
    affectedRows = await productRepository.update(id, data);
  } catch (error) {
    if (uploadedImage) {
      await imageStorage.safeDeleteImage(
        {
          image: uploadedImage.image,
          publicId: uploadedImage.publicId,
          folderKey: "products",
        },
        "product update rollback",
      );
    }
    throw error;
  }

  // The new reference is committed before the previous asset is removed.
  if (uploadedImage) {
    await imageStorage.safeDeleteImage(
      {
        image: existProduct.image,
        publicId: existProduct.image_public_id || null,
        folderKey: "products",
      },
      `product ${id} image replacement`,
    );
  }

  return affectedRows;
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

  // Delete the database row first. If that fails, the image stays intact.
  await productRepository.remove(id);

  await imageStorage.safeDeleteImage(
    {
      image: product.image,
      publicId: product.image_public_id || null,
      folderKey: "products",
    },
    `product ${id} deletion`,
  );

  return true;
};
exports.getTopSale = async (query) => {
  return await productRepository.getTopSale(query);
};
exports.getSummary = async () => {
  return await productRepository.getSummary();
};
