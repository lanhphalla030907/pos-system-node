require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const errorHandler = require("./src/middleware/errorHandler");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({ origin: "*" }));
require("./src/routes/category.route")(app);
require("./src/routes/auth.route")(app);
require("./src/routes/supplier.route")(app);
require("./src/routes/product.route")(app);
require("./src/routes/customer.route")(app);
require("./src/routes/order.route")(app);
require("./src/routes/expenseType.route")(app);
require("./src/routes/expense.route")(app);
require("./src/routes/role.route")(app);
require("./src/routes/permission.route")(app);
require("./src/routes/rolePemission.route")(app);
require("./src/routes/employee.route")(app);
require("./src/routes/stock.route")(app);
require("./src/routes/purchase.route")(app);
require("./src/jobs/stockAlert.job");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(errorHandler);

const PORT = 8081;

app.listen(PORT, () => {
  console.log("http://localhost:" + PORT);
});
