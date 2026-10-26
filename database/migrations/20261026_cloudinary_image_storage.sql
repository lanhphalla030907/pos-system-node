-- Cloudinary image storage migration
--
-- Forward-only and non-destructive. Existing image values are left untouched:
--   * legacy local filenames continue to work through /uploads
--   * new uploads persist the Cloudinary delivery URL in `image`/`store_logo`
--     and the Cloudinary public_id in the new `image_public_id` column or the
--     `store_logo_public_id` settings key.
--
-- Apply once against the application database after taking a backup:
--   mysql -u <user> -p <database> < database/migrations/20261026_cloudinary_image_storage.sql

SET @schema_name = DATABASE();

-- product.image_public_id
SET @column_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name
    AND TABLE_NAME = 'product'
    AND COLUMN_NAME = 'image_public_id'
);
SET @sql = IF(
  @column_exists = 0,
  'ALTER TABLE `product` ADD COLUMN `image_public_id` VARCHAR(255) NULL DEFAULT NULL AFTER `image`',
  'SELECT 1'
);
PREPARE statement FROM @sql;
EXECUTE statement;
DEALLOCATE PREPARE statement;

-- employee.image_public_id
SET @column_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name
    AND TABLE_NAME = 'employee'
    AND COLUMN_NAME = 'image_public_id'
);
SET @sql = IF(
  @column_exists = 0,
  'ALTER TABLE `employee` ADD COLUMN `image_public_id` VARCHAR(255) NULL DEFAULT NULL AFTER `image`',
  'SELECT 1'
);
PREPARE statement FROM @sql;
EXECUTE statement;
DEALLOCATE PREPARE statement;

-- Internal settings key used to track the current store logo asset. The
-- settings table is key/value, so no new column is required.
INSERT INTO `settings` (`setting_key`, `setting_value`)
VALUES ('store_logo_public_id', '')
ON DUPLICATE KEY UPDATE `setting_key` = VALUES(`setting_key`);
