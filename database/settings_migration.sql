-- Settings feature migration
-- Run this after table.sql, relationship table.sql and role permissions.sql

CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT NULL,
    updated_by INT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_settings_updated_by FOREIGN KEY (updated_by) REFERENCES user(id) ON DELETE SET NULL
);

INSERT INTO settings (setting_key, setting_value) VALUES
-- General
('store_name', 'Phone Store'),
('currency', 'USD'),
('currency_rate', '4000'),
('tax_rate', '0'),
('default_language', 'English'),
('timezone', 'Asia/Phnom_Penh'),
('low_stock_threshold', '5'),
-- Store info
('store_logo', ''),
('store_phone', ''),
('store_email', ''),
('store_address', ''),
('store_description', ''),
('business_registration', ''),
-- Receipt
('receipt_header', 'Thank you for shopping with us!'),
('receipt_footer', 'Have a nice day!'),
('receipt_show_logo', '1'),
('receipt_show_tax', '1'),
('receipt_show_discount', '1'),
('receipt_show_change', '1'),
-- Notifications
('telegram_enabled', '0'),
('telegram_bot_token', ''),
('telegram_chat_id', ''),
('low_stock_alert', '1'),
('sale_alert', '0'),
-- Security
('allow_registration', '1'),
('session_timeout_minutes', '60'),
('max_login_attempts', '5')
ON DUPLICATE KEY UPDATE setting_key = setting_key;
