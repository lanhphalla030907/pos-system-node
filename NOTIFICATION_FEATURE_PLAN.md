# Notification Feature Implementation Plan

## Overview
Implement a full-featured in-app notification system that:
- Stores notifications in a database
- Provides API endpoints for CRUD operations
- Displays notifications in a dropdown in the navbar
- Updates unread count in real-time (polling)
- Integrates with all existing business events
- Maintains existing Telegram integration

---

## Phase 1: Database Schema

### 1.1 Create Notifications Table

**File:** `database/notifications.sql`

```sql
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('order', 'purchase', 'expense', 'stock', 'auth', 'system') NOT NULL,
    reference_id INT NULL,
    reference_type VARCHAR(50) NULL,
    is_read TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at),
    CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);
```

### 1.2 Add Notification Permissions

**File:** `database/role permissions.sql` (append)

```sql
INSERT INTO permissions (code, name, module) VALUES
('notification.view', 'View Notifications', 'Notification'),
('notification.delete', 'Delete Notifications', 'Notification'),
('notification.mark_read', 'Mark Notifications as Read', 'Notification');
```

---

## Phase 2: Backend Implementation

### 2.1 Notification Repository

**File:** `api-node/src/repositories/notification.repository.js`

**Functions:**
- `getAll(userId, filter)` - Get notifications with pagination and filters
- `getUnreadCount(userId)` - Get count of unread notifications
- `getById(id)` - Get single notification
- `create(data)` - Create new notification
- `markAsRead(id)` - Mark single notification as read
- `markAllAsRead(userId)` - Mark all user notifications as read
- `remove(id)` - Delete notification
- `removeAll(userId)` - Delete all user notifications

**Pattern:** Follow `product.repository.js` for queries, pagination, and exports.

### 2.2 Notification Service

**File:** `api-node/src/services/notification.service.js`

**Functions:**
- `getNotifications(userId, filter)` - Delegates to repository
- `getUnreadCount(userId)` - Delegates to repository
- `createNotification(data)` - Creates notification, validates data
- `markAsRead(id, userId)` - Marks as read, verifies ownership
- `markAllAsRead(userId)` - Marks all as read
- `deleteNotification(id, userId)` - Deletes, verifies ownership
- `deleteAllNotifications(userId)` - Deletes all user notifications

**Helper Functions (for integration):**
- `notifyOrderCreated(order)` - Create order notification
- `notifyPurchaseCreated(purchase)` - Create purchase notification
- `notifyExpenseCreated(expense)` - Create expense notification
- `notifyLowStock(products)` - Create low stock notification
- `notifyLoginEvent(user, status, ip)` - Create auth notification

**Pattern:** Follow `product.service.js` for validation, `loginHistory.service.js` for error isolation.

### 2.3 Notification Controller

**File:** `api-node/src/controller/notification.controller.js`

**Functions:**
- `getNotifications(req, res)` - GET /api/notifications
- `getUnreadCount(req, res)` - GET /api/notifications/unread-count
- `markAsRead(req, res)` - PUT /api/notifications/:id/read
- `markAllAsRead(req, res)` - PUT /api/notifications/read-all
- `deleteNotification(req, res)` - DELETE /api/notifications/:id
- `deleteAllNotifications(req, res)` - DELETE /api/notifications/all

**Pattern:** Follow `product.controller.js` for asyncHandler, response envelope.

### 2.4 Notification Routes

**File:** `api-node/src/routes/notification.route.js`

```javascript
module.exports = (app) => {
    app.get("/api/notifications", validate_token(), getNotifications);
    app.get("/api/notifications/unread-count", validate_token(), getUnreadCount);
    app.put("/api/notifications/read-all", validate_token(), markAllAsRead);
    app.put("/api/notifications/:id/read", validate_token(), markAsRead);
    app.delete("/api/notifications/all", validate_token(), deleteAllNotifications);
    app.delete("/api/notifications/:id", validate_token(), deleteNotification);
};
```

**Pattern:** Follow `order.route.js` for structure, validate_token() first.

