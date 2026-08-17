import { request } from "../util/helper";

export const getNotifications = async (filter = {}) => {
  const params = new URLSearchParams();
  Object.keys(filter).forEach((key) => {
    if (filter[key] !== "" && filter[key] !== undefined && filter[key] !== null) {
      params.append(key, filter[key]);
    }
  });
  const queryString = params.toString();
  const url = queryString ? `notifications?${queryString}` : "notifications";
  return await request(url, "get");
};

export const getUnreadCount = async () => {
  return await request("notifications/unread-count", "get");
};

export const createNotification = async (data) => {
  return await request("notifications", "post", data);
};

export const markAsRead = async (id) => {
  return await request(`notifications/${id}/read`, "put");
};

export const markAllAsRead = async () => {
  return await request("notifications/read-all", "put");
};

export const deleteNotification = async (id) => {
  return await request(`notifications/${id}`, "delete");
};

export const deleteAllNotifications = async () => {
  return await request("notifications/all", "delete");
};
