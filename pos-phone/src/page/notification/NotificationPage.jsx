import { useState, useEffect } from "react";
import { useNotification } from "../../hooks/useNotification";
import { useAlert } from "../../components/common/Alert";
import { useConfirm } from "../../hooks/useConfirm";
import ConfirmModal from "../../components/common/ConfirmModal";
import {
  FiBell,
  FiPlus,
  FiTrash2,
  FiCheck,
  FiX,
  FiSearch,
  FiShoppingBag,
  FiPackage,
  FiDollarSign,
  FiAlertTriangle,
  FiUser,
  FiClock,
  FiFilter,
} from "react-icons/fi";

const typeOptions = [
  { value: "order", label: "Order", icon: FiShoppingBag, color: "text-blue-500", bg: "bg-blue-50" },
  { value: "purchase", label: "Purchase", icon: FiPackage, color: "text-green-500", bg: "bg-green-50" },
  { value: "expense", label: "Expense", icon: FiDollarSign, color: "text-orange-500", bg: "bg-orange-50" },
  { value: "stock", label: "Stock", icon: FiAlertTriangle, color: "text-red-500", bg: "bg-red-50" },
  { value: "auth", label: "Auth", icon: FiUser, color: "text-purple-500", bg: "bg-purple-50" },
  { value: "system", label: "System", icon: FiBell, color: "text-gray-500", bg: "bg-gray-50" },
];

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

