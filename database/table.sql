CREATE TABLE user (
    id int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
    role_id int(11) DEFAULT NOT NULL,
    name varchar(50) DEFAULT NULL,
    username varchar(200) NOT NUll UNIQUE,
    password varchar(200) DEFAULT NULL,
    is_active tinyint(1) DEFAULT NULL,
    create_by varchar(120) DEFAULT NUll,
    create_at timestamp NOT NULL DEFAULT current_timestamp()
)



CREATE TABLE customer (
    id int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
    name varchar(50) NOT NULL,
    tel varchar(18) NOT NULL UNIQUE,
    email varchar(120) DEFAULT NUll,
    address text DEFAULT NUll,
    type varchar(120) DEFAULT NUll,
    create_by varchar(120) DEFAULT NUll,
    create_at timestamp NOT NULL DEFAULT current_timestamp()
)



CREATE TABLE suppiler (
    id int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
    name varchar(50) NOT NULL,
    code varchar(18) NOT NULL UNIQUE,
    tel varchar(18) NOT NULL UNIQUE,
    email varchar(120) DEFAULT NUll,
    address text DEFAULT NUll,
    website varchar(120) DEFAULT NUll,
    note text DEFAULT NUll,
    create_by varchar(120) DEFAULT NUll,
    create_at timestamp NOT NULL DEFAULT current_timestamp()
)

CREATE TABLE product (
    id int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
    category_id int(11) NOT NULL,
    barcode varchar(100) NOT NULL,
    name varchar(50) NOT NULL,
    brand varchar(100) NOT NULL,
    description text DEFAULT NUll,
    qty int(6) DEFAULT 0 NOT NULL,
    price decimal(6,2) DEFAULT 0 NOT NULL,
    discount decimal(3,2) DEFAULT 0 NOT NULL,
    status tinyint(1) DEFAULT 0, 
    image varchar(255) DEFAULT NUll,
    create_by varchar(120) DEFAULT NUll,
    create_at timestamp NOT NULL DEFAULT current_timestamp()
)

CREATE TABLE category (
    id int(11) NOT NULL,
    name varchar(255) NOT NULL,
    description text DEFAULt NUll,llllll
    status tinyint(1) NOT NULL,
    create_at timestamp NOT NULL DEFAULT current_timestamp()
);
CREATE TABLE brand (
    id int(11) NOT NULL,
    name varchar(255) NOT NULL,
    description text DEFAULt NUll,llllll
    status tinyint(1) NOT NULL,
    create_at timestamp NOT NULL DEFAULT current_timestamp()
);

CREATE TABLE orders (
    id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    order_no VARCHAR(120) NOT NULL,
    customer_id INT(11) DEFAULT NULL,
    user_id INT(11) DEFAULT NULL,
    paid DECIMAL(7,2) NOT NULL DEFAULT 0,
    payment_method VARCHAR(120) NOT NULL,
    remark TEXT DEFAULT NULL,
    create_by VARCHAR(120) DEFAULT NULL,
    create_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_detail (
    id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    order_id INT(11),
    product_id INT(11),
    qty INT(6) DEFAULT 0,
    price DECIMAL(7,2) DEFAULT 0,
    discount DECIMAL(7,2) DEFAULT 0,
    total DECIMAL(7,2) DEFAULT 0
);

CREATE TABLE product_image (
    id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    product_id INT(11),
    image VARCHAR(255) NOT NULL
);

CREATE TABLE purchase (
    id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    supplier_id INT(11),
    ref VARCHAR(255) NOT NULL,
    shipp_cost DECIMAL(7,2) DEFAULT 0,
    shipp_company VARCHAR(120) DEFAULT NULL,
    paid_amount DECIMAL(7,2) DEFAULT 0,
    paid_date DATETIME,
    status VARCHAR(100) DEFAULT NULL,
    create_by VARCHAR(120) DEFAULT NULL,
    create_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE purchase_product (
    id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    purchase_id INT(11),
    product_id INT(11),
    qty INT(11) DEFAULT 0,
    cost DECIMAL(7,2) DEFAULT 0,
    discount DECIMAL(7,2) DEFAULT 0,
    retail_price DECIMAL(7,2) DEFAULT 0,
    amount DECIMAL(7,2) DEFAULT 0,
    paid_date DATETIME,
    remark TEXT DEFAULT NULL,
    status VARCHAR(100) DEFAULT NULL,
    create_by VARCHAR(120) DEFAULT NULL,
    create_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE expense_type (
    id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(255) NOT NULL
);

CREATE TABLE expense (
    id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    expense_type_id INT(11),
    ref_no VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    amount DECIMAL(7,2) DEFAULT 0,
    remark TEXT DEFAULT NULL,
    expense_date DATETIME,
    create_by VARCHAR(120) DEFAULT NULL,
    create_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE position (
    id INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(100) NOT NULL UNIQUE,

    description VARCHAR(255) NULL,

    status TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1=Active,0=Inactive',

    create_by INT NULL,

    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    update_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_position_create_by
        FOREIGN KEY (create_by)
        REFERENCES user(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);
CREATE TABLE employee (
    id INT AUTO_INCREMENT PRIMARY KEY,

    code VARCHAR(30) NOT NULL UNIQUE,

    name VARCHAR(100) NOT NULL,

    gender ENUM('Male','Female','Other') DEFAULT 'Male',

    dob DATE NULL,

    phone VARCHAR(20) NOT NULL,

    email VARCHAR(100),

    address TEXT,

    position_id INT NOT NULL,

    salary DECIMAL(12,2) DEFAULT 0,

    hire_date DATE NOT NULL,

    status TINYINT(1) DEFAULT 1,

    image VARCHAR(255),

    user_id INT NULL,

    create_by INT NULL,

    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    update_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_employee_position
        FOREIGN KEY (position_id)
        REFERENCES position(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_employee_user
        FOREIGN KEY (user_id)
        REFERENCES user(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,

    CONSTRAINT fk_employee_create_by
        FOREIGN KEY (create_by)
        REFERENCES user(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);