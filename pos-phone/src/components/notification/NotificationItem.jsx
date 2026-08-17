import {
  FiShoppingBag,
  FiPackage,
  FiDollarSign,
  FiAlertTriangle,
  FiUser,
  FiBell,
  FiTrash2,
} from "react-icons/fi";

const typeConfig = {
  order: {
    icon: FiShoppingBag,
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  purchase: {
    icon: FiPackage,
    color: "text-green-500",
    bg: "bg-green-50",
  },
  expense: {
    icon: FiDollarSign,
    color: "text-orange-500",
    bg: "bg-orange-50",
  },
  stock: {
    icon: FiAlertTriangle,
    color: "text-red-500",
    bg: "bg-red-50",
  },
  auth: {
    icon: FiUser,
    color: "text-purple-500",
    bg: "bg-purple-50",
  },
  system: {
    icon: FiBell,
    color: "text-gray-500",
    bg: "bg-gray-50",
  },
};

const formatTime = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString();
};

const NotificationItem = ({ notification, onMarkAsRead, onDelete }) => {
  const config = typeConfig[notification.type] || typeConfig.system;
  const Icon = config.icon;

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer ${
        notification.is_read
          ? "bg-white hover:bg-gray-50"
          : "bg-blue-50/50 hover:bg-blue-50"
      }`}
      onClick={() => !notification.is_read && onMarkAsRead(notification.id)}
    >
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${config.bg}`}
      >
        <Icon className={`w-4 h-4 ${config.color}`} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={`text-sm font-medium ${
              notification.is_read ? "text-gray-600" : "text-gray-900"
            }`}
          >
            {notification.title}
          </p>
          {!notification.is_read && (
            <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-1.5" />
          )}
        </div>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
          {notification.message}
        </p>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-xs text-gray-400">
            {formatTime(notification.created_at)}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(notification.id);
            }}
            className="text-gray-400 hover:text-red-500 transition-colors p-0.5"
          >
            <FiTrash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
