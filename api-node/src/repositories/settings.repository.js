const { db } = require("../util/helper");

// GET ALL SETTINGS (key -> value map)
exports.getAll = async () => {
  const sql = `
    SELECT setting_key, setting_value
    FROM settings
  `;

  const [rows] = await db.query(sql);

  const result = {};
  rows.forEach((row) => {
    result[row.setting_key] = row.setting_value;
  });

  return result;
};

// GET SETTING KEYS ONLY (used for validation)
exports.getAllKeys = async () => {
  const sql = `SELECT setting_key FROM settings`;

  const [rows] = await db.query(sql);
  return rows.map((row) => row.setting_key);
};

// UPSERT MULTIPLE SETTINGS
exports.updateBatch = async (entries, updatedBy) => {
  if (!entries.length) return 0;

  const placeholders = entries.map(() => "(?, ?, ?)").join(", ");
  const params = entries.flatMap(({ key, value }) => [
    key,
    value,
    updatedBy || null,
  ]);

  const sql = `
    INSERT INTO settings (setting_key, setting_value, updated_by)
    VALUES ${placeholders}
    ON DUPLICATE KEY UPDATE
      setting_value = VALUES(setting_value),
      updated_by = VALUES(updated_by)
  `;

  const [result] = await db.query(sql, params);
  return result.affectedRows;
};
