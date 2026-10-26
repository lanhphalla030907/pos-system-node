const AppError = require("../../util/AppError");

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
]);

const PNG_SIGNATURE = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);

const isJpeg = (buffer) =>
  buffer.length >= 4 &&
  buffer[0] === 0xff &&
  buffer[1] === 0xd8 &&
  buffer[2] === 0xff;

const isPng = (buffer) => {
  if (buffer.length < 24) return false;
  if (!buffer.subarray(0, 8).equals(PNG_SIGNATURE)) return false;
  if (buffer.toString("ascii", 12, 16) !== "IHDR") return false;

  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  return width > 0 && height > 0;
};

const normalizeMimeType = (mimetype) =>
  String(mimetype || "").toLowerCase() === "image/jpg"
    ? "image/jpeg"
    : String(mimetype || "").toLowerCase();

const validateImageFile = (file) => {
  if (!file || !file.buffer) {
    throw new AppError("Image file is required", 400);
  }

  if (!Buffer.isBuffer(file.buffer) || file.buffer.length === 0) {
    throw new AppError("Uploaded image is empty", 400);
  }

  const declaredMimeType = normalizeMimeType(file.mimetype);
  if (!ALLOWED_MIME_TYPES.has(declaredMimeType)) {
    throw new AppError("Only JPG, JPEG and PNG images are allowed", 400);
  }

  const matchesDeclaredType =
    (declaredMimeType === "image/jpeg" && isJpeg(file.buffer)) ||
    (declaredMimeType === "image/png" && isPng(file.buffer));

  if (!matchesDeclaredType) {
    throw new AppError(
      "Uploaded file is not a valid JPG or PNG image",
      400,
    );
  }

  return true;
};

module.exports = {
  ALLOWED_MIME_TYPES,
  normalizeMimeType,
  validateImageFile,
};
