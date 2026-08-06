ALTER TABLE product
ADD CONSTRAINT fk_product_category
FOREIGN KEY (category_id) REFERENCES category(id);

ALTER TABLE product_image
ADD CONSTRAINT fk_product_image_product
FOREIGN KEY (product_id) REFERENCES product(id);

ALTER TABLE orders
ADD CONSTRAINT fk_orders_customer
FOREIGN KEY (customer_id) REFERENCES customer(id);

ALTER TABLE orders
ADD CONSTRAINT fk_orders_user
FOREIGN KEY (user_id) REFERENCES `user`(id);


ALTER TABLE order_detail
ADD CONSTRAINT fk_order_detail_order
FOREIGN KEY (order_id) REFERENCES orders(id);

ALTER TABLE order_detail
ADD CONSTRAINT fk_order_detail_product
FOREIGN KEY (product_id) REFERENCES product(id);

ALTER TABLE purchase
ADD CONSTRAINT fk_purchase_supplier
FOREIGN KEY (supplier_id) REFERENCES supplier(id);

ALTER TABLE purchase_product
ADD CONSTRAINT fk_purchase_product_purchase
FOREIGN KEY (purchase_id) REFERENCES purchase(id);

ALTER TABLE purchase_product
ADD CONSTRAINT fk_purchase_product_product
FOREIGN KEY (product_id) REFERENCES product(id);

ALTER TABLE expense
ADD CONSTRAINT fk_expense_expense_type
FOREIGN KEY (expense_type_id) REFERENCES expense_type(id);