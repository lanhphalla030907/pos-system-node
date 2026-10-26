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
| File uploads   | Multer memory storage + Cloudinary SDK (3 MB, JPG/JPEG/PNG only) |
| Security       | Helmet, CORS allowlist, express-rate-limit              |
| Scheduling     | node-cron (low-stock check every 30 minutes)            |
| Notifications  | Telegram Bot API + in-app notifications table           |

## Features

- **Authentication** — Bearer JWT login, profile, change password, login history (IP + user agent), Telegram alerts on login success/failure.
- **RBAC** — Roles & permissions tables with `checkPermission('product.create')`-style middleware guarding every mutating route.
- **Products & Categories** — CRUD, Cloudinary image upload, barcode generation (`BAR-000001`), search/filter/pagination, top-selling & summary endpoints.
- **Checkout Orders** — Transactional order creation with row locks (`SELECT ... FOR UPDATE`), server-side pricing, per-line + customer membership discounts, tax, split payments across multiple payment methods, and auto order numbers (`ORD-000001`).
- **Customers & Membership** — Spend-based tier auto-promotion (`regular → member ≥ $200 → vip ≥ $1000`), per-customer discounts.
- **Purchasing & Inventory** — Transactional purchase recording that restocks products, low-stock detection, stock history/movement/value endpoints.
- **Expenses** — Expense & expense-type CRUD with chart/summary endpoints.
- **Employees** — CRUD with Cloudinary photo upload, auto employee codes (`EMP-000001`), login-account creation.
- **Dashboard & Reports** — Sales/COGS/profit summaries, payment breakdown, daily/weekly/monthly/yearly charts, recent logins.
- **Notifications** — In-app notifications (unread count, mark read) + low-stock Telegram alerts via cron every 30 minutes.
- **Settings** — Key/value app settings with whitelisted batch updates and Cloudinary store logo upload.

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
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_FOLDER_PREFIX=pos       # Optional, defaults to "pos"
```

### 3. Set up the database

Create the MySQL database and run the SQL files from `../database/` in order:

1. `table.sql` — core tables
2. `role permissions.sql` — roles, permissions & seed data
3. `notifications.sql`
4. `settings_migration.sql`
5. `order_payment_migration.sql`
6. `order_tax_migration.sql`

If the database already contains products, employees or settings from an older
version, also apply the forward-only image storage migration:

```bash
mysql -u <user> -p <database> < ../database/migrations/20261026_cloudinary_image_storage.sql
```

The migration only adds nullable `image_public_id` columns and seeds the
internal `store_logo_public_id` settings key. It does not alter or delete
existing image values.

### 4. Configure Cloudinary

Create a Cloudinary account (or use an existing one) and copy the cloud name,
API key and API secret into `api-node/.env`. The API secret MUST stay on the
server and must never be exposed to the React app.

New uploads use these folders inside Cloudinary:

```
<CLOUDINARY_FOLDER_PREFIX>/products
<CLOUDINARY_FOLDER_PREFIX>/employee
<CLOUDINARY_FOLDER_PREFIX>/settings
```

Uploads fail with a clear `503` configuration error when the three
`CLOUDINARY_*` variables are missing. Existing local images keep working
without Cloudinary credentials because `/uploads` remains available.

### 5. Ensure legacy upload folders exist (only for old local images)

Multer now uses memory storage and writes no new files to disk. Keep the
existing folders so previously stored local images continue to be served:

```
uploads/products/
uploads/employee/
uploads/settings/
```

### 6. Run

```bash
# Production
node index.js

# Development (requires nodemon: npm i -g nodemon, or add as devDependency)
npm run dev
```

The server starts at `http://localhost:8080`.

## Image Storage

All new product, employee and store-logo images are uploaded to Cloudinary
through `src/services/storage/`:

- `cloudinary.service.js` — validates credentials, uploads in-memory buffers,
  deletes by `public_id`, and resolves delivery URLs.
- `image-storage.service.js` — feature folder mapping, lifecycle helpers and
  safe legacy-local cleanup.
- `image-validation.service.js` — MIME allowlist plus JPEG/PNG magic-byte
  validation before anything is sent to Cloudinary.

