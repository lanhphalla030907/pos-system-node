# POS System — Frontend (pos-phone)

React frontend for a full **Point-of-Sale (POS) management system**. Provides a POS terminal with receipt printing, dashboard & analytics, product/stock management, purchases, employees, customers, expenses, RBAC (roles & permissions), notifications, and store settings. Despite the name, it is a fully responsive web app (mobile-first patterns: off-canvas sidebar, cart drawer, card fallbacks on small screens).

Pairs with the Express API in the sibling [`../api-node/`](../api-node/) folder (listens on port **8080**).

## Tech Stack

| Concern         | Technology                                             |
| --------------- | ------------------------------------------------------ |
| UI library      | React 19                                               |
| Build tool      | Vite 8                                                 |
| Styling         | Tailwind CSS 4 (`@tailwindcss/vite`)                   |
| Routing         | React Router 6 (`BrowserRouter` + nested layouts)      |
| State           | React Context + custom hooks (no Redux/Zustand)        |
| HTTP            | axios (wrapped in a single `request()` helper)         |
| Charts          | Chart.js 4 + react-chartjs-2                           |
| Icons           | react-icons (Feather) + lucide-react                   |
| Printing        | react-to-print (POS receipts)                          |
| Fonts           | Inter + Kantumruy Pro (Khmer)                          |
| Language        | Plain JavaScript / JSX (no TypeScript)                 |

## Features

- **POS Terminal** (`/pos`) — full-screen product grid, cart, stock validation, product + member discount stacking, tax, split payments across multiple payment methods, change calculation, and auto-printed receipts.
- **Dashboard** — KPI cards, sales/profit/revenue charts with daily/weekly/monthly/yearly filters, recent-login activity.
- **Authentication** — JWT login stored in `localStorage`, protected/public route guards, automatic redirect to `/login` on 401.
- **RBAC screens** — Role management, permission codes (`module.action`), role→permission assignment, user account management.
- **Products & Stock** — Product CRUD with images/barcodes/pagination, stock dashboard, stock movement history.
- **Purchases & Suppliers** — Purchase CRUD with detail/report pages, supplier management.
- **Employees & Customers** — Employee CRUD with photo upload; customers with membership discounts.
- **Expenses** — Expense tracking and expense-type categories.
- **Orders & Payments** — All-orders list with detail modal, today's sales, payment summaries (bar/doughnut charts), payment method CRUD.
- **Notifications** — Unread badge polled every 30 seconds, notification center (mark read/delete).
- **Settings** — Schema-driven tabs: General / Store / Receipt / Notifications / Security (incl. Telegram bot integration, logo upload).
- **Custom Khmer i18n** — Runtime DOM translator (`TreeWalker` + `MutationObserver`) using a ~1000-entry EN→KM dictionary, enabled when `default_language === "Khmer"`.
- **Dual currency** — USD ($) / KHR (៛) display with configurable exchange rate (default 4000).
- **Custom UI primitives** — Toast system (`useAlert`), promise-based confirm dialogs (`useConfirm`), shared `Table` component.

## Project Structure

```
pos-phone/
├── index.html                 # Entry HTML (Kantumruy Pro font)
├── vite.config.js             # Vite + React + Tailwind plugins (no dev proxy)
├── public/                    # favicon, icons
└── src/
    ├── main.jsx               # createRoot → <App/>
    ├── App.jsx                # Provider stack → <AppRoute/>
    ├── index.css              # Tailwind 4 entry (@import, @theme, custom styles)
    ├── routes/                # AppRoute, ProtectedRoute, PublicRoute
    ├── page/                  # 34 pages (auth, home, pos, product, order, ...)
    ├── components/
    │   ├── layout/            # MainLayout, LayoutPos, Sidebar, Navbar
    │   ├── common/            # Alert (toasts), ConfirmModal
    │   ├── pos/               # ProductGrid, Cart, Receipt, PaymentRow...
    │   └── ui/                # Table
    ├── hooks/                 # 18 stateful data hooks (useDashboard, useOrder...)
    ├── api/                   # 18 thin axios wrapper modules
    ├── store/                 # Contexts: profile (localStorage), settings,
    │                          #   language (Khmer i18n), notification polling
    ├── util/                  # helper.js (request), config.js (base URL), currency.js
    ├── constants/menu.jsx     # Sidebar menu tree (single source for navigation)
    └── locales/km.js          # EN→KM dictionary + translate()
```

