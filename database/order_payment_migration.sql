-- Migration: order payment system
-- Run this AFTER the payment_method and order_payment tables already exist.
-- The live schema is the source of truth (database/table.sql is stale).

-- 1. Make order_no unique so two cashiers can never create the same number.
--    Safe to run: the create-order flow inserts a temporary placeholder
--    order_no and then sets the final value from the AUTO_INCREMENT id inside
--    the same transaction, so concurrent inserts never collide.
ALTER TABLE orders
    ADD UNIQUE INDEX uq_orders_order_no (order_no);

-- 2. Keep orders.payment_method for backward compatibility (old UIs still read
--    it). New orders store a comma-joined summary of the payment method names
--    there, while the real payment data lives in order_payment.
--    Do NOT drop this column until all old code stops reading it.

-- 3. orders.paid is now set from the sum of order_payment.amount at creation.
--    No column change required.
