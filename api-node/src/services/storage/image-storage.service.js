const fs = require("fs");
const path = require("path");
const AppError = require("../../util/AppError");
const cloudinaryService = require("./cloudinary.service");
const { validateImageFile } = require("./image-validation.service");

const UPLOAD_ROOT = path.join(__dirname, "../../../uploads");

const FOLDER_CONFIG = {
  products: { local: "products" },
  employee: { local: "employee" },
  settings: { local: "settings" },
};

const getCloudinaryFolder = (folderKey) => {
  const config = FOLDER_CONFIG[folderKey];
  if (!config) {
    throw new AppError("Unsupported image storage folder", 500);
  }

  const prefix = (process.env.CLOUDINARY_FOLDER_PREFIX || "pos")
    .trim()
    .replace(/^\/+|\/+$/g, "");

  return prefix ? `${prefix}/${config.local}` : config.local;
};

const getLocalFolder = (folderKey) => {
  const config = FOLDER_CONFIG[folderKey];
  if (!config) {
    throw new AppError("Unsupported image storage folder", 500);
  }
  return path.join(UPLOAD_ROOT, config.local);
};

const isLegacyLocalReference = (reference) => {
  if (!reference || typeof reference !== "string") return false;
  if (/^[a-z][a-z0-9+.-]*:/i.test(reference)) return false;
  if (reference.includes("/") || reference.includes("\\")) return false;
  if (reference === "." || reference === "..") return false;
  return path.basename(reference) === reference;
};

const uploadImage = async (file, folderKey) => {
  validateImageFile(file);

  const uploaded = await cloudinaryService.uploadBuffer(file.buffer, {
    folder: getCloudinaryFolder(folderKey),
    mimetype: file.mimetype,
  });

  return {
    image: uploaded.url,
    publicId: uploaded.publicId,
  };
};

const deleteLocalImage = async (reference, folderKey) => {
  const folder = getLocalFolder(folderKey);
  const filePath = path.join(folder, reference);

  // Defence in depth: never allow a DB value to escape the upload folder.
  if (path.dirname(filePath) !== folder) {
    throw new Error("Refusing to delete a path outside the upload folder");
  }

  try {
    await fs.promises.unlink(filePath);
    return { deleted: true, type: "local" };
  } catch (error) {
    if (error.code === "ENOENT") {
      return { deleted: false, type: "local", reason: "not_found" };
    }
    throw error;
  }
};

const deleteImage = async ({ image, publicId, folderKey } = {}) => {
  if (publicId) {
    await cloudinaryService.destroy(publicId);
    return { deleted: true, type: "cloudinary" };
  }

  if (isLegacyLocalReference(image)) {
    return await deleteLocalImage(image, folderKey);
  }

  if (image) {
    return {
      deleted: false,
      skipped: true,
      reason: "no_cloudinary_public_id",
    };
  }

  return { deleted: false, skipped: true, reason: "no_image" };
};

const safeDeleteImage = async (reference, context = "image cleanup") => {
  try {
    const result = await deleteImage(reference);
    if (result.skipped && reference?.image) {
      console.warn("[image-storage] cleanup skipped", {
        context,
        reason: result.reason,
        image: reference.image,
      });
    }
    return result;
  } catch (error) {
    console.error("[image-storage] cleanup failed", {
      context,
      publicId: reference?.publicId || null,
      image: reference?.image || null,
      error: error.message,
      providerCode: error.cause?.http_code || error.cause?.code || error.code,
      // Retry manually in Cloudinary using the logged public_id, or run the
      // orphan cleanup procedure documented in api-node/README.md.
    });
    return { deleted: false, error };
  }
};

const resolveImageUrl = (reference) => {
  if (!reference) return null;
  if (typeof reference === "string") {
    return reference;
  }

  if (reference.image) {
    return reference.image;
  }

  if (reference.publicId) {
    return cloudinaryService.resolveUrl(reference.publicId);
  }

  return null;
};

module.exports = {
  FOLDER_CONFIG,
  UPLOAD_ROOT,
  getCloudinaryFolder,
  getLocalFolder,
  isLegacyLocalReference,
  uploadImage,
  deleteImage,
  safeDeleteImage,
  resolveImageUrl,
};
