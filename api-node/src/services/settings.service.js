const AppError = require("../util/AppError");
const settingsRepository = require("../repositories/settings.repository");
const imageStorage = require("./storage/image-storage.service");

// Internal identifiers are never returned through the public settings API.
const INTERNAL_SETTING_KEYS = ["store_logo_public_id"];

const toPublicSettings = (settings) => {
  const result = { ...settings };
  INTERNAL_SETTING_KEYS.forEach((key) => delete result[key]);
  return result;
};

const normalizeSetting = (value) =>
  value === null || value === undefined ? "" : String(value);

exports.getAll = async () => {
  return toPublicSettings(await settingsRepository.getAll());
};

exports.update = async (data, updatedBy) => {
  if (!data || typeof data !== "object") {
    throw new AppError("Invalid settings data", 400);
  }

  const currentSettings = await settingsRepository.getAll();
  const allowedKeys = await settingsRepository.getAllKeys();

  const entries = Object.keys(data)
    .filter(
      (key) =>
        allowedKeys.includes(key) && !INTERNAL_SETTING_KEYS.includes(key),
    )
    .map((key) => ({
      key,
      value: normalizeSetting(data[key]),
    }));

  if (!entries.length) {
    throw new AppError("No valid settings to update", 400);
  }

  const logoChanged =
    Object.prototype.hasOwnProperty.call(data, "store_logo") &&
    normalizeSetting(data.store_logo) !==
      normalizeSetting(currentSettings.store_logo);

  if (logoChanged) {
    // The settings update endpoint only accepts a string logo value, never a
    // Cloudinary public_id. Clear the stale identifier so it can never delete
    // an unrelated asset later.
    entries.push({ key: "store_logo_public_id", value: "" });
  }

  await settingsRepository.updateBatch(entries, updatedBy);

  if (logoChanged) {
    await imageStorage.safeDeleteImage(
      {
        image: currentSettings.store_logo,
        publicId: currentSettings.store_logo_public_id || null,
        folderKey: "settings",
      },
      "store logo removal/replacement",
    );
  }

  return toPublicSettings(await settingsRepository.getAll());
};

exports.uploadLogo = async (req) => {
  if (!req.file) {
    throw new AppError("Logo image is required", 400);
  }

  const currentSettings = await settingsRepository.getAll();
  const uploadedImage = await imageStorage.uploadImage(req.file, "settings");

  try {
    await settingsRepository.updateBatch(
      [
        { key: "store_logo", value: uploadedImage.image },
        { key: "store_logo_public_id", value: uploadedImage.publicId },
      ],
      req.current_id,
    );
  } catch (error) {
    await imageStorage.safeDeleteImage(
      {
        image: uploadedImage.image,
        publicId: uploadedImage.publicId,
        folderKey: "settings",
      },
      "store logo upload rollback",
    );
    throw error;
  }

  // The new logo is persisted before the previous asset is removed.
  await imageStorage.safeDeleteImage(
    {
      image: currentSettings.store_logo,
      publicId: currentSettings.store_logo_public_id || null,
      folderKey: "settings",
    },
    "store logo replacement",
  );

  return uploadedImage.image;
};
