# Agent Guide — POS Node.js Project

This guide helps AI agents (and developers) quickly understand the project before making changes.

## Project Overview

A Point-of-Sale (POS) phone-store management system with a phone-oriented React frontend and a Node.js/Express REST API backend backed by MySQL. Features include product/category management, customer & supplier management, POS order creation, purchases (stock in), expenses, employees, roles/permissions, sales reports/charts, and stock alerts via Telegram.

This is a **monorepo** with three top-level parts:

| Path | What it is |
|------|-----------|
| `api-node/` | Backend REST API (Node.js, Express, MySQL, JWT auth) |
| `pos-phone/` | Frontend SPA (React 19 + Vite + Ant Design + Tailwind) |
| `database/` | SQL scripts for schema, relationships, and role permissions |
| `note for the project/` | Informal dev notes (dependencies installed, etc.) |

> Note: `node_modules/` exists at root, `api-node/node_modules/`, and `pos-phone/`. Dependencies are per-package (no workspace tooling). Root `package.json` only holds a stray `express-rate-limit` dep (unused; the backend installs its own).

## Quick Start / Commands

```bash
# Backend (from api-node/)
cd api-node && npm run dev        # nodemon index.js, serves http://localhost:8081

# Frontend (from pos-phone/)
cd pos-phone && npm run dev       # Vite dev server
cd pos-phone && npm run build     # production build
cd pos-phone && npm run lint      # ESLint (js.configs.recommended + react-hooks + react-refresh)
```

- Backend listens on port **8081** (`api-node/index.js:31`). There is **no test suite** for the backend (`npm test` is a stub).
- Frontend `lint` is the only lint/type-check step; there is no TypeScript.

## Database

- MySQL, config in `api-node/src/util/config.js`: host `localhost`, user `root`, no password, database **`node-backend`**, port **3307**.
- Connection pool in `api-node/src/util/connection.js` (`mysql2/promise`, `namedPlaceholders: true`).
- Schema scripts (run in order):
  1. `database/table.sql` — creates all tables.
  2. `database/relationship table.sql` — foreign keys between tables.
  3. `database/role permissions.sql` — `permissions`, `role_permission` tables + seed permission data (codes like `product.view`, `product.delete`, `order.create`, …).
- Central tables: `user`, `customer`, `supplier` (misspelled `suppiler` in table.sql), `category`, `product`, `orders`, `order_detail`, `purchase`, `purchase_product`, `expense_type`, `expense`, `position`, `employee`, `login_history`, `audit_logs`.
- Caution: `database/table.sql` is stale/buggy relative to the live code — it has typos (`DEFAULt NUll,llllll`), uses `suppiler` instead of `supplier`, and the `product` table as written lacks `min_stock` and `cost_price`, which the code and repositories use heavily (see `product.repository.js`). Treat the repository SQL as the source of truth for fields.

## Backend Architecture (`api-node/`)

**Stack:** Express 5, `mysql2/promise`, `bcrypt`, `jsonwebtoken`, `multer` (file uploads), `node-cron`, `node-telegram-bot-api`, `dotenv`, `cors`, `express-rate-limit`.

**Entry point:** `api-node/index.js` — creates the Express app, mounts `express.json()`, CORS (`origin: "*"`), a global rate limiter on `/api` (100 req/min), registers every route module, serves `uploads/` statically, and mounts an error handler. Routes are registered **directly on `app`** (each route module exports `(app) => { app.get("/api/...", ...) }`), **not** via `express.Router()`.

### Layered pattern (per feature)
```
routes/        -> controllers/     -> services/       -> repositories/   -> MySQL
(URL + middleware)  (HTTP req/res)    (business logic)    (SQL queries)
```
- **Controllers** keep HTTP concerns, parse `req.query`/`req.body`/`req.params`, and return the standard envelope.
- **Services** hold business logic, throw `AppError` (custom error class in `src/util/AppError.js`), and handle file cleanup.
- **Repositories** contain raw SQL (parameterized queries via `db.query`, named placeholders `:name` or positional `?`).
- **`src/util/helper.js`** exports `db` (the pool) plus stub helpers (`toInt`, `isArray`, `isEmpty`, `isEmail`, `formatDateServer` all just `return true` — do not rely on them; they are placeholder implementations).
- **`asyncHandler`** (`src/middleware/asyncHandler.js`) wraps async controllers so errors propagate to the central `errorHandler` middleware.

### Standard response envelope
```json
{ "success": true, "data": ..., "message": "...", "pagination": { "total", "totalPages", "currentPage", "limit" } }
```
Errors: `{ "success": false, "message": "..." }` (plus `stack` in development). Most controllers return `400` for failures; `errorHandler` returns `500` by default.

### Auth & permissions
- `POST /api/auth/login` (rate-limited to 5 attempts / 10 min) verifies bcrypt password, issues a JWT signed with a **hardcoded secret** `"LWEJROI32209"` (`auth.service.js:5`), expires in 7 days, and records login history + sends a Telegram login alert.
- `validate_token()` (exported from `auth.controller.js`) is a middleware factory used on almost every route. It verifies the `Authorization: Bearer <token>` header and sets `req.user`, `req.current_id`, `req.current_name`, `req.current_username`.
- `checkPermission("<code>")` (`src/middleware/checkPermission.js`) is an optional extra middleware that looks up the user's permission codes via `rolePermissionRepository.getUserPermissions` and returns `403` if absent. Used only on a few routes (e.g., `product.delete`).

### Key middleware (all in `src/middleware/`)
- `upload.middleware.js` — `upload(folder)` multer factory; only JPG/JPEG/PNG, max 3 MB, stored under `api-node/uploads/<folder>/`, filename `{field}-{timestamp}-{rand}{ext}`.
- `rateLimit.js` — exports `loginLimiter` and `apiLimiter`.
- `errorHandler.js` — central error middleware.
- `checkPermission.js` and `asyncHandler.js` as described above.