const NotificationPage = () => {
  const {
    notifications,
    loading,
    pagination,
    loadNotifications,
    addNotification,
    removeNotification,
    removeAllNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useNotification();

  const alert = useAlert();
  const { showConfirm, config, setLoading: setConfirmLoading } = useConfirm();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ title: "", message: "", type: "system" });
  const [filter, setFilter] = useState({ type: "", is_read: "", search: "" });

  useEffect(() => {
    loadNotifications({ limit: 20 });
  }, [loadNotifications]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      alert.warning("Title is required", { description: "Please enter a notification title." });
      return;
    }
    if (!form.message.trim()) {
      alert.warning("Message is required", { description: "Please enter a notification message." });
      return;
    }

    try {
      const loadingId = alert.showAlert({
        type: "info",
        message: "Creating notification...",
        description: "Please wait...",
        duration: 0,
        closable: false,
      });

      const res = await addNotification(form);
      alert.hideAlert(loadingId);

      if (res?.success) {
        setForm({ title: "", message: "", type: "system" });
        setIsModalOpen(false);
        await loadNotifications({ limit: 20 });
        alert.success("Notification created successfully!", {
          description: `"${form.title}" has been sent.`,
        });
      } else {
        alert.error("Failed to create notification", {
          description: res?.message || "Please try again.",
        });
      }
    } catch (error) {
      alert.error("An error occurred", {
        description: error.message || "Please try again later.",
      });
    }
  };

  const handleDelete = async (notification) => {
    const confirmed = await showConfirm({
      title: "Delete Notification",
      message: `Are you sure you want to delete "${notification.title}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "danger",
      icon: FiTrash2,
    });

    if (!confirmed) return;

    setConfirmLoading(true);
    try {
      const loadingId = alert.showAlert({
        type: "info",
        message: `Deleting "${notification.title}"...`,
        description: "Please wait...",
        duration: 0,
        closable: false,
      });

      const res = await removeNotification(notification.id);
      alert.hideAlert(loadingId);

      if (res?.success) {
        await loadNotifications({ limit: 20, ...filter });
        alert.success("Notification deleted successfully!", {
          description: `"${notification.title}" has been removed.`,
        });
      } else {
        alert.error("Failed to delete notification", {
          description: res?.message || "Please try again.",
        });
      }
    } catch (error) {
      alert.error("An error occurred while deleting", {
        description: error.message || "Please try again later.",
      });
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    if (notifications.length === 0) return;

    const confirmed = await showConfirm({
      title: "Delete All Notifications",
      message: "Are you sure you want to delete all notifications? This action cannot be undone.",
      confirmText: "Delete All",
      cancelText: "Cancel",
      type: "danger",
      icon: FiTrash2,
    });

    if (!confirmed) return;

    setConfirmLoading(true);
    try {
      const loadingId = alert.showAlert({
        type: "info",
        message: "Deleting all notifications...",
        description: "Please wait...",
        duration: 0,
        closable: false,
      });

      const res = await removeAllNotifications();
      alert.hideAlert(loadingId);

      if (res?.success) {
        await loadNotifications({ limit: 20 });
        alert.success("All notifications deleted!", {
          description: "All notifications have been removed.",
        });
      }
    } catch (error) {
      alert.error("An error occurred", {
        description: error.message || "Please try again later.",
      });
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    const res = await markAllNotificationsAsRead();
    if (res?.success) {
      await loadNotifications({ limit: 20, ...filter });
      alert.success("All marked as read!", { description: "All notifications marked as read." });
    }
  };

  const handleMarkRead = async (id) => {
    await markNotificationAsRead(id);
  };

  const getTypeConfig = (type) => {
    return typeOptions.find((t) => t.value === type) || typeOptions[5];
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter.search) {
      const s = filter.search.toLowerCase();
      if (!n.title?.toLowerCase().includes(s) && !n.message?.toLowerCase().includes(s)) {
        return false;
      }
    }
    if (filter.type && n.type !== filter.type) return false;
    if (filter.is_read !== "" && filter.is_read !== undefined) {
      const readVal = filter.is_read === "1" ? 1 : 0;
      if (n.is_read !== readVal) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center">
                <FiBell className="w-5 h-5 text-white" />
              </div>
              Notifications
            </h1>
            <p className="text-sm text-gray-500 mt-1 ml-13">
              {loading ? "Loading..." : `${notifications.length} notifications total`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <>
                <button
                  onClick={handleMarkAllRead}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg border border-gray-200 transition-colors"
                >
                  <FiCheck className="w-4 h-4" />
                  Mark All Read
                </button>
                <button
                  onClick={handleDeleteAll}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-red-50 text-red-600 text-sm font-medium rounded-lg border border-gray-200 hover:border-red-200 transition-colors"
                >
                  <FiTrash2 className="w-4 h-4" />
                  Delete All
                </button>
              </>
            )}
            <button
              onClick={() => {
                setIsModalOpen(true);
                setForm({ title: "", message: "", type: "system" });
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-black hover:bg-gray-800 text-white rounded-lg transition-all shadow-sm text-sm font-medium"
            >
              <FiPlus className="w-4 h-4" />
              Add Notification
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5 mb-6 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Search</label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={filter.search}
                  onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
              <select
                value={filter.type}
                onChange={(e) => setFilter({ ...filter, type: e.target.value })}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white"
              >
                <option value="">All Types</option>
                {typeOptions.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
              <select
                value={filter.is_read}
                onChange={(e) => setFilter({ ...filter, is_read: e.target.value })}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white"
              >
                <option value="">All</option>
                <option value="0">Unread</option>
                <option value="1">Read</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notification List */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          {loading && notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent"></div>
              <p className="text-sm text-gray-500 mt-3">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-16">
              <FiBell className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">No notifications found</p>
              <p className="text-sm text-gray-400 mt-1">
                {filter.search || filter.type || filter.is_read
                  ? "Try adjusting your filters"
                  : "Click 'Add Notification' to create one"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredNotifications.map((notification) => {
                const typeConfig = getTypeConfig(notification.type);
                const Icon = typeConfig.icon;
                return (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-4 p-4 sm:p-5 transition-colors ${
                      notification.is_read ? "bg-white hover:bg-gray-50" : "bg-blue-50/30 hover:bg-blue-50/50"
                    }`}
                  >
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${typeConfig.bg}`}>
                      <Icon className={`w-5 h-5 ${typeConfig.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className={`text-sm font-medium ${notification.is_read ? "text-gray-600" : "text-gray-900"}`}>
                              {notification.title}
                            </p>
                            {!notification.is_read && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-0.5">{notification.message}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${typeConfig.bg} ${typeConfig.color}`}>
                              {typeConfig.label}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-gray-400">
                              <FiClock className="w-3 h-3" />
                              {formatTime(notification.created_at)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {!notification.is_read && (
                            <button
                              onClick={() => handleMarkRead(notification.id)}
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Mark as read"
                            >
                              <FiCheck className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(notification)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer */}
          {filteredNotifications.length > 0 && (
            <div className="px-4 sm:px-6 py-3 bg-gray-50 border-t border-gray-200">
              <span className="text-sm text-gray-600">
                Showing <span className="font-medium">{filteredNotifications.length}</span> of{" "}
                <span className="font-medium">{notifications.length}</span> notifications
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Create Notification Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg rounded-lg shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Add New Notification</h3>
                <p className="text-sm text-gray-500 mt-0.5">Create a new notification</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600 flex items-center justify-center"
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider mb-1.5">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="e.g. Low Stock Alert"
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider mb-1.5">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Enter notification message..."
                    rows="3"
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all resize-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider mb-1.5">
                    Type
                  </label>
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-white"
                  >
                    {typeOptions.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-sm text-gray-600 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-black hover:bg-gray-800 text-white rounded-lg transition-all duration-200 text-sm font-medium shadow-sm flex items-center gap-2"
                >
                  <FiPlus size={16} />
                  Create Notification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={config.isOpen}
        onClose={config.onCancel || (() => {})}
        onConfirm={config.onConfirm}
        title={config.title}
        message={config.message}
        confirmText={config.confirmText}
        cancelText={config.cancelText}
        type={config.type}
        icon={config.icon}
        loading={config.loading}
      />
    </div>
  );
};

export default NotificationPage;
