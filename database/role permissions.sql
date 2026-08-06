CREATE TABLE permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(150) NOT NULL UNIQUE,
    module VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    create_by INT NULL,
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
Example Data
name	code	module
View Product	product.view	Product
Create Product	product.create	Product
Update Product	product.update	Product
Delete Product	product.delete	Product


CREATE TABLE role_permission (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_id INT NOT NULL,
    permission_id INT NOT NULL,

    CONSTRAINT fk_role_permission_role
        FOREIGN KEY (role_id)
        REFERENCES roles(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_role_permission_permission
        FOREIGN KEY (permission_id)
        REFERENCES permissions(id)
        ON DELETE CASCADE,

    UNIQUE(role_id, permission_id)
);

INSERT INTO permissions(name,code,module)
VALUES

('View Dashboard','dashboard.view','Dashboard'),

('View Product','product.view','Product'),
('Create Product','product.create','Product'),
('Update Product','product.update','Product'),
('Delete Product','product.delete','Product'),

('View Category','category.view','Category'),
('Create Category','category.create','Category'),
('Update Category','category.update','Category'),
('Delete Category','category.delete','Category'),

('View Supplier','supplier.view','Supplier'),
('Create Supplier','supplier.create','Supplier'),
('Update Supplier','supplier.update','Supplier'),
('Delete Supplier','supplier.delete','Supplier'),

('View Customer','customer.view','Customer'),
('Create Customer','customer.create','Customer'),
('Update Customer','customer.update','Customer'),
('Delete Customer','customer.delete','Customer'),

('View Expense','expense.view','Expense'),
('Create Expense','expense.create','Expense'),
('Update Expense','expense.update','Expense'),
('Delete Expense','expense.delete','Expense'),

('View Expense Type','expense_type.view','Expense Type'),
('Create Expense Type','expense_type.create','Expense Type'),
('Update Expense Type','expense_type.update','Expense Type'),
('Delete Expense Type','expense_type.delete','Expense Type'),

('View Order','order.view','Order'),
('Create Order','order.create','Order'),

('View Report','report.view','Report'),

('View User','user.view','User'),
('Create User','user.create','User'),
('Update User','user.update','User'),
('Delete User','user.delete','User'),

('View Role','role.view','Role'),
('Create Role','role.create','Role'),
('Update Role','role.update','Role'),
('Delete Role','role.delete','Role');