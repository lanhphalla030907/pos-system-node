const fs = require("fs");
const path = require("path");
const AppError = require("../util/AppError");
const settingsRepository = require("../repositories/settings.repository");

exports.getAll = async () => {
  return await settingsRepository.getAll();
};

exports.update = async (data, updatedBy) => {
  if (!data || typeof data !== "object") {
    throw new AppError("Invalid settings data", 400);
  }

  const allowedKeys = await settingsRepository.getAllKeys();

  const entries = Object.keys(data)
    .filter((key) => allowedKeys.includes(key))
    .map((key) => ({
      key,
      value: data[key] === null || data[key] === undefined ? "" : String(data[key]),
    }));

  if (!entries.length) {
    throw new AppError("No valid settings to update", 400);
  }

  await settingsRepository.updateBatch(entries, updatedBy);

  return await settingsRepository.getAll();
};

exports.uploadLogo = async (req) => {
  if (!req.file) {
    throw new AppError("Logo image is required", 400);
  }

  const oldLogo = await settingsRepository
    .getAll()
    .then((settings) => settings.store_logo || "");

  if (oldLogo) {
    const oldPath = path.join(__dirname, "../../uploads/settings", oldLogo);
    if (fs.existsSync(oldPath)) {
      fs.unlinkSync(oldPath);
    }
  }

  return req.file.filename;
};
