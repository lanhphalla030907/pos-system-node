const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  generateProductBarcode,
  getTopSale,
  getSummary,
} = require("../controller/product.controller");

const { validate_token } = require("../controller/auth.controller");
const upload = require("../middleware/upload.middleware");
const { checkPermission } = require("../middleware/checkPermission");

module.exports = (app) => {
  app.get("/api/product", validate_token(), getProducts);
   app.get("/api/product/summary", validate_token(), getSummary);
  app.get("/api/product/top-sale", validate_token(), getTopSale);
  app.get(
    "/api/product/generate-barcode",
    validate_token(),
    generateProductBarcode,
  );
  app.get("/api/product/:id", validate_token(), getProduct);

  app.post(
    "/api/product",
    validate_token(),
    upload("products").single("image"),
    createProduct,
  );

  app.put(
    "/api/product/:id",
    validate_token(),
    upload("products").single("image"),
    updateProduct,
  );

  app.delete(
    "/api/product/:id",
    validate_token(),
    checkPermission("product.delete"),
    deleteProduct,
  );
};
