# POS System — API (Node.js)

REST API backend for a **Point of Sale (POS) / retail shop management system**. Handles products & categories, barcode generation, suppliers & purchases, customers with membership tiers, checkout orders with multi-payment support, expenses, employees, role-based access control (RBAC), dashboards & reports, notifications, and inventory monitoring with low-stock Telegram alerts.

## Tech Stack

| Concern        | Technology                                              |
| -------------- | ------------------------------------------------------- |
| Runtime        | Node.js (CommonJS)                                      |
| Framework      | Express 5                                               |
| Database       | MySQL (`mysql2` connection pool, raw SQL — no ORM)      |
| Auth           | JWT (`jsonwebtoken`) + `bcrypt` password hashing        |
| Authorization  | Custom RBAC middleware (`checkPermission`)              |
| File uploads   | Multer (disk storage, 3 MB, JPG/JPEG/PNG only)          |
| Security       | Helmet, CORS allowlist, express-rate-limit              |
| Scheduling     | node-cron (low-stock check every 30 minutes)            |
| Notifications  | Telegram Bot API + in-app notifications table           |

## Features

- **Authentication** — Bearer JWT login, profile, change password, login history (IP + user agent), Telegram alerts on login success/failure.
- **RBAC** — Roles & permissions tables with `checkPermission('product.create')`-style middleware guarding every mutating route.
- **Products & Categories** — CRUD, image upload, barcode generation (`BAR-000001`), search/filter/pagination, top-selling & summary endpoints.
- **Checkout Orders** — Transactional order creation with row locks (`SELECT ... FOR UPDATE`), server-side pricing, per-line + customer membership discounts, tax, split payments across multiple payment methods, and auto order numbers (`ORD-000001`).
- **Customers & Membership** — Spend-based tier auto-promotion (`regular → member ≥ $200 → vip ≥ $1000`), per-customer discounts.
- **Purchasing & Inventory** — Transactional purchase recording that restocks products, low-stock detection, stock history/movement/value endpoints.
- **Expenses** — Expense & expense-type CRUD with chart/summary endpoints.
- **Employees** — CRUD with photo upload, auto employee codes (`EMP-000001`), login-account creation.
- **Dashboard & Reports** — Sales/COGS/profit summaries, payment breakdown, daily/weekly/monthly/yearly charts, recent logins.
- **Notifications** — In-app notifications (unread count, mark read) + low-stock Telegram alerts via cron every 30 minutes.
- **Settings** — Key/value app settings with whitelisted batch updates and store logo upload.

## Project Structure

```
api-node/
├── index.js                 # Entry point: helmet, CORS, rate limit, routes, static /uploads, error handler
├── package.json
├── .env.example
├── uploads/                 # Uploaded files served at /uploads (products/, employee/, settings/)
└── src/
    ├── routes/              # Route definitions (19 route files)
    ├── controller/          # Request/response handling
    ├── services/            # Business logic (auth, telegram, orders, purchases...)
    ├── repositories/        # Raw SQL data access via mysql2 pool
    ├── middleware/          # asyncHandler, checkPermission, errorHandler, rateLimit, upload
    ├── jobs/                # stockAlert.job.js — cron job (every 30 min)
    └── util/                # AppError, config, DB connection pool, validators
```

> Database schema and seed/migration SQL files live in the sibling `../database/` folder of the monorepo.

## Getting Started

### Prerequisites

- Node.js 18+
- MySQL 8+
- (Optional) Telegram bot token & chat ID for alerts

### 1. Install dependencies

```bash
cd api-node
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

```env
NODE_ENV=production
PORT=8081                    # Note: port is currently hardcoded to 8080 in index.js
JWT_SECRET=your-secret-key   # Required — app exits if missing
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your-password
DB_NAME=node-backend
DB_PORT=3307
CORS_ORIGIN=http://localhost:5173   # Comma-separated allowlist
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHAT_ID=your-chat-id
```

### 3. Set up the database

Create the MySQL database and run the SQL files from `../database/` in order:

1. `table.sql` — core tables
2. `role permissions.sql` — roles, permissions & seed data
3. `notifications.sql`
4. `settings_migration.sql`
5. `order_payment_migration.sql`
6. `order_tax_migration.sql`

### 4. Ensure upload folders exist

Multer does not create folders — make sure these exist:

```
uploads/products/
uploads/employee/
uploads/settings/
```

### 5. Run

```bash
# Production
node index.js

# Development (requires nodemon: npm i -g nodemon, or add as devDependency)
npm run dev
```

The server starts at `http://localhost:8080`.

## API Overview

All endpoints are prefixed with `/api` and (unless noted) require an `Authorization: Bearer <token>` header. Responses follow the envelope:

```json
{ "success": true, "message": "...", "data": { } }
```

Paginated endpoints return `{ data, pagination: { total, page, limit, totalPages } }`.

