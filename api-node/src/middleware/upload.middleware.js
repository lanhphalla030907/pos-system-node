const multer = require("multer");
const AppError = require("../util/AppError");
const { validateImageFile } = require("../services/storage/image-validation.service");

const MAX_FILE_SIZE = 3 * 1024 * 1024;
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/jpg", "image/png"];

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    return cb(
      new AppError("Only JPG, JPEG and PNG images are allowed", 400),
      false,
    );
  }
  cb(null, true);
};

const createMulter = () =>
  multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: MAX_FILE_SIZE,
      files: 1,
    },
    fileFilter,
  });

// Validates the real file signature before any service can upload it. Files are
// kept in memory so a rejected upload never touches the server filesystem.
const validateUploadedImage = (folder) => (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    validateImageFile(req.file);
    req.uploadFolder = folder;
    next();
  } catch (error) {
    next(error);
  }
};

const upload = (folder) => {
  return {
    single: (fieldName) => [
      createMulter().single(fieldName),
      validateUploadedImage(folder),
    ],
  };
};

module.exports = upload;
module.exports.MAX_FILE_SIZE = MAX_FILE_SIZE;
module.exports.ALLOWED_FILE_TYPES = ALLOWED_FILE_TYPES;
