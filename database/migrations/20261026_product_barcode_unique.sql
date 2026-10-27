-- Product Barcode Unique Index Migration
--
-- Forward-only and non-destructive.
-- Adds a unique index on product.barcode so duplicate barcodes are prevented
-- at the database level.
--
-- Before applying this migration in a database containing existing records,
-- verify that no duplicate barcodes exist:
--   SELECT barcode, COUNT(*) AS count
--   FROM product
--   WHERE barcode IS NOT NULL AND barcode != ''
--   GROUP BY barcode
--   HAVING count > 1;
--
-- Apply once against the application database:
--   mysql -u <user> -p <database> < database/migrations/20261026_product_barcode_unique.sql

SET @schema_name = DATABASE();

SET @index_exists = (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = @schema_name
    AND TABLE_NAME = 'product'
    AND INDEX_NAME = 'idx_product_barcode_unique'
);

SET @sql = IF(
  @index_exists = 0,
  'ALTER TABLE `product` ADD UNIQUE INDEX `idx_product_barcode_unique` (`barcode`)',
  'SELECT 1'
);

PREPARE statement FROM @sql;
EXECUTE statement;
DEALLOCATE PREPARE statement;
