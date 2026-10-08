# POS System — Store Management

A complete **Point-of-Sale (POS) management system** for retail stores. Includes a responsive web frontend, a REST API backend, and MySQL schema scripts covering the full retail workflow: products, categories & barcodes, customers with membership tiers, checkout orders with multi-payment support, purchases (restocking), expenses, employees, RBAC roles & permissions, dashboards & reports, notifications, and low-stock alerts via Telegram.

This is a **monorepo** containing three top-level parts:

| Path | Description | Read more |
| ---- | ----------- | --------- |
| `api-node/` | Backend REST API — Node.js, Express 5, MySQL, JWT | [📖 README](./api-node/README.md) |
| `pos-phone/` | Frontend SPA — React 19, Vite 8, Tailwind CSS 4 | [📖 README](./pos-phone/README.md) |
| `database/` | SQL scripts for schema, relationships, role permissions & migrations | — |
| `note for the project/` | Informal developer notes | — |
| `agent_guide.md` | Orientation guide for AI agents & contributors | — |

## Tech Stack

| Layer   | Technology |
| ------- | ---------- |
| Backend | Node.js, Express 5, MySQL (`mysql2` pool, raw SQL), JWT + bcrypt, Multer, node-cron, node-telegram-bot-api |
| Frontend | React 19, Vite 8, Tailwind CSS 4, React Router 6, axios, Chart.js, react-to-print |
| Notifications | Telegram Bot API + in-app notification center |
| Security | Helmet, CORS allowlist, rate limiting, RBAC middleware (`checkPermission`) |

## Architecture

**Request flow:**

```
Browser (pos-phone, :5173)
   │  axios  (Bearer JWT)
   ▼
Express API (api-node, :8080)
   │  validate_token / checkPermission
   ▼
routes → controller → service → repository
                                      │  raw SQL (parameterized)
                                      ▼
                                MySQL (node-backend)
```

- The frontend keeps the token in `localStorage` and sends it as `Authorization: Bearer <token>` on every request.
- Orders and purchases are created inside MySQL transactions with row locks (`SELECT ... FOR UPDATE`); all pricing is computed server-side.
- A cron job checks stock levels every 30 minutes and pushes low-stock alerts to Telegram and in-app notifications.
- Both apps use a common response envelope `{ success, message, data }` and pagination shape `{ total, page, limit, totalPages }`.

## Getting Started

### Prerequisites

- Node.js 18+
- MySQL 8+ (recommended port `3307` as configured)
- (Optional) Telegram bot token & chat ID for alerts

### 1. Install dependencies

```bash
# Root (provides shared deps such as express-rate-limit used by the API)
npm install

# Backend
cd api-node
npm install

# Frontend
cd pos-phone
npm install
```

### 2. Set up the database

Create a MySQL database (default name `node-backend`) and run the SQL scripts in `database/` in order:

1. `table.sql` — core tables
2. `relationship table.sql` — foreign keys
3. `role permissions.sql` — roles, permissions & seed data
4. `notifications.sql`
5. `settings_migration.sql`
6. `order_payment_migration.sql`
7. `order_tax_migration.sql`

### 3. Configure the backend

```bash
cd api-node
cp .env.example .env
# edit .env:  JWT_SECRET, DB_* credentials, CORS_ORIGIN, TELEGRAM_* (optional)
```

Start the API:

```bash
node index.js        # production  →  http://localhost:8080
npm run dev          # development (requires nodemon)
```

### 4. Run the frontend

```bash
cd pos-phone
npm run dev          # Vite dev server → http://localhost:5173
```

The frontend expects the API at `http://localhost:8080` (hardcoded in `pos-phone/src/util/config.js`). Make sure `CORS_ORIGIN` in the backend `.env` includes your frontend origin.

## Scripts

| Directory  | Command | Description |
| ---------- | ------- | ----------- |
| `api-node/` | `node index.js` | Start the API on port 8080 |
| `api-node/` | `npm run dev` | Start with nodemon (requires global nodemon) |
| `pos-phone/` | `npm run dev` | Vite dev server |
| `pos-phone/` | `npm run build` | Production build → `dist/` |
| `pos-phone/` | `npm run lint` | Run ESLint |

## Key Features

- **POS checkout** — product grid → cart → split payments across multiple methods → auto-printed receipts
- **Customer membership** — spend-based tier promotions (regular → member → VIP) and per-customer discounts
- **Inventory** — purchases restock products, low-stock thresholds, stock history/movement/value reports
- **RBAC** — roles, permission codes (`product.view`, `order.create`, ...), role→permission assignment
- **Dashboards** — KPIs, sales/profit charts (daily/weekly/monthly/yearly), payment summaries
- **Dual currency** — USD ($) / KHR (៛) display with configurable exchange rate
- **Khmer localization** — runtime EN→KM translator driven by the store's default language setting
- **Telegram alerts** — login events and low-stock notifications

## Documentation

- [API README](./api-node/README.md) — full endpoint reference, environment variables, security notes
- [Frontend README](./pos-phone/README.md) — routes, auth flow, project conventions
- [agent_guide.md](./agent_guide.md) — architecture details and contribution conventions for AI agents/developers

## License

MIT