### 2.5 Register Routes in Entry Point

**File:** `api-node/index.js`

Add after other route registrations:
```javascript
require("./src/routes/notification.route")(app);
```

### 2.6 Integrate with Existing Services

#### 2.6.1 Order Service Integration

**File:** `api-node/src/services/order.service.js`

After successful order creation, call:
```javascript
await notificationService.notifyOrderCreated({
    order_id: result.id,
    total: data.total,
    customer_name: data.customer_name,
    created_by: user
});
```

#### 2.6.2 Purchase Service Integration

**File:** `api-node/src/services/purchase.service.js`

After successful purchase creation, call:
```javascript
await notificationService.notifyPurchaseCreated({
    purchase_id: result.id,
    total: data.total,
    supplier_name: data.supplier_name,
    created_by: user
});
```

#### 2.6.3 Expense Service Integration

**File:** `api-node/src/services/expense.service.js`

After successful expense creation, call:
```javascript
await notificationService.notifyExpenseCreated({
    expense_id: result.id,
    amount: data.amount,
    expense_type: data.expense_type,
    created_by: user
});
```

#### 2.6.4 Stock Service Integration

**File:** `api-node/src/services/stock.service.js`

In `checkLowStock()`, after Telegram alert, also create in-app notification:
```javascript
await notificationService.notifyLowStock(products);
```

#### 2.6.5 Auth Service Integration

**File:** `api-node/src/services/auth.service.js`

In `login()` and `register()`, call:
```javascript
await notificationService.notifyLoginEvent({
    user_id: user.id,
    username: user.username,
    status: 'success' | 'failed',
    ip_address: req.ip,
    action: 'login' | 'register'
});
```

**Error Isolation:** All notification calls should be wrapped in try/catch to prevent breaking main flows:
```javascript
try {
    await notificationService.notifyOrderCreated(data);
} catch (error) {
    console.error("Notification failed:", error.message);
}
```

---

## Phase 3: Frontend Implementation

### 3.1 Notification API Client

**File:** `pos-phone/src/api/notificationApi.js`

**Functions:**
- `getNotifications(filter)` - GET /notifications
- `getUnreadCount()` - GET /notifications/unread-count
- `markAsRead(id)` - PUT /notifications/:id/read
- `markAllAsRead()` - PUT /notifications/read-all
- `deleteNotification(id)` - DELETE /notifications/:id
- `deleteAllNotifications()` - DELETE /notifications/all

**Pattern:** Follow `productApi.js` using `request()` helper.

### 3.2 Notification Hook

**File:** `pos-phone/src/hooks/useNotification.js`

**State:**
- `notifications` - Array of notifications
- `unreadCount` - Number
- `loading` - Boolean
- `pagination` - Object

**Functions:**
- `loadNotifications(filter)` - Fetch notifications
- `loadUnreadCount()` - Fetch unread count
- `markAsRead(id)` - Mark single as read
- `markAllAsRead()` - Mark all as read
- `deleteNotification(id)` - Delete single
- `deleteAllNotifications()` - Delete all
- `refresh()` - Reload all data

**Pattern:** Follow `useProduct.js` for state management and callbacks.

### 3.3 Notification Store (Context)

**File:** `pos-phone/src/store/notification.store.jsx`

**Purpose:** Provide real-time unread count updates across components.

**Implementation:**
```javascript
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getUnreadCount } from '../api/notificationApi';
import { getAccessToken } from './profile.store';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
    const [unreadCount, setUnreadCount] = useState(0);
    const [intervalId, setIntervalId] = useState(null);

    const fetchUnreadCount = useCallback(async () => {
        if (!getAccessToken()) return;
        try {
            const res = await getUnreadCount();
            if (res?.success) {
                setUnreadCount(res.data?.count || 0);
            }
        } catch (error) {
            console.error("Failed to fetch unread count:", error);
        }
    }, []);

    const startPolling = useCallback(() => {
        fetchUnreadCount();
        const id = setInterval(fetchUnreadCount, 30000); // 30 seconds
        setIntervalId(id);
    }, [fetchUnreadCount]);

    const stopPolling = useCallback(() => {
        if (intervalId) {
            clearInterval(intervalId);
            setIntervalId(null);
        }
    }, [intervalId]);

    useEffect(() => {
        if (getAccessToken()) {
            startPolling();
        }
        return () => stopPolling();
    }, [getAccessToken(), startPolling, stopPolling]);

    return (
        <NotificationContext.Provider value={{ unreadCount, setUnreadCount, refresh: fetchUnreadCount }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotificationStore = () => useContext(NotificationContext);
```

