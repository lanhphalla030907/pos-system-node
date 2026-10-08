require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const errorHandler = require("./src/middleware/errorHandler");
const { apiLimiter } = require("./src/middleware/rateLimit");
const app = express();

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Body parsers with size limits
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));

// Rate limiting
app.use("/api", apiLimiter);

// CORS - restrict to allowed origins
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173").split(",");
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true
}));
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
require("./src/routes/dashboard.route")(app);
require("./src/routes/paymentMethod.route")(app);
require("./src/routes/orderPayment.route")(app);
require("./src/routes/settings.route")(app);
require("./src/routes/notification.route")(app);

require("./src/jobs/stockAlert.job");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(errorHandler);

const PORT = 8080;

app.listen(PORT, () => {
  console.log("http://localhost:" + PORT);
});