### Notifications / background jobs
- `src/jobs/stockAlert.job.js` — `node-cron` runs `stock.service.checkLowStock()` every 30 minutes (`*/30 * * * *`); low-stock products are messaged to a Telegram chat via `telegram.service.js`.
- `telegram.service.js` uses `process.env.TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` from `api-node/.env`.
- `loginHistory.service.js` records every login attempt (success/failure) with IP + user agent into `login_history` and mirrors it to Telegram.

### Backend known quirks to be aware of
- **Typo'd filenames** (match them exactly when editing): `stcok.controller.js` (controller), `rolePemission.route.js` (route), repository dir `repositories/`. There is `supplier.route.js` but no separate supplier controller beyond the standard set.
- **JWT secret is hardcoded** in `auth.service.js` — treat as a legacy decision; do not log tokens.
- `api-node/.env` contains a **real Telegram bot token and chat ID committed to the repo** — do not leak it further in logs/docs, and avoid adding new secrets.
- `auth.service.js` `register()` does not associate a role by default; `role_id` handling lives in `auth.repository`/`role.repository`.
- Several services rely on `create_by` being set from the JWT (`req.current_name`).

## Frontend Architecture (`pos-phone/`)

**Stack:** React 19, Vite 8, React Router v6, Ant Design 6, Tailwind CSS 4 (via `@tailwindcss/vite`), axios, dayjs, Chart.js + react-chartjs-2, react-to-print.

**Entry points:** `src/main.jsx` → `src/App.jsx` (all routes). There is a large commented-out block at the bottom of `App.jsx` — ignore it.

### Data flow pattern (per feature)
```
pages/ (src/page/*)  ->  hooks/ (use<Feature>.js)  ->  api/ (<feature>Api.js)  ->  axios
```
- **`src/api/*Api.js`** — thin axios wrappers that call the shared `request()` helper in `src/util/helper.js`. `request(url, method, data)` prepends `Config.base_url` (`http://localhost:8081/api/`), attaches `Authorization: Bearer <token>` from `localStorage` (via `src/store/profile.store.js`), and sets `Content-Type` to `multipart/form-data` when the payload is a `FormData`. It swallows errors and returns `{ success: false, message }`.
- **`src/hooks/use*.js`** — stateful wrappers exposing `loading`, `error`, `data`, and action callbacks (e.g., `useOrder`, `useProduct`, `useStock`, `usePermission`).
- **`src/page/`** — route-level screens (organized under `auth/`, `home/`, `order/`, `expense/`, `role/`, `employee/`, `purchase/`, `prouduct/` — note the `prouduct` typo in the folder name).
- **`src/components/`** — shared UI: `layout/` (MainLayout, MainPage), `pos/`, `common/`, `ui/`, `home/`, `product/`, `employee/`.
- **`src/constants/menu.jsx`** — sidebar/nav menu definition.
- `src/store/profile.store.js` manages `access_token` and `profile` in `localStorage`.

### Auth on the frontend
Login/Register live in `src/page/auth/`. After a successful login the token and profile are stored in `localStorage`; the axios helper reads the token from there on every request. The frontend does not do role/permission-based route guarding in `App.jsx` — permissions are enforced server-side.

## Conventions & Rules for Agents

1. **Match existing naming/file structure.** Keep the layered pattern on the backend (route → controller → service → repository) and the api → hook → page pattern on the frontend. Do not introduce new patterns (e.g., don't add an ORM, don't convert route modules to `express.Router()` unless asked).
2. **Parameterize all SQL.** Use `mysql2` positional (`?`) or named (`:name`) placeholders. Never concatenate user input into SQL strings.
3. **Use the response envelope.** Every backend success response should be `{ success: true, ... }`; every error `{ success: false, message }`. Wrap async controllers with `asyncHandler` and throw `AppError` for expected failures so the central error handler takes over.
4. **Auth on new endpoints.** Protect new API routes with `validate_token()`; use `checkPermission("<code>")` when the permission list already covers the action. Remember permission codes are seeded in `database/role permissions.sql` — check there before inventing new codes.
5. **File uploads.** Reuse `upload("<folder>")` from `upload.middleware.js`; remember to clean up old files in the service layer (see `product.service.js` for the pattern).
6. **No TypeScript, no tests.** Verify changes with the frontend `lint` (`npm run lint` in `pos-phone/`), and by running both dev servers manually. There is no backend test runner.
7. **Don't add comments to code unless asked**, and keep style consistent with surrounding files (CommonJS on the backend, ES modules on the frontend).
8. **Beware of inherited typos** — `prouduct/`, `stcok`, `rolePemission`, `suppiler`. When fixing them, update every importer/reference and verify with a build/lint.
9. **Secrets:** the JWT secret and Telegram token are already committed; don't introduce new hardcoded secrets and don't log existing ones.
10. **Timestamps/timezone:** Telegram alerts use `Asia/Phnom_Penh`; MySQL defaults use `CURRENT_TIMESTAMP`. Keep consistent when working with dates.

## Common tasks

- **Add a new API endpoint:** create/extend the route in `src/routes/`, controller, service, and repository files (mirror `product.*` as a template), then register the route module in `index.js`.
- **Add a new frontend page:** add `src/api/<feature>Api.js` + `src/hooks/use<Feature>.js` + a page under `src/page/`, then add a `<Route>` in `App.jsx` (and a menu entry in `src/constants/menu.jsx` if needed).
- **Change database schema:** update `database/*.sql` and the corresponding repository queries in `api-node/src/repositories/`.