### 3.4 Notification Dropdown Component

**File:** `pos-phone/src/components/notification/NotificationDropdown.jsx`

**Features:**
- Dropdown panel showing recent notifications (max 10)
- Unread count badge on bell icon
- "Mark all as read" button
- "View all" link to full notification list
- Click notification to mark as read
- Relative timestamps (e.g., "5 minutes ago")
- Different icons/colors for notification types

**Pattern:** Follow existing component patterns in `pos-phone/src/components/`.

### 3.5 Notification Item Component

**File:** `pos-phone/src/components/notification/NotificationItem.jsx`

**Props:**
- `notification` - Notification object
- `onMarkAsRead` - Callback
- `onDelete` - Callback

**Features:**
- Icon based on type (order, purchase, expense, stock, auth)
- Title and message
- Relative timestamp
- Read/unread styling
- Delete button (optional)

### 3.6 Update Navbar

**File:** `pos-phone/src/components/layout/Navbar.jsx`

**Changes:**
1. Import `useNotificationStore` from notification store
2. Import `NotificationDropdown` component
3. Replace static bell icon with dynamic component:
   - Real unread count from store
   - onClick handler to toggle dropdown
   - Dropdown panel below bell icon

### 3.7 Update App.jsx

**File:** `pos-phone/src/App.jsx`

**Changes:**
1. Import `NotificationProvider` from notification store
2. Wrap app content with `<NotificationProvider>`

---

## Phase 4: Real-time Updates

### 4.1 Polling Strategy

- **Unread Count:** Poll every 30 seconds via `notification.store.jsx`
- **Notification List:** Fetch on demand (when dropdown opens or page loads)
- **After Actions:** Refresh unread count after:
  - Creating order/purchase/expense
  - Login/logout
  - Manual refresh

### 4.2 Future Enhancement (Optional)

If real-time push is needed later:
- Add Socket.io server to backend
- Emit events on notification creation
- Frontend subscribes to events
- Update state immediately without polling

---

## Implementation Order

### Step 1: Database
1. Create `database/notifications.sql`
2. Run migration to create table
3. Add permissions to `database/role permissions.sql`

### Step 2: Backend Core
1. Create `notification.repository.js`
2. Create `notification.service.js`
3. Create `notification.controller.js`
4. Create `notification.route.js`
5. Register route in `index.js`

### Step 3: Backend Integration
1. Integrate with `order.service.js`
2. Integrate with `purchase.service.js`
3. Integrate with `expense.service.js`
4. Integrate with `stock.service.js`
5. Integrate with `auth.service.js`

### Step 4: Frontend Core
1. Create `notificationApi.js`
2. Create `useNotification.js`
3. Create `notification.store.jsx`

### Step 5: Frontend UI
1. Create `NotificationItem.jsx`
2. Create `NotificationDropdown.jsx`
3. Update `Navbar.jsx`
4. Update `App.jsx`

### Step 6: Testing
1. Test API endpoints with Postman/curl
2. Test frontend notification display
3. Test real-time polling
4. Test integration with business events
5. Run `npm run lint` in `pos-phone/`

---

## API Endpoints Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/notifications | Yes | Get user notifications (paginated) |
| GET | /api/notifications/unread-count | Yes | Get unread count |
| PUT | /api/notifications/:id/read | Yes | Mark single as read |
| PUT | /api/notifications/read-all | Yes | Mark all as read |
| DELETE | /api/notifications/:id | Yes | Delete single notification |
| DELETE | /api/notifications/all | Yes | Delete all user notifications |

