-- Add tax support to orders (used by the Settings feature)
-- Run after settings_migration.sql

ALTER TABLE orders
  ADD COLUMN tax_rate DECIMAL(5,2) NOT NULL DEFAULT 0 AFTER total_amount,
  ADD COLUMN tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0 AFTER tax_rate;