**Conventions:**

- `api/*.js` = thin `request()` wrappers → `hooks/use*.js` = stateful wrappers returning `{ data, loading, error, loadX, addX }`.
- Paginated responses: `{ data, pagination: { total, page, limit, totalPages } }`.
- API responses follow the envelope `{ success, message, data }`.

## Getting Started

### Prerequisites

- Node.js 18+
- The POS API running locally (see [`../api-node/README.md`](../api-node/README.md)) at `http://localhost:8080`

### 1. Install dependencies

```bash
cd pos-phone
npm install
```

### 2. Configure the API URL

There are no `.env` files — the API base URL is **hardcoded** in `src/util/config.js`:

```js
export const Config = {
  base_url: "http://localhost:8080/api/",   // axios requests
  base_url2: "http://localhost:8080/",      // static uploads (images)
  version: "1.0",
  token: "",
};
```

Update `base_url` / `base_url2` to point at your API host when deploying. Cross-origin access is handled by the API's CORS allowlist (`CORS_ORIGIN` in the API `.env`) — there is no Vite dev proxy.

### 3. Run

```bash
npm run dev       # start dev server (Vite)
npm run build     # production build → dist/
npm run preview   # preview the production build
npm run lint      # ESLint
```

## Routes

### Public

| Path        | Page    | Purpose                          |
| ----------- | ------- | -------------------------------- |
| `/login`    | Login   | Sign in (redirects to `/dashboard` if already authenticated) |
| `/register` | Register | Create account                  |

### Protected — main layout (sidebar + navbar)

| Path                                  | Purpose                                  |
| ------------------------------------- | ---------------------------------------- |
| `/`                                   | Redirects to `/dashboard`                |
| `/dashboard`                          | KPIs, charts, recent logins              |
| `/product`, `/category`, `/brand`     | Product inventory, categories (brand is a stub) |
| `/stock`, `/stock/history`            | Stock analytics & movement log           |
| `/purchases`, `/purchases/add`, `/purchases/:id`, `/purchases/edit/:id`, `/purchases/report` | Purchase CRUD + report |
| `/supplier`                           | Supplier CRUD                            |
| `/employees`, `/employees/add`, `/employees/:id`, `/employees/edit/:id` | Employee CRUD |
| `/customers`                          | Customer CRUD + member discount          |
| `/all-order`, `/today-sale`, `/sale-chart` | Orders, today's summary, sales charts |
| `/summary-payment`, `/payment-method` | Payment analytics & methods              |
| `/all-expense`, `/expense-type`       | Expenses & expense categories            |
| `/role-management`, `/permission-management`, `/user` | RBAC & user accounts |
| `/notifications`, `/profile`, `/settings`, `/help` | Notifications, profile, settings, help |

### Protected — POS layout (full screen)

| Path  | Purpose                                                 |
| ----- | ------------------------------------------------------  |
| `/pos` | POS terminal: product grid → cart → checkout → receipt |

Any unmatched path renders a simple "Route not found" message.

## Auth Flow

1. **Login** → `POST auth/login` → `access_token` and profile saved to `localStorage`.
2. **`ProtectedRoute`** — no token → redirect to `/login` (return-to-origin supported via `location.state.from`).
3. **`PublicRoute`** — token present → redirect to `/dashboard`.
4. **Every request** gets `Authorization: Bearer <token>` from the `request()` helper in `src/util/helper.js`.
5. **On 401** — clears token/profile and hard-redirects to `/login` (double-redirect guarded).
6. **Logout** — clears `localStorage` → navigate to `/login`.

> Note: permissions are managed in the UI, but the sidebar is a static menu tree — client-side permission gating is not applied.

## Scripts

| Command         | Description                  |
| --------------- | ---------------------------- |
| `npm run dev`   | Start Vite dev server        |
| `npm run build` | Build for production         |
| `npm run preview` | Preview production build   |
| `npm run lint`  | Run ESLint                   |

## License

MIT