| Area                  | Endpoints                                                                                                                        |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **Auth**              | `POST /api/auth/login` *(public)*, `GET /api/auth/profile`, `PUT /api/auth/change-password`, `GET /api/auth/getlist`, `POST /api/auth/register` |
| **Products**          | `GET/POST /api/product`, `GET/PUT/DELETE /api/product/:id`, `/summary`, `/top-sale`, `/generate-barcode`                          |
| **Categories**        | `GET/POST /api/category`, `GET/PUT/DELETE /api/category/:id`                                                                     |
| **Suppliers**         | `GET/POST /api/supplier`, `GET/PUT/DELETE /api/supplier/:id`                                                                     |
| **Orders**            | `POST/GET /api/order`, `GET /api/order/:id`, `/today`, `/today-summary`, `/chart`                                                |
| **Payments**          | `GET/POST /api/order-payment`, `GET/PUT /api/payment-method`                                                                     |
| **Customers**         | `GET/POST /api/customer`, `PUT/DELETE /api/customer/:id`, `/membership`, `/discount`                                            |
| **Purchases**         | `GET/POST /api/purchase`, `GET/PUT /api/purchase/:id`, `/report`, `/summary`                                                    |
| **Stock**             | `GET /api/low-stock`, `/stock-movement`, `/stock/history`, `/stock/value`, `/test-alert`                                         |
| **Expenses**          | `GET/POST /api/expense`, `GET/PUT/DELETE /api/expense/:id`, `/chart`, `/summary`, CRUD `/api/expense-type`                       |
| **Employees**         | `GET/POST /api/employee`, `GET/PUT/DELETE /api/employee/:id`, `/create-account`, `/status`                                       |
| **Roles & Permissions** | `GET/POST/PUT/DELETE /api/role`, `/api/permission`, `/api/role/:id/permissions`                                                |
| **Dashboard**         | `GET /api/dashboard/summary`, `/payment-summary`, `/sales-chart`, `/profit-chart`, `/recent-login`                               |
| **Notifications**     | `GET /api/notifications`, `/unread-count`, `POST /api/notifications`, `PUT .../read`, `DELETE .../:id`                           |
| **Settings**          | `GET/PUT /api/settings`, `POST /api/settings/upload-logo`                                                                        |
| **Static**            | `GET /uploads/*` *(public)*                                                                                                      |

### Notable permission codes

`dashboard.*`, `product.*`, `category.*`, `supplier.*`, `customer.*`, `order.view/create`, `expense.*`, `expense_type.*`, `report.view`, `user.*`, `role.*`, `permission.*`, `employee.*`

## Security Notes

- Passwords hashed with bcrypt (cost 10); min 6 characters on register.
- Rate limiting: 300 req/min general on `/api`, and 5 login attempts per 10 minutes on `POST /api/auth/login`.
- CORS origin allowlist via `CORS_ORIGIN` (requests without an `Origin` header are allowed).
- Client-supplied prices are ignored — all pricing is computed server-side.
- Order and purchase creation run inside MySQL transactions with row locking for concurrency safety.
- Custom `AppError` + central error handler (500s are masked as "Internal Server Error").

## Scripts

| Command       | Description                            |
| ------------- | -------------------------------------- |
| `node index.js` | Start the server (port 8080)         |
| `npm run dev`   | Start with nodemon (dev, requires global nodemon) |
| `npm test`      | Placeholder — no test suite yet       |

## Future Improvements

The following improvements are planned for future versions of the POS system:

- [ ] **Automated Testing** — Add unit, integration, and API tests for authentication, RBAC, orders, payments, inventory, and reporting.
- [ ] **API Documentation** — Add complete Swagger/OpenAPI documentation with request/response examples and authentication requirements.
- [ ] **Refresh Token Management** — Implement secure refresh-token rotation, revocation, and logout/session management.
- [ ] **Database Migrations** — Replace manual SQL execution with a structured database migration and rollback system.
- [ ] **Advanced Validation** — Add centralized request validation and stronger input sanitization across all endpoints.
- [ ] **File Storage** — Move uploaded images from local disk storage to object storage such as Amazon S3, Cloudflare R2, or Cloudinary.
- [ ] **Improved Security** — Add stronger password policies, account lockout, refresh-token protection, security logging, and more granular rate limiting.
- [ ] **Audit Logs** — Track important administrative actions such as product changes, price updates, stock adjustments, role changes, and order cancellations.
- [ ] **Advanced Reporting** — Add exportable PDF/Excel reports and more detailed sales, inventory, profit, and employee performance analytics.
- [ ] **Real-time Notifications** — Add WebSocket-based notifications for stock changes, new orders, payment events, and important system activities.
- [ ] **Multi-Store Support** — Extend the inventory and sales architecture to support multiple branches/stores with branch-level permissions and stock management.
- [ ] **Backup & Recovery** — Implement automated database backups and documented recovery procedures.
- [ ] **Docker Deployment** — Containerize the API and database for consistent development, testing, and production deployment.
- [ ] **CI/CD Pipeline** — Add automated linting, testing, builds, and deployment through GitHub Actions or another CI/CD platform.
- [ ] **Observability** — Add structured logging, health checks, metrics, and error monitoring for production environments.
- [ ] **Performance Optimization** — Introduce database indexing optimization, caching, query optimization, and background processing for expensive operations.

## License

MIT