---

## Notification Types and Messages

### Order Notifications
- **Type:** `order`
- **Title:** "New Order Created"
- **Message:** "Order #123 has been created by John. Total: $150.00"

### Purchase Notifications
- **Type:** `purchase`
- **Title:** "New Purchase Recorded"
- **Message:** "Purchase #456 has been recorded by Jane. Total: $500.00"

### Expense Notifications
- **Type:** `expense`
- **Title:** "New Expense Added"
- **Message:** "Expense #789 has been added by Mike. Amount: $50.00"

### Stock Notifications
- **Type:** `stock`
- **Title:** "Low Stock Alert"
- **Message:** "Product 'iPhone 15' is running low. Current: 3, Minimum: 10"

### Auth Notifications
- **Type:** `auth`
- **Title:** "Login Alert"
- **Message:** "Successful login from 192.168.1.1"

---

## Files to Create

### Backend
1. `database/notifications.sql`
2. `api-node/src/repositories/notification.repository.js`
3. `api-node/src/services/notification.service.js`
4. `api-node/src/controller/notification.controller.js`
5. `api-node/src/routes/notification.route.js`

### Frontend
1. `pos-phone/src/api/notificationApi.js`
2. `pos-phone/src/hooks/useNotification.js`
3. `pos-phone/src/store/notification.store.jsx`
4. `pos-phone/src/components/notification/NotificationDropdown.jsx`
5. `pos-phone/src/components/notification/NotificationItem.jsx`

## Files to Modify

### Backend
1. `api-node/index.js` - Register notification route
2. `api-node/src/services/order.service.js` - Add notification trigger
3. `api-node/src/services/purchase.service.js` - Add notification trigger
4. `api-node/src/services/expense.service.js` - Add notification trigger
5. `api-node/src/services/stock.service.js` - Add in-app notification
6. `api-node/src/services/auth.service.js` - Add notification trigger
7. `database/role permissions.sql` - Add notification permissions

### Frontend
1. `pos-phone/src/App.jsx` - Wrap with NotificationProvider
2. `pos-phone/src/components/layout/Navbar.jsx` - Add notification dropdown

---

## Conventions to Follow

### Backend
- Use CommonJS (`require`, `module.exports`)
- Use `asyncHandler` for all controllers
- Use `AppError` for business errors
- Use parameterized SQL (named or positional)
- Use response envelope `{ success, data, message }`
- Apply `validate_token()` to all routes
- Isolate notification errors with try/catch

### Frontend
- Use ES modules (`import`, `export default`)
- Use `useCallback` for stable references
- Use `request()` helper for API calls
- Check `res?.success` before using data
- Handle loading and error states
- Use Ant Design components where appropriate
- Follow existing component structure

---

## Testing Checklist

- [ ] Database migration runs successfully
- [ ] All API endpoints work with authentication
- [ ] Notifications are created for orders
- [ ] Notifications are created for purchases
- [ ] Notifications are created for expenses
- [ ] Notifications are created for low stock
- [ ] Notifications are created for login events
- [ ] Unread count updates in real-time
- [ ] Mark as read works correctly
- [ ] Mark all as read works correctly
- [ ] Delete notification works correctly
- [ ] Delete all notifications works correctly
- [ ] Dropdown displays notifications correctly
- [ ] Bell icon shows correct unread count
- [ ] Notification types display with correct icons
- [ ] Timestamps display correctly (relative)
- [ ] Frontend lint passes (`npm run lint`)
- [ ] No console errors in browser
- [ ] No backend errors in console

---

## Future Enhancements (Not in Scope)

1. **Email Notifications** - Send email for critical events
2. **Push Notifications** - Browser push notifications
3. **WebSocket Real-time** - Replace polling with Socket.io
4. **Notification Preferences** - Per-user notification settings
5. **Notification Sound** - Audio alert for new notifications
6. **Bulk Operations** - Select multiple notifications for batch actions
7. **Notification Search** - Search through notification history
8. **Export Notifications** - Export to CSV/PDF