Multer uses memory storage, so rejected uploads never touch disk. The server
ignores the client filename and generates a UUID `public_id` itself. The 3 MB
limit and the existing JPG/JPEG/PNG allowlist are unchanged.

### Persisted references

| Feature | URL column/key | Cloudinary identifier |
| ------- | -------------- | --------------------- |
| Product | `product.image` | `product.image_public_id` |
| Employee | `employee.image` | `employee.image_public_id` |
| Store logo | `settings.store_logo` | `settings.store_logo_public_id` (internal, hidden from the API) |

`image`/`store_logo` still contains everything the frontend needs:

- new images: the full `https://res.cloudinary.com/...` delivery URL
- old images: the original bare local filename, resolved by the frontend as
  `/uploads/<folder>/<filename>`

The React image components already render either form. The product edit preview
was updated to accept absolute URLs.

### Replacement and deletion

1. A new asset is uploaded first.
2. The new URL/public_id is written to MySQL.
3. Only after that write succeeds is the previous asset deleted.
4. If the database write fails, the newly uploaded asset is removed and the
   previous asset is left untouched.
5. Record deletes remove the MySQL row first, then the asset.

Cloudinary and MySQL cannot share a transaction. If a post-commit deletion
fails, the API does not roll back the database. The server logs
`[image-storage] cleanup failed` with the `public_id` and a documented retry is
available below.

### Legacy local images

Existing local files and records are not modified by deployment. A legacy
filename is only deleted when that specific record's image is explicitly
replaced or the record is deleted. Path traversal is rejected, and a
Cloudinary URL is never treated as a local filename. Cloudinary URLs without a
stored `public_id` are left in place rather than guessed at.

To migrate old local images later, run a separate, repeatable script that reads
one legacy record at a time, uploads its file to the matching folder, updates
the URL/public_id columns, and only then removes/moves the old local file.
There is intentionally no automatic bulk migration on startup.

### Orphan cleanup

Search the API logs for `[image-storage] cleanup failed` and note the logged
`publicId`. Retry the single deletion manually from `api-node/`:

```bash
node -e "require('dotenv').config(); require('./src/services/storage/cloudinary.service').destroy('pos/products/PUBLIC_ID').then(console.log).catch(console.error)"
```

Also check the Cloudinary Media Library for assets created before a failed
database insert or a failed settings update.

### Verify a deployment

1. Set the three `CLOUDINARY_*` variables in the hosting provider and restart.
2. Upload a product image, refresh the product list and confirm the image
   renders from `res.cloudinary.com`.
3. Check MySQL: `SELECT id, image, image_public_id FROM product ORDER BY id DESC LIMIT 1;`
4. Replace the image and confirm the old asset is gone from Cloudinary.
5. Delete the test product and confirm its asset is deleted.
6. Repeat for an employee photo and the store logo.
7. Confirm `/uploads/<old-file>` still serves an existing legacy image.

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
- Image uploads enforce a 3 MB limit, declared-MIME allowlist and real JPEG/PNG signature checks. Client filenames are ignored; Cloudinary IDs are server-generated UUIDs.
- Custom `AppError` + central error handler (500s are masked as "Internal Server Error").

## Scripts

| Command       | Description                            |
| ------------- | -------------------------------------- |
| `node index.js` | Start the server (port 8080)         |
| `npm run dev`   | Start with nodemon (dev, requires global nodemon) |
| `npm test`      | Run backend unit/integration tests with the built-in `node:test` runner |

## Future Improvements

The following improvements are planned for future versions of the POS system:

- [ ] **Automated Testing** — Expand unit, integration, and API tests for authentication, RBAC, orders, payments, inventory, and reporting. Image storage now has a `node:test` suite.
- [ ] **API Documentation** — Add complete Swagger/OpenAPI documentation with request/response examples and authentication requirements.
- [ ] **Refresh Token Management** — Implement secure refresh-token rotation, revocation, and logout/session management.
- [ ] **Database Migrations** — Replace manual SQL execution with a structured database migration and rollback system.
- [ ] **Advanced Validation** — Add centralized request validation and stronger input sanitization across all endpoints.
- [x] **File Storage** — Product, employee and store-logo images are stored in Cloudinary with legacy local-file compatibility.
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
