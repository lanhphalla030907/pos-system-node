import { useState, useCallback } from "react";
import {
  getNotifications,
  getUnreadCount,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
} from "../api/notificationApi";

export const useNotification = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10,
  });

  const loadNotifications = useCallback(async (filter = {}) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getNotifications(filter);
      if (res?.success) {
        setNotifications(res.data || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      } else {
        setNotifications([]);
      }
      return res;
    } catch (err) {
      console.error("Error loading notifications:", err);
      setError(err.message);
      setNotifications([]);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUnreadCount = useCallback(async () => {
    try {
      const res = await getUnreadCount();
      if (res?.success) {
        setUnreadCount(res.data?.count || 0);
      }
      return res;
    } catch (err) {
      console.error("Error loading unread count:", err);
      return { success: false, message: err.message };
    }
  }, []);

  const addNotification = useCallback(async (data) => {
    try {
      const res = await createNotification(data);
      return res;
    } catch (err) {
      console.error("Error creating notification:", err);
      return { success: false, message: err.message };
    }
  }, []);

  const markNotificationAsRead = useCallback(async (id) => {
    try {
      const res = await markAsRead(id);
      if (res?.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      return res;
    } catch (err) {
      console.error("Error marking notification as read:", err);
      return { success: false, message: err.message };
    }
  }, []);

  const markAllNotificationsAsRead = useCallback(async () => {
    try {
      const res = await markAllAsRead();
      if (res?.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
        setUnreadCount(0);
      }
      return res;
    } catch (err) {
      console.error("Error marking all as read:", err);
      return { success: false, message: err.message };
    }
  }, []);

  const removeNotification = useCallback(async (id) => {
    try {
      const res = await deleteNotification(id);
      if (res?.success) {
        setNotifications((prev) => {
          const removed = prev.find((n) => n.id === id);
          if (removed && !removed.is_read) {
            setUnreadCount((prev) => Math.max(0, prev - 1));
          }
          return prev.filter((n) => n.id !== id);
        });
      }
      return res;
    } catch (err) {
      console.error("Error deleting notification:", err);
      return { success: false, message: err.message };
    }
  }, []);

  const removeAllNotifications = useCallback(async () => {
    try {
      const res = await deleteAllNotifications();
      if (res?.success) {
        setNotifications([]);
        setUnreadCount(0);
      }
      return res;
    } catch (err) {
      console.error("Error deleting all notifications:", err);
      return { success: false, message: err.message };
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    pagination,
    loadNotifications,
    loadUnreadCount,
    addNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    removeNotification,
    removeAllNotifications,
    clearError,
  };
};
