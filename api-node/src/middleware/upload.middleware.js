const multer = require("multer");
const path = require("path");
const AppError = require("../util/AppError");
const MAX_FILE_SIZE = 3 * 1024 * 1024; 
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/jpg", "image/png"];
// Create storage dynamically
const storage = (folder) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, `uploads/${folder}`);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const extension = path.extname(file.originalname);
      cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
    },
  });
}
const fileFilter = (req, file, cb) => {
  if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    return cb(
      new AppError("Only JPG, JPEG and PNG images are allowed", 400),
      false,
    );
  }
  cb(null, true);
};
// Reusable upload function
const upload = (folder) => {
  return multer({
    storage: storage(folder),
    limits: {
      fileSize: MAX_FILE_SIZE,
    },
    fileFilter,
  });
};
module.exports = upload;




// Usage
// const upload = require("../middleware/upload.middleware");
// router.post(
//     "/",
//     upload("products").single("image"),
//     productController.createProduct
// );